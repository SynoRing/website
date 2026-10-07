import { authorizePlan, json } from "../../../../marketing/server";

/** Publishes the saved draft as the next version. */
export async function POST(request: Request) {
  const { plan, denied } = await authorizePlan(request);
  if (denied) return denied;
  const version = await plan.publish();
  if (!version) return json(400, { error: "empty_draft" });
  return json(200, { version });
}

/** Deletes a version. Recipients pinned to it see the latest instead. */
export async function DELETE(request: Request) {
  const { plan, denied } = await authorizePlan(request);
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  if (typeof body.id !== "string") return json(400, { error: "invalid_request" });
  if (!(await plan.removeVersion(body.id))) return json(404, { error: "not_found" });
  return json(200, { ok: true });
}
