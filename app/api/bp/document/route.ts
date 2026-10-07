import { businessPlanFromEnv } from "../../../business-plan.mjs";
import { currentViewer, documentResponse } from "../../../bp/server";

export const maxDuration = 60;

/** The plan's PDF, for a visitor who accepted the terms. Each request
    counts as an opening. */
export async function GET(request: Request) {
  const plan = businessPlanFromEnv();
  const session = plan && (await currentViewer(plan));
  const document = session && (await plan.document());
  if (!plan || !session || !document)
    return new Response("Not found", {
      status: 404,
      headers: { "cache-control": "no-store", "x-robots-tag": "noindex" },
    });
  await plan.recordView(session.viewer);
  return documentResponse(plan, document, {
    download: new URL(request.url).searchParams.has("download"),
  });
}
