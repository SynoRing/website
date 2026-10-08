import { site } from "../../site";
import { PlanFrame } from "./frame";
import { LocalDate } from "./local-date";
import { PrintButton } from "./print-button";
import type { Version } from "./server";
import "./bp.css";
import "./deck.css";
import "./doc.css";

/** "Version 3 · October 6, 2026", or "Latest · updated October 7, 2026"
    for the live plan. */
function VersionLabel({ version }: { version: Version }) {
  return version.number ? (
    <>
      Version {version.number} · <LocalDate value={version.lockedAt} />
    </>
  ) : (
    <>
      Latest · updated <LocalDate value={version.updatedAt} />
    </>
  );
}

/* One version of the plan as a recipient sees it: the web version, or its
   PDF. The dashboard's preview uses the same view. */
export function PlanView({
  version,
  shared,
  footer,
  view,
  base,
  pdfUrl,
}: {
  version: Version;
  shared: string;
  footer: React.ReactNode;
  view: "web" | "pdf";
  /** This page's path, for the Web and PDF switch. */
  base: string;
  pdfUrl: string;
}) {
  const hasWeb = Boolean(version.html?.trim());
  // Slides opt in with <div class="deck">; anything else is a document.
  const deck = /class="deck[\s"]/.test(version.html ?? "");
  const hasPdf = Boolean(version.pdfUpload);
  const label = <VersionLabel version={version} />;
  const download = `${pdfUrl}${pdfUrl.includes("?") ? "&" : "?"}download`;

  return (
    <div className={`bp-viewer bp-viewer-${view}`}>
      <header className="bp-bar">
        <a href="/" aria-label="SynoRing home">
          <img src="/wordmark.svg" width="108" height="36" alt="SynoRing" />
        </a>
        <div className="bp-title">
          <h1>Business plan</h1>
          <p>
            {label} · Shared with {shared}
          </p>
        </div>
        {hasWeb && hasPdf && (
          <nav className="bp-views" aria-label="Format">
            <a href={base} aria-current={view === "web" ? "page" : undefined}>
              Web
            </a>
            <a href={`${base}?view=pdf`} aria-current={view === "pdf" ? "page" : undefined}>
              PDF
            </a>
          </nav>
        )}
        {hasPdf ? (
          <a className="button button-small button-dark bp-download" href={download}>
            Download PDF
          </a>
        ) : (
          <PrintButton />
        )}
      </header>

      {view === "pdf" ? (
        <PlanFrame src={pdfUrl} />
      ) : (
        <main className={`bp-page${deck ? " bp-deck-page" : ""}`}>
          {!deck && (
            <p className="bp-print-head">
              SynoRing business plan · {label} · Confidential · Shared with {shared}
            </p>
          )}
          <article
            className={deck ? undefined : "bp-doc"}
            dangerouslySetInnerHTML={{ __html: version.html }}
          />
        </main>
      )}

      <footer className="bp-foot">
        {footer} Questions: <a href={`mailto:${site.email}`}>{site.email}</a>
      </footer>
    </div>
  );
}
