import { finishes } from "../../store/product";
import { parseSignup, waitlistFromEnv } from "../../waitlist.mjs";

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
    const created = await waitlist.join(result.signup, {
      country: request.headers.get("x-vercel-ip-country") ?? "",
    });
    return reply(200, { ok: true, created });
  } catch (error) {
    console.error(error);
    return reply(502, { error: "unavailable" });
  }
}
