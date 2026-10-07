import { maxParts, maxPdfBytes, partBytes } from "../../../../business-plan.mjs";
import { notFound, pdfResponse } from "../../../../(tools)/bp/server";
import { authorizePlan, json } from "../../../../(tools)/marketing/server";

export const maxDuration = 60;

const uploadPattern = /^[0-9a-f-]{36}$/;

/** A version's PDF (?version=<id>, or "latest"), for checking it from the
    dashboard. Doesn't count as a view. */
export async function GET(request: Request) {
  const { plan, denied } = await authorizePlan(request);
  if (denied) return denied;
  const params = new URL(request.url).searchParams;
  const id = params.get("version") ?? "";
  const version = id === "latest" ? await plan.latest() : await plan.version(id);
  if (!version?.pdfUpload) return notFound();
  return pdfResponse(plan, version, { download: params.has("download") });
}

/** Receives one part of a PDF upload: ?upload=<uuid>&index=<n>, the raw
    bytes as the body. */
export async function PUT(request: Request) {
  const { plan, denied } = await authorizePlan(request);
  if (denied) return denied;
  const params = new URL(request.url).searchParams;
  const upload = params.get("upload") ?? "";
  const index = Number(params.get("index"));
  if (!uploadPattern.test(upload) || !Number.isInteger(index) || index < 0 || index >= maxParts)
    return json(400, { error: "invalid_request" });
  const bytes = Buffer.from(await request.arrayBuffer());
  if (!bytes.length || bytes.length > partBytes) return json(413, { error: "too_large" });
  if (index === 0 && bytes.subarray(0, 5).toString("latin1") !== "%PDF-")
    return json(400, { error: "not_pdf" });
  await plan.putPart(upload, index, bytes.toString("base64"));
  return json(200, { ok: true });
}

/** Attaches an upload to Latest once all its parts are in. */
export async function POST(request: Request) {
  const { plan, denied } = await authorizePlan(request);
  if (denied) return denied;
  const { upload, name, size, parts } = await request.json().catch(() => ({}));
  if (
    typeof upload !== "string" ||
    !uploadPattern.test(upload) ||
    typeof name !== "string" ||
    !Number.isInteger(size) ||
    size < 1 ||
    size > maxPdfBytes ||
    parts !== Math.ceil(size / partBytes)
  )
    return json(400, { error: "invalid_request" });
  const latest = await plan.attachPdf({ upload, name: name.slice(0, 200), size, parts });
  if (!latest) return json(400, { error: "upload_incomplete" });
  return json(200, { latest });
}

/** Takes the PDF off Latest. */
export async function DELETE(request: Request) {
  const { plan, denied } = await authorizePlan(request);
  if (denied) return denied;
  return json(200, { latest: await plan.detachPdf() });
}
