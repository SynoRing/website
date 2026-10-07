import { site } from "../site";
import { PlanFrame } from "./frame";
import { PrintButton } from "./print-button";
import { versionLabel, type Version } from "./server";
import "./bp.css";
import "./doc.css";

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
  const hasPdf = Boolean(version.pdfUpload);
  const label = versionLabel(version);
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
        <main className="bp-page">
          <p className="bp-print-head">
            SynoRing business plan · {label} · Confidential · Shared with {shared}
          </p>
          <article className="bp-doc" dangerouslySetInnerHTML={{ __html: version.html }} />
        </main>
      )}

      <footer className="bp-foot">
        {footer} Questions: <a href={`mailto:${site.email}`}>{site.email}</a>
      </footer>
    </div>
  );
}
