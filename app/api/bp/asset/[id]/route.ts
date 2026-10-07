import { businessPlanFromEnv } from "../../../../business-plan.mjs";
import { currentViewer, fileResponse, notFound } from "../../../../(tools)/bp/server";
import { isSignedIn } from "../../../../(tools)/marketing/session";

export const maxDuration = 60;

/** An image or video in the plan, for a signed-in visitor or a signed-in
    dashboard user. Supports byte ranges for video. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const plan = businessPlanFromEnv();
  if (!plan) return notFound();
  const allowed = (await isSignedIn()) || Boolean(await currentViewer(plan));
  const asset = allowed && (await plan.asset((await params).id));
  if (!asset) return notFound();
  return fileResponse(
    plan,
    { upload: asset.id, parts: asset.parts, size: asset.size },
    {
      "content-type": asset.type,
      "content-disposition": "inline",
      // An asset never changes once stored.
      "cache-control": "private, max-age=31536000, immutable",
    },
    request.headers.get("range"),
  );
}
