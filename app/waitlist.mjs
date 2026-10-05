/* Waitlist storage shared by the signup and export routes. Entries live in
   Upstash Redis (Vercel Marketplace), reached over its REST API so the site
   needs no extra dependency. Plain JavaScript so the tests run it directly.

   One hash per email holds the entry; a sorted set keeps signup order. A
   pre-order is a waitlist entry that also records the chosen finish and
   quantity, so the same email never appears twice. */

export const sources = ["waitlist", "preorder"];
export const maxQuantity = 99;

const emailPattern = /^[^\s@"<>()[\]\\,;:]+@[^\s@"<>()[\]\\,;:]+\.[a-z]{2,}$/i;

export function normalizeEmail(value) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && emailPattern.test(email) ? email : null;
}

/** Validates a signup request body. Returns `{ signup }`, `{ error }`, or
    `{ spam: true }` when the hidden field a person never sees is filled. */
export function parseSignup(body, finishIds) {
  if (!body || typeof body !== "object") return { error: "invalid_request" };
  if (body.website) return { spam: true };
  const email = normalizeEmail(body.email);
  if (!email) return { error: "invalid_email" };
  const source = body.source ?? "waitlist";
  if (!sources.includes(source)) return { error: "invalid_request" };
  if (source === "waitlist") return { signup: { email, source } };
  const quantity = Number(body.quantity);
  if (
    !finishIds.includes(body.finish) ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > maxQuantity
  )
    return { error: "invalid_request" };
  return { signup: { email, source, finish: body.finish, quantity } };
}

/** Production keeps the plain prefix; previews and local runs write to
    their own keys so test signups never mix into the real list. */
export function keyPrefix(environment) {
  return environment === "production"
    ? "waitlist"
    : `${environment || "development"}:waitlist`;
}

export function createWaitlist({
  url,
  token,
  prefix = "waitlist",
  fetch: send = fetch,
}) {
  const endpoint = `${url.replace(/\/$/, "")}/pipeline`;
  const indexKey = `${prefix}:emails`;
  const entryKey = (email) => `${prefix}:entry:${email}`;

  async function pipeline(commands) {
    const response = await send(endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(commands.map((command) => command.map(String))),
      cache: "no-store",
    });
    if (!response.ok)
      throw new Error(`Waitlist storage responded ${response.status}`);
    const results = await response.json();
    const failed = results.find((item) => item.error);
    if (failed) throw new Error(`Waitlist storage error: ${failed.error}`);
    return results.map((item) => item.result);
  }

  return {
    /** Counts a request from `client` in a one-hour window. */
    async allow(client, limit = 10) {
      const key = `${prefix}:rate:${client}`;
      const [count] = await pipeline([
        ["INCR", key],
        ["EXPIRE", key, 3600, "NX"],
      ]);
      return count <= limit;
    },

    /** Adds or updates an entry. Resolves true when the email is new. */
    async join(signup, { now = new Date(), country = "" } = {}) {
      const at = now.toISOString();
      const key = entryKey(signup.email);
      const fields = ["email", signup.email, "updatedAt", at];
      if (country) fields.push("country", country);
      if (signup.source === "preorder")
        fields.push("finish", signup.finish, "quantity", signup.quantity);
      const [created] = await pipeline([
        ["HSETNX", key, "createdAt", at],
        ["HSETNX", key, `${signup.source}At`, at],
        ["HSET", key, ...fields],
        ["ZADD", indexKey, "NX", now.getTime(), signup.email],
      ]);
      return created === 1;
    },

    /** Every entry, oldest first. */
    async list() {
      const [emails] = await pipeline([["ZRANGE", indexKey, 0, -1]]);
      const entries = [];
      for (let start = 0; start < emails.length; start += 500) {
        const rows = await pipeline(
          emails
            .slice(start, start + 500)
            .map((email) => ["HGETALL", entryKey(email)]),
        );
        for (const row of rows) {
          const entry = {};
          for (let i = 0; i < row.length; i += 2) entry[row[i]] = row[i + 1];
          entries.push(entry);
        }
      }
      return entries;
    },
  };
}

/** The store configured for this deployment, or null without credentials.
    Vercel's Upstash integration sets KV_*; a direct Upstash link sets
    UPSTASH_REDIS_REST_*. */
export function waitlistFromEnv(env = process.env) {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return createWaitlist({ url, token, prefix: keyPrefix(env.VERCEL_ENV) });
}

export const csvColumns = [
  "email",
  "createdAt",
  "waitlistAt",
  "preorderAt",
  "finish",
  "quantity",
  "country",
  "updatedAt",
];

/** CSV for spreadsheets. Cells that a spreadsheet would read as a formula
    are prefixed with an apostrophe. */
export function toCsv(entries) {
  const cell = (value = "") => {
    let text = String(value);
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return (
    [csvColumns, ...entries.map((entry) => csvColumns.map((key) => entry[key]))]
      .map((row) => row.map(cell).join(","))
      .join("\r\n") + "\r\n"
  );
}
