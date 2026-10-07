import { mailerFromEnv } from "../../../mailer.mjs";
import { authorize, json, postalAddress } from "../../../(tools)/marketing/server";
import { audiences, selectAudience } from "../../../waitlist.mjs";

export async function GET(request: Request) {
  const { store, denied } = await authorize(request);
  if (denied) return denied;
  return json(200, { campaigns: (await store.listCampaigns()).filter(Boolean) });
}

/** Freezes the message and queues everyone in the audience. Sending happens
    in batches through /campaigns/[id]/send. */
export async function POST(request: Request) {
  const { store, denied } = await authorize(request);
  if (denied) return denied;
  if (!mailerFromEnv()) return json(503, { error: "email_unavailable" });
  // US law (CAN-SPAM) requires a postal address in marketing email.
  if (!postalAddress()) return json(409, { error: "postal_address_missing" });
  const body = await request.json().catch(() => ({}));
  if (!body.subject || !body.body) return json(400, { error: "missing_content" });
  if (!(body.audience in audiences)) return json(400, { error: "invalid_audience" });
  const emails = selectAudience(await store.list(), body.audience).map(
    (entry) => entry.email,
  );
  if (!emails.length) return json(409, { error: "empty_audience" });
  return json(200, { campaign: await store.createCampaign(body, emails) });
}
