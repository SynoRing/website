import { authorize, json } from "../../../../../(tools)/marketing/server";

/** Moves failed recipients back onto the queue. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { store, denied } = await authorize(request);
  if (denied) return denied;
  const { id } = await params;
  await store.retryFailed(id);
  return json(200, { campaign: await store.campaign(id) });
}
