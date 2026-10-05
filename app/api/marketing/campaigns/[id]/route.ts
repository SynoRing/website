import { authorize, json } from "../../../../marketing/server";

/** One campaign with its counts and the reason each failure was reported. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { store, denied } = await authorize(request);
  if (denied) return denied;
  const { id } = await params;
  const campaign = await store.campaign(id);
  if (!campaign) return json(404, { error: "not_found" });
  return json(200, { campaign, errors: await store.campaignErrors(id) });
}
