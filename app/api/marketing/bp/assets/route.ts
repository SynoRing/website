import {
  assetTypes,
  maxAssetBytes,
  maxParts,
  partBytes,
} from "../../../../business-plan.mjs";
import { authorizePlan, json } from "../../../../(tools)/marketing/server";

const uploadPattern = /^[0-9a-f-]{36}$/;

/** Every image and video uploaded for the plan, newest first. */
export async function GET(request: Request) {
  const { plan, denied } = await authorizePlan(request);
  if (denied) return denied;
  return json(200, { assets: await plan.assets() });
}

/** Receives one part of an upload: ?upload=<uuid>&index=<n>, the raw bytes
    as the body. */
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
  await plan.putPart(upload, index, bytes.toString("base64"));
  return json(200, { ok: true });
}

/** Keeps an upload as an asset once all its parts are in. */
export async function POST(request: Request) {
  const { plan, denied } = await authorizePlan(request);
  if (denied) return denied;
  const { upload, name, type, size, parts } = await request.json().catch(() => ({}));
  if (
    typeof upload !== "string" ||
    !uploadPattern.test(upload) ||
    typeof name !== "string" ||
    !assetTypes.includes(type) ||
    !Number.isInteger(size) ||
    size < 1 ||
    size > maxAssetBytes ||
    parts !== Math.ceil(size / partBytes)
  )
    return json(400, { error: "invalid_request" });
  const asset = await plan.addAsset({ upload, name: name.slice(0, 200), type, size, parts });
  if (!asset) return json(400, { error: "upload_incomplete" });
  return json(200, { asset });
}

/** Deletes an asset. Pages that still show it get a broken image. */
export async function DELETE(request: Request) {
  const { plan, denied } = await authorizePlan(request);
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  if (typeof body.id !== "string") return json(400, { error: "invalid_request" });
  if (!(await plan.removeAsset(body.id))) return json(404, { error: "not_found" });
  return json(200, { ok: true });
}
