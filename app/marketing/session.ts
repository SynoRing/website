import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/* The dashboard has one shared password, MARKETING_PASSWORD. Signing in sets
   a week-long cookie signed with a key derived from that password, so
   changing the password signs everyone out. */

export const sessionCookie = "synoring_marketing";
const sessionSeconds = 7 * 24 * 60 * 60;

const digest = (value: string) => createHash("sha256").update(value).digest();

function sign(password: string, expires: number) {
  return createHmac("sha256", digest(`synoring-marketing:${password}`))
    .update(`session:${expires}`)
    .digest("base64url");
}

export function passwordMatches(supplied: string, password: string) {
  return timingSafeEqual(digest(supplied), digest(password));
}

export function createSession(password: string, now = Date.now()) {
  const expires = Math.floor(now / 1000) + sessionSeconds;
  return { value: `${expires}.${sign(password, expires)}`, maxAge: sessionSeconds };
}

export function verifySession(
  value: string | undefined,
  password = process.env.MARKETING_PASSWORD,
  now = Date.now(),
) {
  if (!value || !password) return false;
  const [expires, signature] = value.split(".");
  if (!signature || Number(expires) * 1000 < now) return false;
  return passwordMatches(signature, sign(password, Number(expires)));
}

export async function isSignedIn() {
  return verifySession((await cookies()).get(sessionCookie)?.value);
}
