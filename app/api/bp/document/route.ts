import { businessPlanFromEnv } from "../../../business-plan.mjs";
import { currentViewer, notFound, pdfResponse } from "../../../(tools)/bp/server";

export const maxDuration = 60;

/** The PDF of the version chosen for the visitor's recipient. Each request
    counts as an opening. */
export async function GET(request: Request) {
  const plan = businessPlanFromEnv();
  const session = plan && (await currentViewer(plan));
  const version = session && (await plan.versionFor(session.recipient));
  if (!plan || !session || !version?.pdfUpload) return notFound();
  await plan.recordView(session.viewer, version);
  return pdfResponse(plan, version, {
    download: new URL(request.url).searchParams.has("download"),
  });
}
