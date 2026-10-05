import { mailerFromEnv } from "../../../../../mailer.mjs";
import {
  authorize,
  deliver,
  json,
  recipientVariables,
} from "../../../../../marketing/server";

export const maxDuration = 60;

const batchSize = 20;
const concurrency = 5;

/** Sends the next batch. The dashboard calls this until nothing is pending;
    recipients who unsubscribed after the campaign was queued are skipped. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { store, denied } = await authorize(request);
  if (denied) return denied;
  const mailer = mailerFromEnv();
  if (!mailer) return json(503, { error: "email_unavailable" });
  const { id } = await params;
  const campaign = await store.campaign(id);
  if (!campaign) return json(404, { error: "not_found" });

  const recipients = await store.takeRecipients(id, batchSize);
  const results = {
    sent: [] as string[],
    skipped: [] as string[],
    failed: [] as { email: string; error: string }[],
  };
  for (let start = 0; start < recipients.length; start += concurrency)
    await Promise.all(
      recipients.slice(start, start + concurrency).map(async (email: string) => {
        try {
          const entry = await store.get(email);
          if (!entry || entry.unsubscribedAt) return results.skipped.push(email);
          await deliver(store, mailer, email, campaign, recipientVariables(entry));
          results.sent.push(email);
        } catch (error) {
          results.failed.push({ email, error: (error as Error).message });
        }
      }),
    );
  await store.recordResults(id, results);
  return json(200, { campaign: await store.campaign(id) });
}
