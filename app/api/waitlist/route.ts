import { after } from "next/server";
import { confirmationEmail } from "../../email-template.mjs";
import { mailerFromEnv } from "../../mailer.mjs";
import { deliver, recipientVariables } from "../../(tools)/marketing/server";
import { finishes, preorderPrice } from "../../store/product";
import { parseSignup, waitlistFromEnv } from "../../waitlist.mjs";
import { clickIdFrom } from "../../x-click-id.mjs";
import { preorderConversion, xConversionsFromEnv } from "../../x-conversions.mjs";

const finishIds: string[] = finishes.map((finish) => finish.id);

function reply(status: number, body: object) {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

/** Joins the waitlist, or records a pre-order request on the same entry. */
export async function POST(request: Request) {
  // Signups come from the site's own pages.
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return reply(403, { error: "forbidden" });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return reply(400, { error: "invalid_request" });
  }
  const result = parseSignup(body, finishIds);
  if (result.spam) return reply(200, { ok: true, created: true });
  if (!result.signup) return reply(400, { error: result.error });

  const waitlist = waitlistFromEnv();
  if (!waitlist) {
    if (process.env.NODE_ENV === "production")
      return reply(503, { error: "unavailable" });
    console.warn("Waitlist storage is not configured; not saved:", result.signup);
    return reply(200, { ok: true, created: true });
  }

  try {
    const client =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      "unknown";
    if (!(await waitlist.allow(client)))
      return reply(429, { error: "rate_limited" });
    const signup = result.signup;
    const created = await waitlist.join(signup, {
      country: request.headers.get("x-vercel-ip-country") ?? "",
    });
    // Confirm new signups and every pre-order request by email, after the
    // response so the form never waits on it.
    const mailer = mailerFromEnv();
    if (mailer && (created || signup.source === "preorder"))
      after(async () => {
        const message =
          signup.source === "preorder"
            ? confirmationEmail("preorder", {
                subtotal: String(preorderPrice * signup.quantity),
              })
            : confirmationEmail("waitlist");
        const variables =
          signup.source === "preorder"
            ? recipientVariables({
                finish: signup.finish,
                quantity: String(signup.quantity),
              })
            : {};
        await deliver(waitlist, mailer, signup.email, message, variables).catch(
          (error) => console.error("Confirmation email failed:", error),
        );
      });
    // Report pre-orders to X Ads, unless the browser sends Global Privacy
    // Control, the opt-out from ad tracking.
    const conversions = xConversionsFromEnv();
    if (
      conversions &&
      signup.source === "preorder" &&
      request.headers.get("sec-gpc") !== "1"
    )
      after(async () => {
        const conversion = preorderConversion({
          email: signup.email,
          finish: signup.finish,
          name: `SynoRing R1 ${finishes.find((finish) => finish.id === signup.finish)?.name ?? ""}`.trim(),
          quantity: signup.quantity,
          price: preorderPrice,
          twclid: clickIdFrom(request.headers.get("cookie")),
          ip: client === "unknown" ? "" : client,
          userAgent: request.headers.get("user-agent") ?? "",
          sourceUrl: request.headers.get("referer") ?? "",
        });
        await conversions
          .send(conversion)
          .catch((error) => console.error("X conversion failed:", error));
      });
    return reply(200, { ok: true, created });
  } catch (error) {
    console.error(error);
    return reply(502, { error: "unavailable" });
  }
}
