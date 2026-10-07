"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { api, formatDate, message, type Notify } from "./api";

type Row = Record<string, string>;
type Recipient = Row & { viewers: Row[] };
type Overview = {
  document: Row | null;
  recipients: Recipient[];
  url: string;
  limits: { partBytes: number; maxBytes: number };
};

const megabytes = (bytes: number | string) =>
  `${(Number(bytes) / 1024 / 1024).toFixed(1)} MB`;

/* The business plan at /bp: the PDF, one password per recipient, and who
   accepted the terms and opened it through each. */
export function BusinessPlanView({ onNotice }: { onNotice: Notify }) {
  const [data, setData] = useState<Overview | null>(null);
  const [label, setLabel] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const picker = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      setData(await api("bp"));
    } catch (error) {
      onNotice({ tone: "error", text: message(error) });
    }
  }
  useEffect(() => {
    load();
  }, []);

  const fail = (error: unknown) => onNotice({ tone: "error", text: message(error) });

  // Sends the file in parts that each fit in one request, then publishes it.
  async function upload(file: File) {
    if (!data) return;
    const { partBytes, maxBytes } = data.limits;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))
      return fail(new Error("Choose a PDF file."));
    if (file.size > maxBytes)
      return fail(new Error(`PDFs can be up to ${megabytes(maxBytes)}.`));
    const version = crypto.randomUUID();
    const parts = Math.ceil(file.size / partBytes);
    try {
      for (let index = 0; index < parts; index++) {
        setUploading(`Uploading ${Math.round((index / parts) * 100)}%`);
        const response = await fetch(
          `/api/marketing/bp/document?version=${version}&index=${index}`,
          {
            method: "PUT",
            headers: { "content-type": "application/octet-stream" },
            body: file.slice(index * partBytes, (index + 1) * partBytes),
          },
        );
        if (response.status === 401) location.reload();
        if (!response.ok) {
          const result = await response.json().catch(() => ({}));
          throw new Error(
            result.error === "not_pdf"
              ? "That file isn’t a PDF."
              : `Upload failed (${response.status}).`,
          );
        }
      }
      setUploading("Publishing");
      const { document } = await api("bp/document", "POST", {
        version,
        name: file.name,
        size: file.size,
        parts,
      });
      setData((current) => current && { ...current, document });
      onNotice({ tone: "ok", text: `${file.name} is now the business plan.` });
    } catch (error) {
      fail(error);
    } finally {
      setUploading(null);
      if (picker.current) picker.current.value = "";
    }
  }

  async function create(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const { recipient } = await api("bp", "POST", { label, password });
      setData(
        (current) =>
          current && { ...current, recipients: [recipient, ...current.recipients] },
      );
      setLabel("");
      setPassword("");
      onNotice({
        tone: "ok",
        text: `${recipient.label}’s password is ${recipient.password}. Copy the invite below to send it.`,
      });
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  }

  async function setRevoked(recipient: Recipient, revoked: boolean) {
    if (
      revoked &&
      !confirm(
        `Turn off ${recipient.label}’s password? Anyone viewing through it loses access right away.`,
      )
    )
      return;
    try {
      await api("bp", "PATCH", { id: recipient.id, revoked });
      await load();
    } catch (error) {
      fail(error);
    }
  }

  async function remove(recipient: Recipient) {
    if (
      !confirm(
        `Delete ${recipient.label} and the record of who viewed through it? This can’t be undone.`,
      )
    )
      return;
    try {
      await api("bp", "DELETE", { id: recipient.id });
      await load();
    } catch (error) {
      fail(error);
    }
  }

  async function copy(text: string, what: string) {
    try {
      await navigator.clipboard.writeText(text);
      onNotice({ tone: "ok", text: `${what} copied.` });
    } catch {
      fail(new Error("Couldn’t copy. Select the text instead."));
    }
  }

  if (!data) return <p className="mk-empty">Loading…</p>;
  const { document, recipients, url } = data;
  const invite = (recipient: Recipient) =>
    `Here is the SynoRing business plan, shared with you in confidence:\n${url}\nPassword: ${recipient.password}`;
  const accepted = recipients.reduce((sum, item) => sum + item.viewers.length, 0);

  return (
    <section className="mk-plan" aria-label="Business plan">
      <div className="mk-panel mk-plan-doc">
        <div>
          <h2>Plan PDF</h2>
          <p>
            {document
              ? `${document.name} · ${megabytes(document.size)} · uploaded ${formatDate(document.uploadedAt)}`
              : "Nothing uploaded yet. Until you upload it, recipients see that the plan is being updated."}
          </p>
          <p className="mk-hint">
            Recipients open{" "}
            <a href="/bp" target="_blank" rel="noopener">
              {url.replace("https://", "")}
            </a>{" "}
            and enter their own password. Uploading a new version keeps every
            link and password working.
          </p>
        </div>
        <div className="mk-inline">
          {document && (
            <a
              className="mk-quiet mk-link-button"
              href="/api/marketing/bp/document"
              target="_blank"
              rel="noopener"
            >
              Preview
            </a>
          )}
          <input
            ref={picker}
            type="file"
            accept="application/pdf,.pdf"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) upload(file);
            }}
          />
          <button
            className="button button-small button-dark"
            disabled={uploading !== null}
            onClick={() => picker.current?.click()}
          >
            {uploading ? `${uploading}…` : document ? "Upload new version" : "Upload PDF"}
          </button>
        </div>
      </div>

      <form className="mk-panel" onSubmit={create}>
        <h2>New recipient</h2>
        <div className="mk-plan-fields">
          <label className="mk-field">
            <span>Who it’s for</span>
            <input
              required
              maxLength={80}
              placeholder="e.g. Y Combinator"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
            />
          </label>
          <label className="mk-field">
            <span>Password</span>
            <input
              minLength={8}
              maxLength={64}
              placeholder="Generated if left blank"
              autoComplete="off"
              spellCheck={false}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button className="button button-small button-dark" disabled={busy}>
            {busy ? "Creating…" : "Create password"}
          </button>
        </div>
      </form>

      <div className="mk-plan-head">
        <h2>Recipients</h2>
        <span>
          {recipients.length} {recipients.length === 1 ? "recipient" : "recipients"} ·{" "}
          {accepted} {accepted === 1 ? "person" : "people"} accepted the terms
        </span>
        <button className="mk-quiet" onClick={load}>
          Refresh
        </button>
      </div>
      {!recipients.length && (
        <p className="mk-empty">
          No recipients yet. Create a password for each person or firm you send
          the plan to.
        </p>
      )}
      {recipients.map((recipient) => (
        <article key={recipient.id} className="mk-panel mk-recipient">
          <div className="mk-campaign-head">
            <div>
              <h3>
                {recipient.label}
                {recipient.revokedAt && <span className="mk-tag">Turned off</span>}
              </h3>
              <p>
                <code className="mk-password">{recipient.password}</code> · created{" "}
                {formatDate(recipient.createdAt)} · {recipient.views ?? 0}{" "}
                {recipient.views === "1" ? "open" : "opens"}
                {recipient.lastViewedAt &&
                  ` · last opened ${formatDate(recipient.lastViewedAt)}`}
              </p>
            </div>
            <div className="mk-inline mk-wrap">
              <button
                className="mk-quiet"
                onClick={() => copy(invite(recipient), "Link and password")}
              >
                Copy invite
              </button>
              <button
                className="mk-quiet"
                onClick={() => copy(recipient.password, "Password")}
              >
                Copy password
              </button>
              <button
                className="mk-quiet"
                onClick={() => setRevoked(recipient, !recipient.revokedAt)}
              >
                {recipient.revokedAt ? "Turn on" : "Turn off"}
              </button>
              <button className="mk-quiet" onClick={() => remove(recipient)}>
                Delete
              </button>
            </div>
          </div>
          {recipient.viewers.length ? (
            <div className="mk-table-wrap mk-viewers">
              <table className="mk-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Accepted terms</th>
                    <th>Location</th>
                    <th>Opens</th>
                    <th>Last opened</th>
                  </tr>
                </thead>
                <tbody>
                  {recipient.viewers.map((viewer) => (
                    <tr key={viewer.id}>
                      <td className="mk-email">{viewer.name}</td>
                      <td>{viewer.email}</td>
                      <td>{formatDate(viewer.acceptedAt)}</td>
                      <td>
                        {[viewer.country, viewer.ip].filter(Boolean).join(" · ") || "—"}
                      </td>
                      <td>{viewer.views ?? 0}</td>
                      <td>{formatDate(viewer.lastViewedAt) || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mk-hint">No one has opened the plan with this password yet.</p>
          )}
        </article>
      ))}
    </section>
  );
}
