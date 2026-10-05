import { authorize, json } from "../../../marketing/server";

export async function GET(request: Request) {
  const { store, denied } = await authorize(request);
  if (denied) return denied;
  return json(200, { drafts: await store.listDrafts() });
}

/** Saves a new draft, or updates one when `id` is given. */
export async function POST(request: Request) {
  const { store, denied } = await authorize(request);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.body !== "string")
    return json(400, { error: "invalid_request" });
  const name = String(body.name || body.subject || "Untitled draft").slice(0, 120);
  return json(200, { draft: await store.saveDraft({ ...body, name }) });
}

export async function DELETE(request: Request) {
  const { store, denied } = await authorize(request);
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  if (typeof body.id !== "string") return json(400, { error: "invalid_request" });
  await store.deleteDraft(body.id);
  return json(200, { ok: true });
}
