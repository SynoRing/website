import { maxHtmlLength } from "../../../../business-plan.mjs";
import { authorizePlan, json } from "../../../../marketing/server";

/** Saves the draft's HTML and note, or with { fromVersion } replaces the
    draft with a copy of that version. */
export async function PUT(request: Request) {
  const { plan, denied } = await authorizePlan(request);
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  if (typeof body.fromVersion === "string") {
    const draft = await plan.restoreDraft(body.fromVersion);
    return draft ? json(200, { draft }) : json(404, { error: "not_found" });
  }
  const { html, note = "" } = body;
  if (typeof html !== "string" || typeof note !== "string")
    return json(400, { error: "invalid_request" });
  if (html.length > maxHtmlLength) return json(413, { error: "too_large" });
  return json(200, { draft: await plan.saveDraft({ html, note: note.slice(0, 500) }) });
}
