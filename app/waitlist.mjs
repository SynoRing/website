/* Waitlist storage shared by the signup and export routes. Entries live in
   Upstash Redis (Vercel Marketplace), reached over its REST API so the site
   needs no extra dependency. Plain JavaScript so the tests run it directly.

   One hash per email holds the entry; a sorted set keeps signup order. A
   pre-order is a waitlist entry that also records the chosen finish and
   quantity, so the same email never appears twice. The marketing dashboard
   keeps its drafts and campaign send queues in the same database. */

/** @typedef {Record<string, string>} Entry */
/** @typedef {({ email: string, source: "waitlist" } | { email: string, source: "preorder", finish: string, quantity: number }) & { language?: string }} Signup */
/** @typedef {{ id: string, subject: string, preheader: string, body: string, audience: string, createdAt: string, total: number, pending: number, sent: number, failed: number, skipped: number }} Campaign */

export const sources = ["waitlist", "preorder"];
/** The site's languages, recorded with each signup. */
export const signupLanguages = ["en", "zh"];
export const maxQuantity = 99;

const emailPattern = /^[^\s@"<>()[\]\\,;:]+@[^\s@"<>()[\]\\,;:]+\.[a-z]{2,}$/i;

export function normalizeEmail(value) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && emailPattern.test(email) ? email : null;
}

/** Validates a signup request body. Returns `{ signup }`, `{ error }`, or
    `{ spam: true }` when the hidden field a person never sees is filled.
    @param {any} body
    @param {readonly string[]} finishIds
    @returns {{ signup: Signup, error?: undefined, spam?: undefined } | { error: string, signup?: undefined, spam?: undefined } | { spam: true, signup?: undefined, error?: undefined }} */
export function parseSignup(body, finishIds) {
  if (!body || typeof body !== "object") return { error: "invalid_request" };
  if (body.website) return { spam: true };
  const email = normalizeEmail(body.email);
  if (!email) return { error: "invalid_email" };
  const source = body.source ?? "waitlist";
  if (!sources.includes(source)) return { error: "invalid_request" };
  const language = signupLanguages.includes(body.language) ? { language: body.language } : {};
  if (source === "waitlist") return { signup: { email, source, ...language } };
  const quantity = Number(body.quantity);
  if (
    !finishIds.includes(body.finish) ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > maxQuantity
  )
    return { error: "invalid_request" };
  return { signup: { email, source, finish: body.finish, quantity, ...language } };
}

/** Production keeps the plain prefix; previews and local runs write to
    their own keys so test signups never mix into the real list. */
export function keyPrefix(environment) {
  return environment === "production"
    ? "waitlist"
    : `${environment || "development"}:waitlist`;
}

/** Sends a batch of Redis commands to Upstash in one round trip and
    resolves to their results, in order. Every argument goes as a string. */
export function upstash({ url, token, fetch: send = fetch }) {
  const endpoint = `${url.replace(/\/$/, "")}/pipeline`;
  /** @param {any[][]} commands
      @returns {Promise<any[]>} */
  return async function pipeline(commands) {
    const response = await send(endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(commands.map((command) => command.map(String))),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Storage responded ${response.status}`);
    const results = await response.json();
    const failed = results.find((item) => item.error);
    if (failed) throw new Error(`Storage error: ${failed.error}`);
    return results.map((item) => item.result);
  };
}

/** Upstash credentials from the environment, or null. Vercel's Upstash
    integration sets KV_* (STORAGE_KV_* with its default prefix); a direct
    Upstash link sets UPSTASH_REDIS_REST_*. */
export function upstashFromEnv(env = process.env) {
  const url =
    env.KV_REST_API_URL ||
    env.STORAGE_KV_REST_API_URL ||
    env.UPSTASH_REDIS_REST_URL;
  const token =
    env.KV_REST_API_TOKEN ||
    env.STORAGE_KV_REST_API_TOKEN ||
    env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

export function createWaitlist({
  url,
  token,
  prefix = "waitlist",
  fetch: send = fetch,
}) {
  const pipeline = upstash({ url, token, fetch: send });
  const indexKey = `${prefix}:emails`;
  const entryKey = (email) => `${prefix}:entry:${email}`;
  const draftIndex = `${prefix}:drafts`;
  const draftKey = (id) => `${prefix}:draft:${id}`;
  const campaignIndex = `${prefix}:campaigns`;
  const campaignKey = (id) => `${prefix}:campaign:${id}`;
  const queueKey = (id, queue) => `${campaignKey(id)}:${queue}`;
  let secretValue;

  const store = {
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
      if (signup.language) fields.push("language", signup.language);
      if (signup.source === "preorder")
        fields.push("finish", signup.finish, "quantity", signup.quantity);
      // Signing up again is a fresh opt-in, so it lifts an unsubscribe.
      const [created] = await pipeline([
        ["HSETNX", key, "createdAt", at],
        ["HSETNX", key, `${signup.source}At`, at],
        ["HSET", key, ...fields],
        ["HDEL", key, "unsubscribedAt"],
        ["ZADD", indexKey, "NX", now.getTime(), signup.email],
      ]);
      return created === 1;
    },

    /** Marks an entry unsubscribed. Resolves false for unknown emails. */
    async unsubscribe(email, now = new Date()) {
      const key = entryKey(email);
      const [exists] = await pipeline([["EXISTS", key]]);
      if (!exists) return false;
      await pipeline([["HSETNX", key, "unsubscribedAt", now.toISOString()]]);
      return true;
    },

    /** Deletes an entry entirely, for example on a deletion request. */
    async remove(email) {
      await pipeline([
        ["DEL", entryKey(email)],
        ["ZREM", indexKey, email],
      ]);
    },

    /** @returns {Promise<Entry | null>} */
    async get(email) {
      const [row] = await pipeline([["HGETALL", entryKey(email)]]);
      return row.length ? toObject(row) : null;
    },

    /** A random key made once per database, used to sign unsubscribe links. */
    async secret() {
      if (!secretValue) {
        const key = `${prefix}:secret`;
        const random = `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, "");
        [, secretValue] = await pipeline([
          ["SET", key, random, "NX"],
          ["GET", key],
        ]);
      }
      return secretValue;
    },

    /** Every entry, oldest first.
        @returns {Promise<Entry[]>} */
    async list() {
      const [emails] = await pipeline([["ZRANGE", indexKey, 0, -1]]);
      /** @type {Entry[]} */
      const entries = [];
      for (let start = 0; start < emails.length; start += 500) {
        const rows = await pipeline(
          emails
            .slice(start, start + 500)
            .map((email) => ["HGETALL", entryKey(email)]),
        );
        for (const row of rows) if (row.length) entries.push(toObject(row));
      }
      return entries;
    },

    /* Drafts: saved compositions, newest first. */
    /** @returns {Promise<Entry[]>} */
    async listDrafts() {
      const [ids] = await pipeline([["ZREVRANGE", draftIndex, 0, -1]]);
      return readAll(ids, draftKey);
    },

    async saveDraft(draft, now = new Date()) {
      const id = draft.id || newId(now);
      const fields = { ...pick(draft, draftFields), id, updatedAt: now.toISOString() };
      await pipeline([
        ["HSET", draftKey(id), ...Object.entries(fields).flat()],
        ["ZADD", draftIndex, now.getTime(), id],
      ]);
      return fields;
    },

    async deleteDraft(id) {
      await pipeline([
        ["DEL", draftKey(id)],
        ["ZREM", draftIndex, id],
      ]);
    },

    /* Campaigns: a snapshot of the message plus a queue of recipients.
       Sending pops recipients off the queue in batches, so a send can stop
       and resume without mailing anyone twice. */
    async createCampaign(message, emails, now = new Date()) {
      const id = newId(now);
      const fields = {
        ...pick(message, campaignFields),
        id,
        createdAt: now.toISOString(),
        total: emails.length,
      };
      const commands = [
        ["HSET", campaignKey(id), ...Object.entries(fields).flat()],
        ["ZADD", campaignIndex, now.getTime(), id],
      ];
      for (let start = 0; start < emails.length; start += 500)
        commands.push(["SADD", queueKey(id, "pending"), ...emails.slice(start, start + 500)]);
      await pipeline(commands);
      return store.campaign(id);
    },

    /** @returns {Promise<Campaign | null>} */
    async campaign(id) {
      const [row, ...counts] = await pipeline([
        ["HGETALL", campaignKey(id)],
        ...queues.map((queue) => ["SCARD", queueKey(id, queue)]),
      ]);
      if (!row.length) return null;
      const campaign = /** @type {any} */ (toObject(row));
      queues.forEach((queue, i) => (campaign[queue] = counts[i]));
      campaign.total = Number(campaign.total);
      return campaign;
    },

    async listCampaigns() {
      const [ids] = await pipeline([["ZREVRANGE", campaignIndex, 0, 49]]);
      return Promise.all(ids.map((id) => store.campaign(id)));
    },

    /** Takes up to `count` recipients off the queue.
        @returns {Promise<string[]>} */
    async takeRecipients(id, count) {
      const [emails] = await pipeline([["SPOP", queueKey(id, "pending"), count]]);
      return emails ?? [];
    },

    /** Files each recipient under sent, failed (with the reason), or skipped.
        @param {string} id
        @param {{ sent?: string[], failed?: { email: string, error: string }[], skipped?: string[] }} results */
    async recordResults(id, { sent = [], failed = [], skipped = [] }) {
      const commands = [];
      if (sent.length) commands.push(["SADD", queueKey(id, "sent"), ...sent]);
      if (skipped.length) commands.push(["SADD", queueKey(id, "skipped"), ...skipped]);
      if (failed.length)
        commands.push(
          ["SADD", queueKey(id, "failed"), ...failed.map((item) => item.email)],
          ["HSET", `${campaignKey(id)}:errors`, ...failed.flatMap((item) => [item.email, item.error])],
        );
      if (commands.length) await pipeline(commands);
    },

    /** Puts failed recipients back on the queue. */
    async retryFailed(id) {
      await pipeline([
        ["SUNIONSTORE", queueKey(id, "pending"), queueKey(id, "pending"), queueKey(id, "failed")],
        ["DEL", queueKey(id, "failed"), `${campaignKey(id)}:errors`],
      ]);
    },

    /** @returns {Promise<Entry>} */
    async campaignErrors(id) {
      const [row] = await pipeline([["HGETALL", `${campaignKey(id)}:errors`]]);
      return toObject(row);
    },
  };
  return store;

  async function readAll(ids, keyOf) {
    if (!ids.length) return [];
    const rows = await pipeline(ids.map((id) => ["HGETALL", keyOf(id)]));
    return rows.filter((row) => row.length).map(toObject);
  }
}

const draftFields = ["name", "subject", "preheader", "body"];
const campaignFields = ["subject", "preheader", "body", "audience"];
const queues = ["pending", "sent", "failed", "skipped"];

/** @param {string[]} row
    @returns {Entry} */
function toObject(row) {
  const object = {};
  for (let i = 0; i < row.length; i += 2) object[row[i]] = row[i + 1];
  return object;
}

function pick(source, keys) {
  return Object.fromEntries(keys.map((key) => [key, String(source[key] ?? "")]));
}

/** Sortable ids: time first, then a random tail. */
function newId(now) {
  return `${now.getTime().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
}

export const audiences = {
  all: "All subscribers",
  preorder: "Pre-orders",
  waitlist: "Waitlist only",
};

/** The subscribed entries an audience covers.
    @param {Entry[]} entries
    @param {string} audience */
export function selectAudience(entries, audience) {
  return entries.filter(
    (entry) =>
      !entry.unsubscribedAt &&
      (audience === "all" ||
        (audience === "preorder" && entry.preorderAt) ||
        (audience === "waitlist" && !entry.preorderAt)),
  );
}

/** The store configured for this deployment, or null without credentials. */
export function waitlistFromEnv(env = process.env) {
  const credentials = upstashFromEnv(env);
  if (!credentials) return null;
  return createWaitlist({ ...credentials, prefix: keyPrefix(env.VERCEL_ENV) });
}

export const csvColumns = [
  "email",
  "createdAt",
  "waitlistAt",
  "preorderAt",
  "finish",
  "quantity",
  "country",
  "language",
  "updatedAt",
  "unsubscribedAt",
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
