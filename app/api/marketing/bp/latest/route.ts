import { maxHtmlLength } from "../../../../business-plan.mjs";
import { authorizePlan, json } from "../../../../(tools)/marketing/server";

/** Saves Latest's HTML, live for recipients who see Latest. With
    { fromVersion } it instead replaces Latest with a copy of that version. */
export async function PUT(request: Request) {
  const { plan, denied } = await authorizePlan(request);
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  if (typeof body.fromVersion === "string") {
    const latest = await plan.restoreLatest(body.fromVersion);
    return latest ? json(200, { latest }) : json(404, { error: "not_found" });
  }
  if (typeof body.html !== "string") return json(400, { error: "invalid_request" });
  if (body.html.length > maxHtmlLength) return json(413, { error: "too_large" });
  return json(200, { latest: await plan.saveLatest(body.html) });
}
