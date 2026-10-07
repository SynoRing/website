import { cookies } from "next/headers";
import {
  businessPlanFromEnv,
  parseAccess,
  sessionSeconds,
  signSession,
} from "../../../business-plan.mjs";
import { viewerCookie } from "../../../bp/server";
import { termsVersion } from "../../../bp/terms";

function reply(status: number, body: object) {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

/** Checks a recipient's password, records who accepted the terms, and
    signs them in to view the plan. */
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return reply(403, { error: "forbidden" });
  const plan = businessPlanFromEnv();
  if (!plan) return reply(503, { error: "unavailable" });

  const result = parseAccess(await request.json().catch(() => null));
  if (!result.access) return reply(400, { error: result.error });
  const { password, name, email } = result.access;

  const client =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  try {
    if (!(await plan.allow(client)))
      return reply(429, { error: "rate_limited" });
    const recipient = await plan.recipientFor(password);
    if (!recipient) {
      await plan.recordFailure(client);
      return reply(401, { error: "wrong_password" });
    }
    const viewer = await plan.addViewer(recipient.id, {
      name,
      email,
      terms: termsVersion,
      country: request.headers.get("x-vercel-ip-country") ?? "",
      ip: client,
    });
    (await cookies()).set(viewerCookie, signSession(await plan.secret(), viewer.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionSeconds,
    });
    return reply(200, { ok: true });
  } catch (error) {
    console.error(error);
    return reply(502, { error: "unavailable" });
  }
}
