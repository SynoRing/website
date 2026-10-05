import { cookies } from "next/headers";
import { json } from "../../../marketing/server";
import {
  createSession,
  passwordMatches,
  sessionCookie,
} from "../../../marketing/session";
import { waitlistFromEnv } from "../../../waitlist.mjs";

export async function POST(request: Request) {
  const password = process.env.MARKETING_PASSWORD;
  if (!password) return json(404, { error: "not_configured" });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return json(403, { error: "forbidden" });

  // Ten attempts an hour per connection when storage is available.
  const client =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const store = waitlistFromEnv();
  if (store && !(await store.allow(`login:${client}`)))
    return json(429, { error: "rate_limited" });

  const body = await request.json().catch(() => ({}));
  if (typeof body.password !== "string" || !passwordMatches(body.password, password))
    return json(401, { error: "wrong_password" });

  const session = createSession(password);
  (await cookies()).set(sessionCookie, session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: session.maxAge,
  });
  return json(200, { ok: true });
}
