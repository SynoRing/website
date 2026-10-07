import type { Metadata } from "next";
import { businessPlanFromEnv } from "../business-plan.mjs";
import { site } from "../site";
import { PlanFrame } from "./frame";
import { PlanGate } from "./gate";
import { currentViewer } from "./server";
import "./bp.css";

// Always checks the visitor's session, never prerendered.
export const dynamic = "force-dynamic";

const description = "Confidential. Open it with the password you were given.";

export const metadata: Metadata = {
  title: "Business plan",
  description,
  robots: { index: false, follow: false },
  openGraph: { title: "SynoRing business plan", description, url: `${site.url}/bp` },
};

/* The confidential business plan. Visitors enter the password made for
   them in the marketing dashboard, accept the confidentiality terms, and
   the PDF opens. */
export default async function BusinessPlan() {
  const plan = businessPlanFromEnv();
  const session = plan && (await currentViewer(plan));
  if (!plan || !session) return <PlanGate available={Boolean(plan)} />;

  const document = await plan.document();
  const { viewer, recipient } = session;
  const accepted = new Date(viewer.acceptedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return (
    <div className="bp-viewer">
      <header className="bp-bar">
        <a href="/" aria-label="SynoRing home">
          <img src="/wordmark.svg" width="108" height="36" alt="SynoRing" />
        </a>
        <div className="bp-title">
          <h1>Business plan</h1>
          <p>Confidential · Shared with {recipient.label}</p>
        </div>
        {document && (
          <a
            className="button button-small button-dark"
            href="/api/bp/document"
            target="_blank"
            rel="noopener"
          >
            Open PDF
          </a>
        )}
      </header>
      {document ? (
        <PlanFrame />
      ) : (
        <div className="bp-stage">
          <p>
            The plan is being updated. Please check back shortly, or email{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </div>
      )}
      <footer className="bp-foot">
        Shared with {viewer.name} under the confidentiality terms accepted on{" "}
        {accepted}. Questions: <a href={`mailto:${site.email}`}>{site.email}</a>
      </footer>
    </div>
  );
}
