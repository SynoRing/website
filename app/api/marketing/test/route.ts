import { mailerFromEnv } from "../../../mailer.mjs";
import { authorize, deliver, json } from "../../../(tools)/marketing/server";
import { normalizeEmail } from "../../../waitlist.mjs";

/** Sends one copy of a draft to a single address, marked as a test. */
export async function POST(request: Request) {
  const { store, denied } = await authorize(request);
  if (denied) return denied;
  const mailer = mailerFromEnv();
  if (!mailer) return json(503, { error: "email_unavailable" });
  const body = await request.json().catch(() => ({}));
  const to = normalizeEmail(body.to);
  if (!to) return json(400, { error: "invalid_email" });
  if (!body.subject || !body.body) return json(400, { error: "missing_content" });
  try {
    await deliver(
      store,
      mailer,
      to,
      { subject: `[Test] ${body.subject}`, preheader: body.preheader, body: body.body },
      { finish: "Space Gray", quantity: "1" },
    );
    return json(200, { ok: true });
  } catch (error) {
    return json(502, { error: "send_failed", detail: (error as Error).message });
  }
}
