import {
  maxDocumentBytes,
  maxParts,
  partBytes,
} from "../../../../business-plan.mjs";
import { documentResponse } from "../../../../bp/server";
import { authorizePlan, json } from "../../../../marketing/server";

export const maxDuration = 60;

const versionPattern = /^[0-9a-f-]{36}$/;

/** The current plan, for checking it from the dashboard. Doesn't count as
    a view. */
export async function GET(request: Request) {
  const { plan, denied } = await authorizePlan(request);
  if (denied) return denied;
  const document = await plan.document();
  if (!document) return json(404, { error: "not_found" });
  return documentResponse(plan, document);
}

/** Receives one part of a new upload: ?version=<uuid>&index=<n>, the raw
    bytes as the body. */
export async function PUT(request: Request) {
  const { plan, denied } = await authorizePlan(request);
  if (denied) return denied;
  const params = new URL(request.url).searchParams;
  const version = params.get("version") ?? "";
  const index = Number(params.get("index"));
  if (!versionPattern.test(version) || !Number.isInteger(index) || index < 0 || index >= maxParts)
    return json(400, { error: "invalid_request" });
  const bytes = Buffer.from(await request.arrayBuffer());
  if (!bytes.length || bytes.length > partBytes)
    return json(413, { error: "too_large" });
  if (index === 0 && bytes.subarray(0, 5).toString("latin1") !== "%PDF-")
    return json(400, { error: "not_pdf" });
  await plan.putPart(version, index, bytes.toString("base64"));
  return json(200, { ok: true });
}

/** Publishes an upload once all its parts are in, replacing the plan. */
export async function POST(request: Request) {
  const { plan, denied } = await authorizePlan(request);
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  const { version, name, size, parts } = body;
  if (
    typeof version !== "string" ||
    !versionPattern.test(version) ||
    typeof name !== "string" ||
    !Number.isInteger(size) ||
    size < 1 ||
    size > maxDocumentBytes ||
    parts !== Math.ceil(size / partBytes)
  )
    return json(400, { error: "invalid_request" });
  const document = await plan.publishDocument({
    version,
    name: name.slice(0, 200),
    size,
    parts,
  });
  if (!document) return json(400, { error: "upload_incomplete" });
  return json(200, { document });
}
