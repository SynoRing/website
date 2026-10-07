import type { Metadata } from "next";
import { businessPlanFromEnv } from "../../business-plan.mjs";
import { site } from "../../site";
import { PlanGate } from "./gate";
import { PlanView } from "./plan-view";
import { currentViewer } from "./server";
import "./bp.css";

// Always checks the visitor's session, never prerendered.
export const dynamic = "force-dynamic";

const description = "Open it with the password we sent you.";

export const metadata: Metadata = {
  title: "Business plan",
  description,
  robots: { index: false, follow: false },
  openGraph: { title: "SynoRing business plan", description, url: `${site.url}/bp` },
};

/* The confidential business plan. Visitors enter the password made for
   them in the marketing dashboard; then they see the version chosen for
   them, on the web or as a PDF. */
export default async function BusinessPlan({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const plan = businessPlanFromEnv();
  const session = plan && (await currentViewer(plan));
  if (!plan || !session) return <PlanGate available={Boolean(plan)} />;

  const { viewer, recipient } = session;
  const version = await plan.versionFor(recipient);
  if (!version)
    return (
      <main className="bp-gate">
        <img src="/wordmark.svg" width="132" height="44" alt="SynoRing" />
        <div className="bp-card">
          <h1>The plan is on its way.</h1>
          <p className="bp-lede">
            It isn’t ready yet. Please check back shortly, or email{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </div>
      </main>
    );

  const { view } = await searchParams;
  const pdf = Boolean(version.pdfUpload) && (view === "pdf" || !version.html?.trim());
  // The PDF route counts PDF openings; the page counts the web version.
  if (!pdf) await plan.recordView(viewer, version);
  return (
    <PlanView
      version={version}
      shared={recipient.label}
      view={pdf ? "pdf" : "web"}
      base="/bp"
      pdfUrl="/api/bp/document"
      footer={`Shared privately with ${recipient.label}. Please don’t forward it.`}
    />
  );
}
