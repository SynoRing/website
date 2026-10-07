"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { renderEmail, starterDrafts } from "../../email-template.mjs";
import { api, formatDate, message, type Notify } from "./api";
import { BusinessPlanView } from "./business-plan";

type Entry = Record<string, string>;
type Counts = Record<"total" | "all" | "preorder" | "waitlist" | "unsubscribed", number>;
type Setup = {
  storage: boolean;
  email: boolean;
  from: string;
  replyTo: string;
  postalAddress: string;
};
type Draft = { id?: string; name: string; subject: string; preheader: string; body: string };
type Campaign = {
  id: string;
  subject: string;
  audience: Audience;
  createdAt: string;
  total: number;
  pending: number;
  sent: number;
  failed: number;
  skipped: number;
};
type Audience = "all" | "preorder" | "waitlist";
type Tab = "audience" | "compose" | "campaigns" | "plan";

const tabNames: Record<Tab, string> = {
  audience: "Mailing list",
  compose: "Compose",
  campaigns: "Campaigns",
  plan: "Business plan",
};

const audienceNames: Record<Audience, string> = {
  all: "All subscribers",
  preorder: "Pre-orders",
  waitlist: "Waitlist only",
};

/** The site language someone signed up in. */
const languageNames: Record<string, string> = { en: "English", zh: "Chinese" };

const emptyDraft: Draft = { name: "", subject: "", preheader: "", body: "" };

export function Dashboard({ setup }: { setup: Setup }) {
  const [tab, setTab] = useState<Tab>("audience");
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [sending, setSending] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "error" | "ok"; text: string } | null>(null);

  async function loadAudience() {
    try {
      const data = await api("audience");
      setEntries(data.entries);
      setCounts(data.counts);
    } catch (error) {
      setNotice({ tone: "error", text: message(error) });
    }
  }
  async function loadCampaigns() {
    try {
      setCampaigns((await api("campaigns")).campaigns);
    } catch {}
  }
  useEffect(() => {
    const saved = location.hash.slice(1);
    if (saved in tabNames) setTab(saved as Tab);
    if (setup.storage) {
      loadAudience();
      loadCampaigns();
    }
  }, []);
  useEffect(() => {
    history.replaceState(null, "", `#${tab}`);
    // On phones the tabs scroll sideways; keep the open one in view.
    document
      .querySelector(".mk-tabs [aria-current]")
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [tab]);

  // Keep the tab open while a campaign is sending.
  useEffect(() => {
    if (!sending) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [sending]);

  function updateCampaign(campaign: Campaign) {
    setCampaigns((list) => [
      campaign,
      ...list.filter((item) => item.id !== campaign.id),
    ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  async function runCampaign(id: string) {
    setSending(id);
    setTab("campaigns");
    try {
      for (;;) {
        const { campaign } = await api(`campaigns/${id}/send`, "POST");
        updateCampaign(campaign);
        if (!campaign.pending) break;
      }
      setNotice({ tone: "ok", text: "Campaign sent." });
    } catch (error) {
      setNotice({ tone: "error", text: `Sending paused: ${message(error)} You can resume it below.` });
    } finally {
      setSending(null);
    }
  }

  async function signOut() {
    await fetch("/api/marketing/logout", { method: "POST" });
    location.reload();
  }

  const missing = [
    !setup.storage && "the database (Upstash for Redis)",
    !setup.email && "email sending (Cloudflare)",
    !setup.postalAddress && "a postal address for the email footer",
  ].filter(Boolean);

  return (
    <div className="mk">
      <header className="mk-bar">
        <a className="mk-brand" href="/" aria-label="SynoRing home">
          <img src="/wordmark.svg" width="108" height="36" alt="SynoRing" />
          <span>Marketing</span>
        </a>
        <nav className="mk-tabs" aria-label="Dashboard">
          {(Object.keys(tabNames) as Tab[]).map((name) => (
            <button
              key={name}
              aria-current={tab === name ? "page" : undefined}
              onClick={() => setTab(name)}
            >
              {tabNames[name]}
            </button>
          ))}
        </nav>
        <button className="mk-quiet" onClick={signOut}>
          Sign out
        </button>
      </header>

      <main className="mk-main">
        {missing.length > 0 && tab !== "plan" && (
          <p className="mk-banner">Still to set up: {missing.join(", ")}.</p>
        )}
        {notice && (
          <p className={`mk-notice mk-notice-${notice.tone}`} role="status">
            {notice.text}
            <button aria-label="Dismiss" onClick={() => setNotice(null)}>
              ×
            </button>
          </p>
        )}
        {tab === "audience" && (
          <AudienceView
            entries={entries}
            counts={counts}
            onRefresh={loadAudience}
            onNotice={setNotice}
          />
        )}
        {tab === "compose" && (
          <ComposeView
            setup={setup}
            counts={counts}
            onNotice={setNotice}
            onQueued={(campaign) => {
              updateCampaign(campaign);
              runCampaign(campaign.id);
            }}
          />
        )}
        {tab === "campaigns" && (
          <CampaignsView
            campaigns={campaigns}
            sending={sending}
            onResume={runCampaign}
            onRetry={async (id) => {
              try {
                updateCampaign((await api(`campaigns/${id}/retry`, "POST")).campaign);
                runCampaign(id);
              } catch (error) {
                setNotice({ tone: "error", text: message(error) });
              }
            }}
            onNotice={setNotice}
          />
        )}
        {tab === "plan" &&
          (setup.storage ? (
            <BusinessPlanView onNotice={setNotice} />
          ) : (
            <p className="mk-empty">Connect the database to share the business plan.</p>
          ))}
      </main>
    </div>
  );
}

function AudienceView({
  entries,
  counts,
  onRefresh,
  onNotice,
}: {
  entries: Entry[] | null;
  counts: Counts | null;
  onRefresh: () => void;
  onNotice: Notify;
}) {
  const [filter, setFilter] = useState<"all" | "preorder" | "waitlist" | "unsubscribed">("all");
  const [query, setQuery] = useState("");
  const shown = useMemo(
    () =>
      (entries ?? []).filter((entry) => {
        const matches =
          filter === "unsubscribed"
            ? entry.unsubscribedAt
            : !entry.unsubscribedAt &&
              (filter === "all" ||
                (filter === "preorder" ? entry.preorderAt : !entry.preorderAt));
        return matches && entry.email.includes(query.trim().toLowerCase());
      }),
    [entries, filter, query],
  );

  async function remove(email: string) {
    if (!confirm(`Delete ${email} from the list? This can’t be undone.`)) return;
    try {
      await api("audience", "DELETE", { email });
      onNotice({ tone: "ok", text: `${email} was deleted.` });
      onRefresh();
    } catch (error) {
      onNotice({ tone: "error", text: message(error) });
    }
  }

  const stats = [
    ["Subscribed", counts?.all],
    ["Pre-orders", counts?.preorder],
    ["Waitlist only", counts?.waitlist],
    ["Unsubscribed", counts?.unsubscribed],
  ] as const;

  return (
    <section aria-label="Mailing list">
      <div className="mk-stats">
        {stats.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value ?? "—"}</strong>
          </div>
        ))}
      </div>
      <div className="mk-toolbar">
        <div className="mk-segments" role="group" aria-label="Show">
          {(
            [
              ["all", "Subscribed"],
              ["preorder", "Pre-orders"],
              ["waitlist", "Waitlist only"],
              ["unsubscribed", "Unsubscribed"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          className="mk-search"
          type="search"
          placeholder="Search email"
          aria-label="Search email"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button className="mk-quiet" onClick={onRefresh}>
          Refresh
        </button>
        <a className="button button-small button-dark" href="/api/marketing/export">
          Export CSV
        </a>
      </div>
      <div className="mk-table-wrap">
        <table className="mk-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Joined</th>
              <th>Pre-order</th>
              <th>Country</th>
              <th>Language</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((entry) => (
              <tr key={entry.email}>
                <td className="mk-email">
                  {entry.email}
                  {entry.unsubscribedAt && <span className="mk-tag">Unsubscribed</span>}
                </td>
                <td>{formatDate(entry.createdAt)}</td>
                <td>
                  {entry.preorderAt
                    ? `${entry.finish?.replace(/-/g, " ")} × ${entry.quantity}`
                    : "—"}
                </td>
                <td>{entry.country || "—"}</td>
                <td>{languageNames[entry.language] ?? "—"}</td>
                <td className="mk-actions">
                  <button className="mk-quiet" onClick={() => remove(entry.email)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries && !shown.length && <p className="mk-empty">No one here yet.</p>}
        {!entries && <p className="mk-empty">Loading…</p>}
      </div>
    </section>
  );
}

const snippets = [
  ["Heading", "<h2>Heading</h2>"],
  ["Paragraph", "<p>Write something here.</p>"],
  ["Button", '<p><a class="button" href="https://www.synoring.ai/store">Pre-order SynoRing R1</a></p>'],
  ["Image", '<img src="https://www.synoring.ai/email/synoring-r1-finishes.jpg" width="480" alt="SynoRing R1 in four finishes" />'],
  ["List", "<ul>\n  <li>First point</li>\n  <li>Second point</li>\n</ul>"],
  ["Divider", "<hr />"],
] as const;

function ComposeView({
  setup,
  counts,
  onNotice,
  onQueued,
}: {
  setup: Setup;
  counts: Counts | null;
  onNotice: Notify;
  onQueued: (campaign: Campaign) => void;
}) {
  const [draft, setDraft] = useState<Draft>({ ...starterDrafts[0] });
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [testTo, setTestTo] = useState(setup.replyTo);
  const [audience, setAudience] = useState<Audience>("all");
  const [busy, setBusy] = useState<"" | "save" | "test" | "send">("");
  const [width, setWidth] = useState<"desktop" | "mobile">("desktop");
  const body = useRef<HTMLTextAreaElement>(null);

  // The work in progress survives a reload or a switch between tabs.
  const restored = useRef(false);
  useEffect(() => {
    if (!restored.current) {
      restored.current = true;
      try {
        const saved = sessionStorage.getItem("synoring-draft");
        if (saved) return setDraft(JSON.parse(saved));
      } catch {}
    }
    try {
      sessionStorage.setItem("synoring-draft", JSON.stringify(draft));
    } catch {}
  }, [draft]);
  useEffect(() => {
    if (setup.storage)
      api("drafts")
        .then((data) => setDrafts(data.drafts))
        .catch(() => {});
  }, []);

  const preview = useMemo(
    () =>
      renderEmail({
        subject: draft.subject,
        preheader: draft.preheader,
        body: draft.body,
        variables: { email: "you@example.com", finish: "Space Gray", quantity: "1" },
        footer: {
          unsubscribeUrl: "#unsubscribe",
          postalAddress: setup.postalAddress || "[postal address]",
        },
        // Images load from this deployment, so the preview works before
        // they reach production.
      }).html.replaceAll("https://www.synoring.ai/email/", "/email/"),
    [draft, setup.postalAddress],
  );

  const set = (field: keyof Draft) => (value: string) =>
    setDraft((current) => ({ ...current, [field]: value }));

  function insert(snippet: string) {
    const area = body.current;
    if (!area) return;
    const { selectionStart: start, selectionEnd: end, value } = area;
    const next = `${value.slice(0, start)}${snippet}${value.slice(end)}`;
    set("body")(next);
    requestAnimationFrame(() => {
      area.focus();
      area.setSelectionRange(start, start + snippet.length);
    });
  }

  function open(choice: string) {
    if (choice === "new") return setDraft({ ...emptyDraft });
    const [kind, key] = choice.split(":");
    const source =
      kind === "starter"
        ? starterDrafts[Number(key)]
        : drafts.find((item) => item.id === key);
    if (source) setDraft({ ...source, ...(kind === "starter" ? { id: undefined } : {}) });
  }

  async function save() {
    setBusy("save");
    try {
      const { draft: saved } = await api("drafts", "POST", draft);
      setDraft(saved);
      setDrafts((list) => [saved, ...list.filter((item) => item.id !== saved.id)]);
      onNotice({ tone: "ok", text: "Draft saved." });
    } catch (error) {
      onNotice({ tone: "error", text: message(error) });
    } finally {
      setBusy("");
    }
  }

  async function removeDraft() {
    if (!draft.id || !confirm(`Delete the draft “${draft.name}”?`)) return;
    try {
      await api("drafts", "DELETE", { id: draft.id });
      setDrafts((list) => list.filter((item) => item.id !== draft.id));
      setDraft({ ...emptyDraft });
    } catch (error) {
      onNotice({ tone: "error", text: message(error) });
    }
  }

  async function sendTest() {
    setBusy("test");
    try {
      await api("test", "POST", { ...draft, to: testTo });
      onNotice({ tone: "ok", text: `Test sent to ${testTo}.` });
    } catch (error) {
      onNotice({ tone: "error", text: message(error) });
    } finally {
      setBusy("");
    }
  }

  const recipients = counts?.[audience] ?? 0;
  async function sendCampaign() {
    if (
      !confirm(
        `Send “${draft.subject}” to ${recipients} ${recipients === 1 ? "person" : "people"} (${audienceNames[audience]})?`,
      )
    )
      return;
    setBusy("send");
    try {
      const { campaign } = await api("campaigns", "POST", { ...draft, audience });
      onQueued(campaign);
    } catch (error) {
      onNotice({ tone: "error", text: message(error) });
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="mk-compose" aria-label="Compose">
      <div className="mk-editor">
        <div className="mk-draft-bar">
          <select
            aria-label="Open a draft"
            value=""
            onChange={(event) => open(event.target.value)}
          >
            <option value="" disabled>
              Open…
            </option>
            <option value="new">Blank email</option>
            <optgroup label="Templates">
              {starterDrafts.map((item, index) => (
                <option key={item.name} value={`starter:${index}`}>
                  {item.name}
                </option>
              ))}
            </optgroup>
            {drafts.length > 0 && (
              <optgroup label="Saved drafts">
                {drafts.map((item) => (
                  <option key={item.id} value={`draft:${item.id}`}>
                    {item.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <input
            aria-label="Draft name"
            placeholder="Draft name"
            value={draft.name}
            onChange={(event) => set("name")(event.target.value)}
          />
          <button className="mk-quiet" onClick={save} disabled={busy !== "" || !setup.storage}>
            {busy === "save" ? "Saving…" : draft.id ? "Save" : "Save draft"}
          </button>
          {draft.id && (
            <button className="mk-quiet" onClick={removeDraft}>
              Delete
            </button>
          )}
        </div>
        <label className="mk-field">
          <span>Subject</span>
          <input value={draft.subject} onChange={(event) => set("subject")(event.target.value)} />
        </label>
        <label className="mk-field">
          <span>Preview text</span>
          <input
            value={draft.preheader}
            placeholder="Shown after the subject in the inbox"
            onChange={(event) => set("preheader")(event.target.value)}
          />
        </label>
        <div className="mk-field">
          <span id="mk-body-label">Body (HTML)</span>
          <div className="mk-snippets" role="group" aria-label="Insert">
            {snippets.map(([label, snippet]) => (
              <button key={label} onClick={() => insert(snippet)}>
                + {label}
              </button>
            ))}
          </div>
          <textarea
            ref={body}
            aria-labelledby="mk-body-label"
            spellCheck={false}
            value={draft.body}
            onChange={(event) => set("body")(event.target.value)}
          />
          <p className="mk-hint">
            Plain tags take the SynoRing style; <code>&lt;a class="button"&gt;</code> makes
            a button. <code>{"{{email}}"}</code>, <code>{"{{finish}}"}</code>, and{" "}
            <code>{"{{quantity}}"}</code> are filled in for each person. The unsubscribe
            link and postal address are added to every email.
          </p>
        </div>

        <div className="mk-send">
          <div>
            <label htmlFor="mk-test">Send a test</label>
            <div className="mk-inline">
              <input
                id="mk-test"
                type="email"
                value={testTo}
                onChange={(event) => setTestTo(event.target.value)}
              />
              <button
                className="mk-quiet"
                onClick={sendTest}
                disabled={busy !== "" || !setup.email}
              >
                {busy === "test" ? "Sending…" : "Send test"}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="mk-audience">Send to</label>
            <div className="mk-inline">
              <select
                id="mk-audience"
                value={audience}
                onChange={(event) => setAudience(event.target.value as Audience)}
              >
                {(Object.keys(audienceNames) as Audience[]).map((value) => (
                  <option key={value} value={value}>
                    {audienceNames[value]} ({counts?.[value] ?? 0})
                  </option>
                ))}
              </select>
              <button
                className="button button-small button-dark"
                onClick={sendCampaign}
                disabled={
                  busy !== "" || !setup.email || !setup.postalAddress || !recipients
                }
              >
                {busy === "send" ? "Queuing…" : `Send to ${recipients}`}
              </button>
            </div>
          </div>
          <p className="mk-hint">
            From {setup.from} · replies go to {setup.replyTo}
          </p>
        </div>
      </div>

      <div className="mk-preview">
        <div className="mk-preview-bar">
          <div className="mk-inbox-line">
            <strong>{draft.subject || "No subject"}</strong>
            <span>{draft.preheader}</span>
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
        <iframe
          className={`mk-frame mk-frame-${width}`}
          title="Email preview"
          sandbox=""
          srcDoc={preview}
        />
      </div>
    </section>
  );
}

function CampaignsView({
  campaigns,
  sending,
  onResume,
  onRetry,
  onNotice,
}: {
  campaigns: Campaign[];
  sending: string | null;
  onResume: (id: string) => void;
  onRetry: (id: string) => void;
  onNotice: Notify;
}) {
  async function showErrors(id: string) {
    try {
      const { errors } = await api(`campaigns/${id}`);
      const lines = Object.entries(errors as Record<string, string>)
        .slice(0, 20)
        .map(([email, error]) => `${email}: ${error}`);
      onNotice({ tone: "error", text: lines.join(" · ") || "No details recorded." });
    } catch (error) {
      onNotice({ tone: "error", text: message(error) });
    }
  }

  if (!campaigns.length)
    return <p className="mk-empty">No campaigns yet. Write one under Compose.</p>;
  return (
    <section className="mk-campaigns" aria-label="Campaigns">
      {campaigns.map((campaign) => {
        const done = campaign.sent + campaign.failed + campaign.skipped;
        const progress = campaign.total ? done / campaign.total : 1;
        const active = sending === campaign.id;
        return (
          <article key={campaign.id} className="mk-campaign">
            <div className="mk-campaign-head">
              <div>
                <h2>{campaign.subject}</h2>
                <p>
                  {audienceNames[campaign.audience] ?? campaign.audience} ·{" "}
                  {formatDate(campaign.createdAt)}
                </p>
              </div>
              <div className="mk-inline">
                {campaign.pending > 0 && !active && (
                  <button
                    className="button button-small button-dark"
                    disabled={sending !== null}
                    onClick={() => onResume(campaign.id)}
                  >
                    Resume
                  </button>
                )}
                {campaign.failed > 0 && !active && (
                  <>
                    <button className="mk-quiet" onClick={() => showErrors(campaign.id)}>
                      Why failed
                    </button>
                    <button
                      className="mk-quiet"
                      disabled={sending !== null}
                      onClick={() => onRetry(campaign.id)}
                    >
                      Retry failed
                    </button>
                  </>
                )}
              </div>
            </div>
            <div
              className="mk-progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={campaign.total}
              aria-valuenow={done}
            >
              <span style={{ width: `${progress * 100}%` }} />
            </div>
            <p className="mk-campaign-counts">
              {active ? "Sending… " : campaign.pending ? "Paused · " : ""}
              {campaign.sent} sent · {campaign.failed} failed · {campaign.skipped} skipped
              (unsubscribed) · {campaign.pending} waiting · {campaign.total} total
            </p>
          </article>
        );
      })}
    </section>
  );
}
