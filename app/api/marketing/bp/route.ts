import {
  generatePassword,
  maxDocumentBytes,
  normalizePassword,
  partBytes,
} from "../../../business-plan.mjs";
import { authorizePlan, json } from "../../../marketing/server";
import { site } from "../../../site";

/** The current plan, every recipient with their viewers, and the upload
    limits. */
export async function GET(request: Request) {
  const { plan, denied } = await authorizePlan(request);
  if (denied) return denied;
  const [document, recipients] = await Promise.all([
    plan.document(),
    plan.listRecipients(),
  ]);
  return json(200, {
    document,
    recipients,
    url: `${site.url}/bp`,
    limits: { partBytes, maxBytes: maxDocumentBytes },
  });
}

/** Adds a recipient, with a generated password unless one is given. */
export async function POST(request: Request) {
  const { plan, denied } = await authorizePlan(request);
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  const label = typeof body.label === "string" ? body.label.trim() : "";
  if (!label || label.length > 80) return json(400, { error: "invalid_label" });
  const password = body.password?.trim()
    ? normalizePassword(body.password)
    : generatePassword(label);
  if (!password) return json(400, { error: "invalid_password" });
  const recipient = await plan.createRecipient({ label, password });
  if (!recipient) return json(409, { error: "password_taken" });
  return json(200, { recipient: { ...recipient, viewers: [] } });
}

/** Turns a recipient's password off or back on. */
export async function PATCH(request: Request) {
  const { plan, denied } = await authorizePlan(request);
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  if (typeof body.id !== "string" || typeof body.revoked !== "boolean")
    return json(400, { error: "invalid_request" });
  if (!(await plan.setRevoked(body.id, body.revoked)))
    return json(404, { error: "not_found" });
  return json(200, { ok: true });
}

/** Deletes a recipient and the record of who viewed through them. */
export async function DELETE(request: Request) {
  const { plan, denied } = await authorizePlan(request);
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  if (typeof body.id !== "string") return json(400, { error: "invalid_request" });
  if (!(await plan.removeRecipient(body.id)))
    return json(404, { error: "not_found" });
  return json(200, { ok: true });
}
