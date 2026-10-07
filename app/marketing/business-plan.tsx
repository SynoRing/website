"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { planSnippets, planTemplate } from "../bp/outline";
import { api, formatDate, message, type Notify } from "./api";

type Row = Record<string, string>;
type Recipient = Row & { viewers: Row[] };
type Overview = {
  draft: Row;
  versions: Row[];
  recipients: Recipient[];
  nextNumber: number;
  url: string;
  limits: { partBytes: number; maxBytes: number };
};
type Section = "editor" | "versions" | "recipients";
type Props = {
  data: Overview;
  reload: () => Promise<void>;
  onNotice: Notify;
};

const megabytes = (bytes: number | string) =>
  `${(Number(bytes) / 1024 / 1024).toFixed(1)} MB`;

const day = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const versionName = (version: Row) => `v${version.number} · ${day(version.publishedAt)}`;

/** The version a recipient sees: their pinned one if it still exists,
    otherwise the latest. */
const shownVersion = (recipient: Row, versions: Row[]) =>
  versions.find((version) => version.id === recipient.versionId) ?? versions[0];

/* The business plan at /bp: write it, publish numbered versions, and give
   each recipient a password and a version. */
export function BusinessPlanView({ onNotice }: { onNotice: Notify }) {
  const [data, setData] = useState<Overview | null>(null);
  const [section, setSection] = useState<Section>("editor");

  async function reload() {
    try {
      setData(await api("bp"));
    } catch (error) {
      onNotice({ tone: "error", text: message(error) });
    }
  }
  useEffect(() => {
    reload();
  }, []);

  if (!data) return <p className="mk-empty">Loading…</p>;
  const latest = data.versions[0];
  const sections: [Section, string][] = [
    ["editor", "Editor"],
    ["versions", `Versions (${data.versions.length})`],
    ["recipients", `Recipients (${data.recipients.length})`],
  ];
  const props = { data, reload, onNotice };

  return (
    <section className="mk-plan" aria-label="Business plan">
      <div className="mk-plan-top">
        <div className="mk-segments" role="group" aria-label="Business plan">
          {sections.map(([value, label]) => (
            <button
              key={value}
              aria-pressed={section === value}
              onClick={() => setSection(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mk-hint">
          Recipients open{" "}
          <a href="/bp" target="_blank" rel="noopener">
            {data.url.replace("https://", "")}
          </a>{" "}
          with their own password.{" "}
          {latest
            ? `Latest: version ${latest.number}, ${day(latest.publishedAt)}.`
            : "Nothing published yet."}
        </p>
      </div>
      {section === "editor" && (
        <PlanEditor {...props} onPublished={() => setSection("versions")} />
      )}
      {section === "versions" && (
        <VersionList {...props} onEdit={() => setSection("editor")} />
      )}
      {section === "recipients" && <RecipientList {...props} />}
    </section>
  );
}

function PlanEditor({
  data,
  reload,
  onNotice,
  onPublished,
}: Props & { onPublished: () => void }) {
  const fresh = !data.draft.updatedAt && !data.versions.length;
  const [html, setHtml] = useState(fresh ? planTemplate : (data.draft.html ?? ""));
  const [note, setNote] = useState(data.draft.note ?? "");
  const [saved, setSaved] = useState(!fresh);
  const [busy, setBusy] = useState<"" | "save" | "publish" | "pdf">("");
  const [uploading, setUploading] = useState("");
  const [width, setWidth] = useState<"desktop" | "mobile">("desktop");
  const area = useRef<HTMLTextAreaElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const draft = data.draft;
  const fail = (error: unknown) => onNotice({ tone: "error", text: message(error) });

  // Unsaved edits survive switching sections, and leaving asks first.
  useEffect(() => {
    if (saved) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [saved]);

  const edit = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setSaved(false);
  };

  function insert(snippet: string) {
    const element = area.current;
    if (!element) return;
    const { selectionStart: start, selectionEnd: end, value } = element;
    edit(setHtml)(`${value.slice(0, start)}${snippet}${value.slice(end)}`);
    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(start, start + snippet.length);
    });
  }

  async function startFrom(choice: string) {
    if (!saved && !confirm("Replace the draft? Unsaved changes will be lost.")) return;
    try {
      if (choice === "template") {
        setHtml(planTemplate);
        setSaved(false);
        return;
      }
      const { draft } = await api("bp/draft", "PUT", { fromVersion: choice });
      setHtml(draft.html ?? "");
      setNote("");
      setSaved(true);
      await reload();
      onNotice({ tone: "ok", text: "The draft is now a copy of that version, PDF included." });
    } catch (error) {
      fail(error);
    }
  }

  async function save() {
    setBusy("save");
    try {
      await api("bp/draft", "PUT", { html, note });
      setSaved(true);
      await reload();
      return true;
    } catch (error) {
      fail(error);
      return false;
    } finally {
      setBusy("");
    }
  }

  async function publish() {
    if (
      !confirm(
        `Publish this draft as version ${data.nextNumber}? Recipients set to the latest version see it right away.`,
      )
    )
      return;
    if (!saved && !(await save())) return;
    setBusy("publish");
    try {
      const { version } = await api("bp/versions", "POST");
      await reload();
      onNotice({ tone: "ok", text: `Version ${version.number} is published.` });
      onPublished();
    } catch (error) {
      fail(error);
    } finally {
      setBusy("");
    }
  }

  // Sends the file in parts that each fit in one request, then attaches it.
  async function upload(file: File) {
    const { partBytes, maxBytes } = data.limits;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))
      return fail(new Error("Choose a PDF file."));
    if (file.size > maxBytes) return fail(new Error(`PDFs can be up to ${megabytes(maxBytes)}.`));
    const id = crypto.randomUUID();
    const parts = Math.ceil(file.size / partBytes);
    setBusy("pdf");
    try {
      for (let index = 0; index < parts; index++) {
        setUploading(`Uploading ${Math.round((index / parts) * 100)}%`);
        const response = await fetch(`/api/marketing/bp/pdf?upload=${id}&index=${index}`, {
          method: "PUT",
          headers: { "content-type": "application/octet-stream" },
          body: file.slice(index * partBytes, (index + 1) * partBytes),
        });
        if (response.status === 401) location.reload();
        if (!response.ok) {
          const result = await response.json().catch(() => ({}));
          throw new Error(
            result.error === "not_pdf" ? "That file isn’t a PDF." : `Upload failed (${response.status}).`,
          );
        }
      }
      setUploading("Attaching");
      await api("bp/pdf", "POST", { upload: id, name: file.name, size: file.size, parts });
      await reload();
      onNotice({ tone: "ok", text: `${file.name} is attached to the draft.` });
    } catch (error) {
      fail(error);
    } finally {
      setBusy("");
      setUploading("");
      if (picker.current) picker.current.value = "";
    }
  }

  async function removePdf() {
    if (!confirm("Take the PDF off the draft? Published versions keep theirs.")) return;
    try {
      await api("bp/pdf", "DELETE");
      await reload();
    } catch (error) {
      fail(error);
    }
  }

  return (
    <div className="mk-compose">
      <div className="mk-editor">
        <div className="mk-draft-bar">
          <select aria-label="Start from" value="" onChange={(event) => startFrom(event.target.value)}>
            <option value="" disabled>
              Start from…
            </option>
            <option value="template">Outline template</option>
            {data.versions.length > 0 && (
              <optgroup label="A published version">
                {data.versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    Version {versionName(version)}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <span className="mk-draft-status">
            {saved
              ? draft.updatedAt
                ? `Draft saved ${formatDate(draft.updatedAt)}`
                : "Draft"
              : "Unsaved changes"}
          </span>
        </div>

        <div className="mk-field">
          <span id="mk-plan-label">Web version (HTML)</span>
          <div className="mk-snippets" role="group" aria-label="Insert">
            {planSnippets.map(([label, snippet]) => (
              <button key={label} onClick={() => insert(snippet)}>
                + {label}
              </button>
            ))}
          </div>
          <textarea
            ref={area}
            aria-labelledby="mk-plan-label"
            spellCheck={false}
            value={html}
            onChange={(event) => edit(setHtml)(event.target.value)}
          />
          <p className="mk-hint">
            Plain tags take the plan’s style. <code>class="lede"</code>,{" "}
            <code>class="metrics"</code>, and <code>class="callout"</code> make an
            intro, key numbers, and a highlight; a page break only shows when saved
            as a PDF. Scripts and embedded frames are removed.
          </p>
        </div>

        <div className="mk-field">
          <span>PDF version</span>
          <div className="mk-pdf-row">
            <p>
              {draft.pdfUpload
                ? `${draft.pdfName} · ${megabytes(draft.pdfSize)}`
                : "None. Viewers can save the web version as a PDF."}
            </p>
            <div className="mk-inline">
              {draft.pdfUpload && (
                <>
                  <a
                    className="mk-quiet mk-link-button"
                    href="/api/marketing/bp/pdf?version=draft"
                    target="_blank"
                    rel="noopener"
                  >
                    View
                  </a>
                  <button className="mk-quiet" onClick={removePdf} disabled={busy !== ""}>
                    Remove
                  </button>
                </>
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
                className="mk-quiet"
                disabled={busy !== ""}
                onClick={() => picker.current?.click()}
              >
                {uploading ? `${uploading}…` : draft.pdfUpload ? "Replace" : "Upload PDF"}
              </button>
            </div>
          </div>
        </div>

        <div className="mk-send">
          <label className="mk-field">
            <span>What changed</span>
            <input
              value={note}
              maxLength={500}
              placeholder="Optional, shown in Versions"
              onChange={(event) => edit(setNote)(event.target.value)}
            />
          </label>
          <div className="mk-inline">
            <button className="mk-quiet" onClick={save} disabled={busy !== "" || saved}>
              {busy === "save" ? "Saving…" : "Save draft"}
            </button>
            <a
              className="mk-quiet mk-link-button"
              href="/marketing/plan/draft"
              target="_blank"
              rel="noopener"
              aria-disabled={!saved}
              onClick={(event) => {
                if (!saved) {
                  event.preventDefault();
                  onNotice({ tone: "error", text: "Save the draft to preview it in full." });
                }
              }}
            >
              Full preview
            </a>
            <button
              className="button button-small button-dark"
              onClick={publish}
              disabled={busy !== "" || (!html.trim() && !draft.pdfUpload)}
            >
              {busy === "publish" ? "Publishing…" : `Publish as version ${data.nextNumber}`}
            </button>
          </div>
        </div>
      </div>

      <div className="mk-preview">
        <div className="mk-preview-bar">
          <div className="mk-inbox-line">
            <strong>Web version preview</strong>
          </div>
          <div className="mk-segments" role="group" aria-label="Preview width">
            <button aria-pressed={width === "desktop"} onClick={() => setWidth("desktop")}>
              Desktop
            </button>
            <button aria-pressed={width === "mobile"} onClick={() => setWidth("mobile")}>
              Phone
            </button>
          </div>
        </div>
        <div className={`mk-plan-preview mk-plan-preview-${width}`}>
          <article className="bp-doc" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </div>
  );
}

function VersionList({ data, reload, onNotice, onEdit }: Props & { onEdit: () => void }) {
  const { versions, recipients } = data;
  const fail = (error: unknown) => onNotice({ tone: "error", text: message(error) });

  async function edit(version: Row) {
    if (
      !confirm(
        `Replace the draft with a copy of version ${version.number}? Unsaved changes in the editor will be lost.`,
      )
    )
      return;
    try {
      await api("bp/draft", "PUT", { fromVersion: version.id });
      await reload();
      onEdit();
    } catch (error) {
      fail(error);
    }
  }

  async function remove(version: Row) {
    if (
      !confirm(
        `Delete version ${version.number}? Recipients who see it will see the latest version instead.`,
      )
    )
      return;
    try {
      await api("bp/versions", "DELETE", { id: version.id });
      await reload();
    } catch (error) {
      fail(error);
    }
  }

  if (!versions.length)
    return (
      <p className="mk-empty">
        No versions yet. Write the plan in the editor and publish it.
      </p>
    );
  return (
    <div className="mk-campaigns">
      {versions.map((version, index) => {
        const seenBy = recipients.filter(
          (recipient) => shownVersion(recipient, versions)?.id === version.id,
        );
        const formats = [
          version.html?.trim() && "Web",
          version.pdfUpload && `PDF (${megabytes(version.pdfSize)})`,
        ].filter(Boolean);
        return (
          <article key={version.id} className="mk-panel mk-recipient">
            <div className="mk-campaign-head">
              <div>
                <h3>
                  Version {version.number}
                  {index === 0 && <span className="mk-tag mk-tag-ok">Latest</span>}
                </h3>
                <p>
                  Published {formatDate(version.publishedAt)} · {formats.join(" + ")}
                </p>
                {version.note && <p className="mk-note">{version.note}</p>}
                <p>
                  {seenBy.length
                    ? `Shown to ${seenBy.map((recipient) => recipient.label).join(", ")}`
                    : "Not shown to anyone"}
                </p>
              </div>
              <div className="mk-inline mk-wrap">
                <a
                  className="mk-quiet mk-link-button"
                  href={`/marketing/plan/${version.id}`}
                  target="_blank"
                  rel="noopener"
                >
                  Preview
                </a>
                <button className="mk-quiet" onClick={() => edit(version)}>
                  Edit as new draft
                </button>
                <button className="mk-quiet" onClick={() => remove(version)}>
                  Delete
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function VersionSelect({
  value,
  versions,
  onChange,
  label,
}: {
  value: string;
  versions: Row[];
  onChange: (value: string) => void;
  label: string;
}) {
  const known = versions.some((version) => version.id === value) ? value : "";
  return (
    <select aria-label={label} value={known} onChange={(event) => onChange(event.target.value)}>
      <option value="">
        Latest{versions[0] ? ` (v${versions[0].number})` : ""}
      </option>
      {versions.map((version) => (
        <option key={version.id} value={version.id}>
          {versionName(version)}
        </option>
      ))}
    </select>
  );
}

function RecipientList({ data, reload, onNotice }: Props) {
  const { versions, recipients, url } = data;
  const [label, setLabel] = useState("");
  const [password, setPassword] = useState("");
  const [versionId, setVersionId] = useState("");
  const [busy, setBusy] = useState(false);
  const fail = (error: unknown) => onNotice({ tone: "error", text: message(error) });

  async function create(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const { recipient } = await api("bp", "POST", { label, password, versionId });
      await reload();
      setLabel("");
      setPassword("");
      setVersionId("");
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

  async function update(recipient: Recipient, changes: { revoked?: boolean; versionId?: string }) {
    if (
      changes.revoked &&
      !confirm(
        `Turn off ${recipient.label}’s password? Anyone viewing through it loses access right away.`,
      )
    )
      return;
    try {
      await api("bp", "PATCH", { id: recipient.id, ...changes });
      await reload();
      if (changes.versionId !== undefined)
        onNotice({ tone: "ok", text: `${recipient.label} now sees ${changes.versionId ? "the chosen version" : "the latest version"}.` });
    } catch (error) {
      fail(error);
    }
  }

  async function remove(recipient: Recipient) {
    if (
      !confirm(
        `Delete ${recipient.label} and the record of their visits? This can’t be undone.`,
      )
    )
      return;
    try {
      await api("bp", "DELETE", { id: recipient.id });
      await reload();
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

  const invite = (recipient: Recipient) =>
    `Here is the SynoRing business plan, shared with you in confidence:\n${url}\nPassword: ${recipient.password}`;

  return (
    <div className="mk-plan">
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
          <label className="mk-field">
            <span>Version</span>
            <VersionSelect
              label="Version"
              value={versionId}
              versions={versions}
              onChange={setVersionId}
            />
          </label>
          <button className="button button-small button-dark" disabled={busy}>
            {busy ? "Creating…" : "Create password"}
          </button>
        </div>
      </form>

      {!recipients.length && (
        <p className="mk-empty">
          No recipients yet. Create a password for each person or firm you send
          the plan to.
        </p>
      )}
      {recipients.map((recipient) => {
        const shown = shownVersion(recipient, versions);
        return (
          <article key={recipient.id} className="mk-panel mk-recipient">
            <div className="mk-campaign-head">
              <div>
                <h3>
                  {recipient.label}
                  {recipient.revokedAt && <span className="mk-tag">Turned off</span>}
                </h3>
                <p>
                  <code className="mk-password">{recipient.password}</code> · created{" "}
                  {day(recipient.createdAt)} · {recipient.views ?? 0}{" "}
                  {recipient.views === "1" ? "view" : "views"}
                  {recipient.lastViewedAt &&
                    ` · last viewed ${formatDate(recipient.lastViewedAt)}`}
                </p>
              </div>
              <div className="mk-inline mk-wrap">
                <VersionSelect
                  label={`Version for ${recipient.label}`}
                  value={recipient.versionId ?? ""}
                  versions={versions}
                  onChange={(value) => update(recipient, { versionId: value })}
                />
                <button
                  className="mk-quiet"
                  onClick={() => copy(invite(recipient), "Link and password")}
                >
                  Copy invite
                </button>
                <button
                  className="mk-quiet"
                  onClick={() => update(recipient, { revoked: !recipient.revokedAt })}
                >
                  {recipient.revokedAt ? "Turn on" : "Turn off"}
                </button>
                <button className="mk-quiet" onClick={() => remove(recipient)}>
                  Delete
                </button>
              </div>
            </div>
            {!shown && (
              <p className="mk-hint">Nothing is published yet, so this password opens an empty page.</p>
            )}
            {recipient.viewers.length ? (
              <div className="mk-table-wrap mk-viewers">
                <table className="mk-table">
                  <thead>
                    <tr>
                      <th>Accepted terms</th>
                      <th>Location</th>
                      <th>Last version seen</th>
                      <th>Views</th>
                      <th>Last viewed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipient.viewers.map((viewer) => (
                      <tr key={viewer.id}>
                        <td className="mk-email">{formatDate(viewer.acceptedAt)}</td>
                        <td>{[viewer.country, viewer.ip].filter(Boolean).join(" · ") || "—"}</td>
                        <td>{viewer.lastVersion ? `v${viewer.lastVersion}` : "—"}</td>
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
        );
      })}
    </div>
  );
}
