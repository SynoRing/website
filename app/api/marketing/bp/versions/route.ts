import { authorizePlan, json } from "../../../../marketing/server";

/** Locks a copy of Latest as the next numbered version. */
export async function POST(request: Request) {
  const { plan, denied } = await authorizePlan(request);
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) : "";
  const version = await plan.lock(note);
  if (!version) return json(400, { error: "empty_plan" });
  return json(200, { version });
}

/** Deletes a version. Recipients pinned to it see Latest instead. */
export async function DELETE(request: Request) {
  const { plan, denied } = await authorizePlan(request);
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  if (typeof body.id !== "string") return json(400, { error: "invalid_request" });
  if (!(await plan.removeVersion(body.id))) return json(404, { error: "not_found" });
  return json(200, { ok: true });
}
