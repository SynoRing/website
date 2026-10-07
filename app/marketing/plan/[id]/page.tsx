import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PlanView } from "../../../bp/plan-view";
import { businessPlanFromEnv } from "../../../business-plan.mjs";
import { isSignedIn } from "../../session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Plan preview",
  robots: { index: false, follow: false },
};

/* A version of the business plan, or the saved draft ("draft"), shown
   exactly as recipients see it. Previewing doesn't count as a view. */
export default async function PlanPreview({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  if (!(await isSignedIn())) redirect("/marketing");
  const plan = businessPlanFromEnv();
  if (!plan) notFound();
  const { id } = await params;
  const version = id === "draft" ? await plan.draft() : await plan.version(id);
  if (!version || (!version.html?.trim() && !version.pdfUpload)) notFound();
  const { view } = await searchParams;
  const pdf = Boolean(version.pdfUpload) && (view === "pdf" || !version.html?.trim());
  return (
    <PlanView
      version={version}
      shared="Preview"
      view={pdf ? "pdf" : "web"}
      base={`/marketing/plan/${id}`}
      pdfUrl={`/api/marketing/bp/pdf?version=${id}`}
      footer="Preview only; it isn’t counted as a view. Recipients see their own name after “Shared with.”"
    />
  );
}
