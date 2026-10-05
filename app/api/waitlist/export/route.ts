import { createHash, timingSafeEqual } from "node:crypto";
import { toCsv, waitlistFromEnv } from "../../../waitlist.mjs";

const privateHeaders = {
  "cache-control": "no-store",
  "x-robots-tag": "noindex",
};

/** Downloads the waitlist as CSV. The browser asks for the password set in
    WAITLIST_ADMIN_PASSWORD; any username works. */
export async function GET(request: Request) {
  const password = process.env.WAITLIST_ADMIN_PASSWORD;
  if (!password)
    return new Response("Not found", { status: 404, headers: privateHeaders });
  if (!authorized(request.headers.get("authorization"), password))
    return new Response("Password required", {
      status: 401,
      headers: {
        ...privateHeaders,
        "www-authenticate": 'Basic realm="SynoRing waitlist", charset="UTF-8"',
      },
    });

  const waitlist = waitlistFromEnv();
  if (!waitlist)
    return new Response("Waitlist storage is not configured", {
      status: 503,
      headers: privateHeaders,
    });
  const date = new Date().toISOString().slice(0, 10);
  return new Response(toCsv(await waitlist.list()), {
    headers: {
      ...privateHeaders,
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="synoring-waitlist-${date}.csv"`,
    },
  });
}

function authorized(header: string | null, password: string) {
  if (!header?.startsWith("Basic ")) return false;
  const credentials = Buffer.from(header.slice(6), "base64").toString();
  const supplied = credentials.slice(credentials.indexOf(":") + 1);
  // Comparing digests keeps the check constant-time whatever the lengths.
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(supplied), digest(password));
}
