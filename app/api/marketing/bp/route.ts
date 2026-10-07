import {
  generatePassword,
  maxPdfBytes,
  normalizePassword,
  partBytes,
} from "../../../business-plan.mjs";
import type { Plan } from "../../../(tools)/bp/server";
import { authorizePlan, json } from "../../../(tools)/marketing/server";
import { site } from "../../../site";

/** Latest, every version, every recipient with their visits, and the
    upload limits. */
export async function GET(request: Request) {
  const { plan, denied } = await authorizePlan(request);
  if (denied) return denied;
  const [latest, versions, recipients, nextNumber] = await Promise.all([
    plan.latest(),
    plan.versions(),
    plan.listRecipients(),
    plan.nextNumber(),
  ]);
  return json(200, {
    latest,
    versions,
    recipients,
    nextNumber,
    url: `${site.url}/bp`,
    limits: { partBytes, maxBytes: maxPdfBytes },
  });
}

/** "" (Latest) or the id of an existing version. */
async function validVersion(plan: Plan, value: unknown) {
  if (value === undefined || value === "") return "";
  return typeof value === "string" && (await plan.version(value)) ? value : null;
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
  const versionId = await validVersion(plan, body.versionId);
  if (versionId === null) return json(400, { error: "invalid_request" });
  const recipient = await plan.createRecipient({ label, password, versionId });
  if (!recipient) return json(409, { error: "password_taken" });
  return json(200, { recipient: { ...recipient, viewers: [] } });
}

/** Turns a recipient's password off or on, or changes their version. */
export async function PATCH(request: Request) {
  const { plan, denied } = await authorizePlan(request);
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  if (typeof body.id !== "string") return json(400, { error: "invalid_request" });
  const revoked = typeof body.revoked === "boolean" ? body.revoked : undefined;
  const versionId =
    body.versionId === undefined ? undefined : await validVersion(plan, body.versionId);
  if (versionId === null) return json(400, { error: "invalid_request" });
  if (!(await plan.updateRecipient(body.id, { revoked, versionId })))
    return json(404, { error: "not_found" });
  return json(200, { ok: true });
}

/** Deletes a recipient and the record of their visits. */
export async function DELETE(request: Request) {
  const { plan, denied } = await authorizePlan(request);
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  if (typeof body.id !== "string") return json(400, { error: "invalid_request" });
  if (!(await plan.removeRecipient(body.id)))
    return json(404, { error: "not_found" });
  return json(200, { ok: true });
}
