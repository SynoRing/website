import { verifyUnsubscribe } from "../../mailer.mjs";
import { waitlistFromEnv } from "../../waitlist.mjs";

/** Unsubscribes from either the button on /unsubscribe (a form post, then
    back to the page) or a mail client's one-click request (RFC 8058). */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const form = await request.formData().catch(() => null);
  const email = String(form?.get("e") ?? url.searchParams.get("e") ?? "");
  const token = String(form?.get("t") ?? url.searchParams.get("t") ?? "");
  const fromPage = form?.has("e") ?? false;

  const store = waitlistFromEnv();
  if (!store) return new Response("Unavailable", { status: 503 });
  const valid = verifyUnsubscribe(await store.secret(), email, token);
  if (valid) await store.unsubscribe(email);

  if (fromPage)
    return Response.redirect(
      new URL(valid ? "/unsubscribe?done=1" : "/unsubscribe", url),
      303,
    );
  return new Response(valid ? "Unsubscribed" : "Invalid link", {
    status: valid ? 200 : 400,
    headers: { "cache-control": "no-store" },
  });
}
