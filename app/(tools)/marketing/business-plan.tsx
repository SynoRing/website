"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { planSnippets, planTemplate } from "../bp/outline";
import { api, formatDate, message, type Notify } from "./api";

type Row = Record<string, string>;
type Recipient = Row & { viewers: Row[] };
type Overview = {
  latest: Row;
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

const versionName = (version: Row) => `v${version.number} · ${day(version.lockedAt)}`;

/** The version a recipient is pinned to, if it still exists. Otherwise
    they see Latest. */
const pinnedVersion = (recipient: Row, versions: Row[]) =>
  versions.find((version) => version.id === recipient.versionId);

/* The business plan at /bp. Latest is the live plan: every saved edit
   reaches recipients who see Latest. Locking makes numbered versions that
   never change, and each recipient sees Latest or a version. */
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
  const sections: [Section, string][] = [
    ["editor", "Latest"],
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
          Each recipient gets their own link, like{" "}
          {data.url.replace("https://", "")}/k7pd3m, that opens the plan in one
          click. Latest is live: edits save as you type. Numbered versions are
          locked.
        </p>
      </div>
      {section === "editor" && (
        <PlanEditor {...props} onLocked={() => setSection("versions")} />
      )}
      {section === "versions" && (
        <VersionList {...props} onRestored={() => setSection("editor")} />
      )}
      {section === "recipients" && <RecipientList {...props} />}
    </section>
  );
}

function PlanEditor({ data, reload, onNotice, onLocked }: Props & { onLocked: () => void }) {
  const latest = data.latest;
  const [html, setHtml] = useState(latest.updatedAt ? (latest.html ?? "") : planTemplate);
  // "fresh" is the outline template, not saved until the first edit.
  const [status, setStatus] = useState<"fresh" | "saved" | "pending" | "saving" | "failed">(
    latest.updatedAt ? "saved" : "fresh",
  );
  const [savedAt, setSavedAt] = useState(latest.updatedAt ?? "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<"" | "lock" | "pdf">("");
  const [uploading, setUploading] = useState("");
  const [width, setWidth] = useState<"desktop" | "mobile">("desktop");
  const area = useRef<HTMLTextAreaElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const latestHtml = useRef(html);
  latestHtml.current = html;
  const fail = (error: unknown) => onNotice({ tone: "error", text: message(error) });
  const live = data.recipients.filter(
    (recipient) => !recipient.revokedAt && !pinnedVersion(recipient, data.versions),
  );

  async function save() {
    const sent = latestHtml.current;
    setStatus("saving");
    try {
      const { latest } = await api("bp/latest", "PUT", { html: sent });
      setSavedAt(latest.updatedAt);
      // Typing during the save leaves the newer text to save next.
      setStatus(latestHtml.current === sent ? "saved" : "pending");
      return true;
    } catch (error) {
      setStatus("failed");
      fail(error);
      return false;
    }
  }

  // Saves a moment after typing stops, so Latest stays live.
  useEffect(() => {
    if (status !== "pending") return;
    const timer = setTimeout(save, 1200);
    return () => clearTimeout(timer);
  }, [html, status]);

  useEffect(() => {
    if (status === "saved" || status === "fresh") return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [status]);

  function change(value: string) {
    setHtml(value);
    setStatus("pending");
  }

  function insert(snippet: string) {
    const element = area.current;
    if (!element) return;
    const { selectionStart: start, selectionEnd: end, value } = element;
    change(`${value.slice(0, start)}${snippet}${value.slice(end)}`);
    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(start, start + snippet.length);
    });
  }

  function useTemplate() {
    if (html.trim() && !confirm("Replace Latest with the outline template? It goes live once saved."))
      return;
    change(planTemplate);
  }

  async function lock() {
    if (status !== "saved" && !(await save())) return;
    setBusy("lock");
    try {
      const { version } = await api("bp/versions", "POST", { note });
      setNote("");
      await reload();
      onNotice({
        tone: "ok",
        text: `Locked as version ${version.number}. Latest stays editable.`,
      });
      onLocked();
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
      onNotice({ tone: "ok", text: `${file.name} is now Latest’s PDF.` });
    } catch (error) {
      fail(error);
    } finally {
      setBusy("");
      setUploading("");
      if (picker.current) picker.current.value = "";
    }
  }

  async function removePdf() {
    if (!confirm("Take the PDF off Latest? Locked versions keep theirs.")) return;
    try {
      await api("bp/pdf", "DELETE");
      await reload();
    } catch (error) {
      fail(error);
    }
  }

  const statusText = {
    fresh: "Not saved yet. Edits go live as you type.",
    saved: savedAt ? `Saved ${formatDate(savedAt)} · live` : "Saved · live",
    pending: "Unsaved changes",
    saving: "Saving…",
    failed: "Couldn’t save. Keep typing to retry.",
  }[status];

  return (
    <div className="mk-compose">
      <div className="mk-editor">
        <div className="mk-draft-bar">
          <button className="mk-quiet" onClick={useTemplate}>
            Use outline template
          </button>
          <span className={`mk-draft-status mk-draft-${status}`}>{statusText}</span>
        </div>
        <p className="mk-hint">
          {live.length
            ? `Live for ${live.map((recipient) => recipient.label).join(", ")}.`
            : "No recipient sees Latest right now."}
        </p>

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
            onChange={(event) => change(event.target.value)}
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
              {latest.pdfUpload
                ? `${latest.pdfName} · ${megabytes(latest.pdfSize)}`
                : "None. Viewers can save the web version as a PDF."}
            </p>
            <div className="mk-inline">
              {latest.pdfUpload && (
                <>
                  <a
                    className="mk-quiet mk-link-button"
                    href="/api/marketing/bp/pdf?version=latest"
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
                {uploading ? `${uploading}…` : latest.pdfUpload ? "Replace" : "Upload PDF"}
              </button>
            </div>
          </div>
        </div>

        <AssetLibrary
          partBytes={data.limits.partBytes}
          maxBytes={data.limits.maxBytes}
          onInsert={insert}
          onNotice={onNotice}
        />

        <div className="mk-send">
          <label className="mk-field">
            <span>Lock a version</span>
            <input
              value={note}
              maxLength={500}
              placeholder={`What’s in version ${data.nextNumber} (optional)`}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
          <div className="mk-inline">
            <a
              className="mk-quiet mk-link-button"
              href="/marketing/plan/latest"
              target="_blank"
              rel="noopener"
            >
              Full preview
            </a>
            <button
              className="button button-small button-dark"
              onClick={lock}
              disabled={busy !== "" || (!html.trim() && !latest.pdfUpload)}
            >
              {busy === "lock" ? "Locking…" : `Lock as version ${data.nextNumber}`}
            </button>
          </div>
          <p className="mk-hint">
            Locking saves a copy of Latest that never changes, for recipients you
            pin to it. Latest stays live.
          </p>
        </div>
      </div>

      <div className="mk-preview">
        <div className="mk-preview-bar">
          <div className="mk-inbox-line">
            <strong>Latest, web version</strong>
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
          <article
            className={/class="deck[\s"]/.test(html) ? undefined : "bp-doc"}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}

function VersionList({
  data,
  reload,
  onNotice,
  onRestored,
}: Props & { onRestored: () => void }) {
  const { versions, recipients } = data;
  const fail = (error: unknown) => onNotice({ tone: "error", text: message(error) });

  async function restore(version: Row) {
    if (
      !confirm(
        `Replace Latest with a copy of version ${version.number}? Recipients who see Latest get it right away.`,
      )
    )
      return;
    try {
      await api("bp/latest", "PUT", { fromVersion: version.id });
      await reload();
      onRestored();
    } catch (error) {
      fail(error);
    }
  }

  async function remove(version: Row) {
    if (
      !confirm(
        `Delete version ${version.number}? Recipients pinned to it will see Latest instead.`,
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
        No locked versions yet. Lock Latest when you want a copy that never
        changes, for example the one you sent a fund.
      </p>
    );
  return (
    <div className="mk-campaigns">
      {versions.map((version) => {
        const pinned = recipients.filter(
          (recipient) => pinnedVersion(recipient, versions)?.id === version.id,
        );
        const formats = [
          version.html?.trim() && "Web",
          version.pdfUpload && `PDF (${megabytes(version.pdfSize)})`,
        ].filter(Boolean);
        return (
          <article key={version.id} className="mk-panel mk-recipient">
            <div className="mk-campaign-head">
              <div>
                <h3>Version {version.number}</h3>
                <p>
                  Locked {formatDate(version.lockedAt)} · {formats.join(" + ")}
                </p>
                {version.note && <p className="mk-note">{version.note}</p>}
                <p>
                  {pinned.length
                    ? `Shown to ${pinned.map((recipient) => recipient.label).join(", ")}`
                    : "No recipient is pinned to it"}
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
                <button className="mk-quiet" onClick={() => restore(version)}>
                  Copy to Latest
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
      <option value="">Latest (live)</option>
      {versions.map((version) => (
        <option key={version.id} value={version.id}>
          {versionName(version)}
        </option>
      ))}
    </select>
  );
}

function RecipientList({ data, reload, onNotice }: Props) {
  const { versions, recipients, url, latest } = data;
  const [label, setLabel] = useState("");
  const [password, setPassword] = useState("");
  const [versionId, setVersionId] = useState("");
  const [busy, setBusy] = useState(false);
  const fail = (error: unknown) => onNotice({ tone: "error", text: message(error) });
  const latestReady = Boolean(latest.html?.trim() || latest.pdfUpload);
  // The password is the last part of the link.
  const link = (recipient: Recipient) => `${url}/${recipient.password}`;

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
        text: `${recipient.label}’s link is ${link(recipient)}. Copy it below to send it.`,
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
        `Turn off ${recipient.label}’s link? Anyone viewing through it loses access right away.`,
      )
    )
      return;
    try {
      await api("bp", "PATCH", { id: recipient.id, ...changes });
      await reload();
      if (changes.versionId !== undefined) {
        const version = versions.find((item) => item.id === changes.versionId);
        onNotice({
          tone: "ok",
          text: `${recipient.label} now sees ${version ? `version ${version.number}` : "Latest"}.`,
        });
      }
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
            <span>Password in the link</span>
            <input
              minLength={6}
              maxLength={64}
              pattern="[A-Za-z0-9\-]+"
              title="Letters, digits, or hyphens"
              placeholder="Generated if left blank"
              autoComplete="off"
              spellCheck={false}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <label className="mk-field">
            <span>Sees</span>
            <VersionSelect
              label="Sees"
              value={versionId}
              versions={versions}
              onChange={setVersionId}
            />
          </label>
          <button className="button button-small button-dark" disabled={busy}>
            {busy ? "Creating…" : "Create link"}
          </button>
        </div>
      </form>

      {!recipients.length && (
        <p className="mk-empty">
          No recipients yet. Create a link for each person or firm you send the
          plan to.
        </p>
      )}
      {recipients.map((recipient) => {
        const pinned = pinnedVersion(recipient, versions);
        return (
          <article key={recipient.id} className="mk-panel mk-recipient">
            <div className="mk-campaign-head">
              <div>
                <h3>
                  {recipient.label}
                  {recipient.revokedAt && <span className="mk-tag">Turned off</span>}
                </h3>
                <p>
                  <code className="mk-password">{link(recipient).replace("https://", "")}</code> ·
                  created{" "}
                  {day(recipient.createdAt)} · {recipient.views ?? 0}{" "}
                  {recipient.views === "1" ? "view" : "views"}
                  {recipient.lastViewedAt &&
                    ` · last viewed ${formatDate(recipient.lastViewedAt)}`}
                </p>
              </div>
              <div className="mk-inline mk-wrap">
                <VersionSelect
                  label={`What ${recipient.label} sees`}
                  value={recipient.versionId ?? ""}
                  versions={versions}
                  onChange={(value) => update(recipient, { versionId: value })}
                />
                <button
                  className="mk-quiet"
                  onClick={() => copy(link(recipient), "Link")}
                >
                  Copy link
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
            {!pinned && !latestReady && (
              <p className="mk-hint">Latest is empty, so this link opens a “not ready yet” page.</p>
            )}
            {recipient.viewers.length ? (
              <div className="mk-table-wrap mk-viewers">
                <table className="mk-table">
                  <thead>
                    <tr>
                      <th>Opened</th>
                      <th>Location</th>
                      <th>Last seen</th>
                      <th>Views</th>
                      <th>Last viewed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipient.viewers.map((viewer) => (
                      <tr key={viewer.id}>
                        <td className="mk-email">{formatDate(viewer.openedAt ?? viewer.acceptedAt)}</td>
                        <td>{[viewer.country, viewer.ip].filter(Boolean).join(" · ") || "—"}</td>
                        <td>
                          {viewer.lastVersion === "latest"
                            ? "Latest"
                            : viewer.lastVersion
                              ? `v${viewer.lastVersion}`
                              : "—"}
                        </td>
                        <td>{viewer.views ?? 0}</td>
                        <td>{formatDate(viewer.lastViewedAt) || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mk-hint">No one has opened the plan with this link yet.</p>
            )}
          </article>
        );
      })}
    </div>
  );
}

type Asset = Row;

/** The snippet that shows an asset in the plan. */
function assetSnippet(asset: Asset) {
  const src = `/api/bp/asset/${asset.id}`;
  return asset.type.startsWith("video/")
    ? `<video src="${src}" controls playsinline preload="metadata"></video>`
    : `<img src="${src}" alt="" />`;
}

/* Images and videos for the plan. They are stored privately and only load
   for signed-in viewers, so they are safe to use in a confidential plan. */
function AssetLibrary({
  partBytes,
  maxBytes,
  onInsert,
  onNotice,
}: {
  partBytes: number;
  maxBytes: number;
  onInsert: (snippet: string) => void;
  onNotice: Notify;
}) {
  const [assets, setAssets] = useState<Asset[] | null>(null);
  const [uploading, setUploading] = useState("");
  const picker = useRef<HTMLInputElement>(null);
  const fail = (error: unknown) => onNotice({ tone: "error", text: message(error) });

  async function load() {
    try {
      setAssets((await api("bp/assets")).assets);
    } catch (error) {
      fail(error);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function upload(files: FileList) {
    try {
      for (const file of Array.from(files)) {
        if (file.size > maxBytes)
          throw new Error(`${file.name} is larger than ${megabytes(maxBytes)}.`);
        const id = crypto.randomUUID();
        const parts = Math.ceil(file.size / partBytes);
        for (let index = 0; index < parts; index++) {
          setUploading(`${file.name} ${Math.round((index / parts) * 100)}%`);
          const response = await fetch(`/api/marketing/bp/assets?upload=${id}&index=${index}`, {
            method: "PUT",
            headers: { "content-type": "application/octet-stream" },
            body: file.slice(index * partBytes, (index + 1) * partBytes),
          });
          if (response.status === 401) location.reload();
          if (!response.ok) throw new Error(`Upload failed (${response.status}).`);
        }
        await api("bp/assets", "POST", {
          upload: id,
          name: file.name,
          type: file.type,
          size: file.size,
          parts,
        });
      }
      await load();
    } catch (error) {
      fail(error);
    } finally {
      setUploading("");
      if (picker.current) picker.current.value = "";
    }
  }

  async function remove(asset: Asset) {
    if (!confirm(`Delete ${asset.name}? Anything still showing it gets a broken image.`)) return;
    try {
      await api("bp/assets", "DELETE", { id: asset.id });
      await load();
    } catch (error) {
      fail(error);
    }
  }

  async function copy(asset: Asset) {
    try {
      await navigator.clipboard.writeText(`/api/bp/asset/${asset.id}`);
      onNotice({ tone: "ok", text: "Address copied." });
    } catch {
      fail(new Error("Couldn’t copy."));
    }
  }

  return (
    <div className="mk-field">
      <span>Images and video</span>
      <div className="mk-assets">
        {assets?.map((asset) => (
          <div key={asset.id} className="mk-asset">
            {asset.type.startsWith("video/") ? (
              <span className="mk-asset-thumb mk-asset-video">▶</span>
            ) : (
              <img className="mk-asset-thumb" src={`/api/bp/asset/${asset.id}`} alt="" loading="lazy" />
            )}
            <span className="mk-asset-name" title={asset.name}>
              {asset.name}
              <small>{megabytes(asset.size)}</small>
            </span>
            <button className="mk-quiet" onClick={() => onInsert(assetSnippet(asset))}>
              Insert
            </button>
            <button className="mk-quiet" onClick={() => copy(asset)}>
              Copy address
            </button>
            <button className="mk-quiet" onClick={() => remove(asset)}>
              Delete
            </button>
          </div>
        ))}
        {assets && !assets.length && (
          <p className="mk-hint">None yet. Upload images or video to show them in the plan.</p>
        )}
        <div className="mk-inline">
          <input
            ref={picker}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
            hidden
            onChange={(event) => event.target.files?.length && upload(event.target.files)}
          />
          <button
            className="mk-quiet"
            disabled={uploading !== ""}
            onClick={() => picker.current?.click()}
          >
            {uploading ? `Uploading ${uploading}…` : "Upload images or video"}
          </button>
        </div>
      </div>
      <p className="mk-hint">
        Stored privately: they only load for people signed in to the plan.
      </p>
    </div>
  );
}
