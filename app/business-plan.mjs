/* The confidential business plan at /bp. Everyone it is sent to gets their
   own password, so access can be followed, and turned off, one recipient at
   a time. Before the plan opens, a visitor gives their name and email and
   accepts the confidentiality terms; each acceptance is kept.

   The PDF lives in the same Upstash database as the waitlist, split into
   base64 parts that each fit in one request. The site's repository is
   public, so nothing confidential can ship with the code. Plain JavaScript
   so the tests run it directly. */

import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { normalizeEmail, upstash, upstashFromEnv } from "./waitlist.mjs";

/** @typedef {Record<string, string>} Row */
/** @typedef {Row & { viewers: Row[] }} Recipient */

/** Upload part size: under Vercel's 4.5 MB request limit, and still
    under Upstash's once base64 makes it a third larger. */
export const partBytes = 2 * 1024 * 1024;
export const maxDocumentBytes = 40 * 1024 * 1024;
export const maxParts = Math.ceil(maxDocumentBytes / partBytes);

export const sessionSeconds = 7 * 24 * 60 * 60;

// No 0/o or 1/i/l, so a password read aloud or retyped comes out right.
const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";

/** A password like "y-combinator-k7pd-3mqx": who it is for, then eight
    random characters. */
export function generatePassword(label = "") {
  const slug = label
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 16)
    .replace(/^-+|-+$/g, "");
  const chunk = () =>
    Array.from({ length: 4 }, () => alphabet[randomInt(alphabet.length)]).join("");
  return [slug, chunk(), chunk()].filter(Boolean).join("-");
}

/** Passwords ignore case and surrounding space. Null unless 8 to 64
    characters. */
export function normalizePassword(value) {
  if (typeof value !== "string") return null;
  const password = value.trim().toLowerCase();
  return password.length >= 8 && password.length <= 64 ? password : null;
}

/** Validates the /bp form: password, name, email, and the terms box.
    @param {any} body
    @returns {{ access: { password: string, name: string, email: string }, error?: undefined } | { error: string, access?: undefined }} */
export function parseAccess(body) {
  if (!body || typeof body !== "object") return { error: "invalid_request" };
  const password = typeof body.password === "string" ? body.password.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  const email = normalizeEmail(body.email);
  if (!password) return { error: "wrong_password" };
  if (!name || name.length > 120) return { error: "invalid_name" };
  if (!email) return { error: "invalid_email" };
  if (body.agree !== true) return { error: "terms_not_accepted" };
  return { access: { password, name, email } };
}

/* A viewer's session cookie: their id and an expiry, signed with the
   database's secret. */
const mac = (secret, payload) =>
  createHmac("sha256", secret).update(`bp-session:${payload}`).digest("base64url");

export function signSession(secret, viewerId, now = Date.now()) {
  const payload = `${viewerId}.${Math.floor(now / 1000) + sessionSeconds}`;
  return `${payload}.${mac(secret, payload)}`;
}

/** The viewer id a cookie was signed for, or null if it is forged or old. */
export function verifySession(secret, value, now = Date.now()) {
  if (typeof value !== "string") return null;
  const [id, expires, signature, extra] = value.split(".");
  if (!id || !signature || extra !== undefined || !(Number(expires) * 1000 > now))
    return null;
  const given = Buffer.from(signature);
  const expected = Buffer.from(mac(secret, `${id}.${expires}`));
  return given.length === expected.length && timingSafeEqual(given, expected) ? id : null;
}

/** Production keeps the plain prefix; previews and local runs keep their
    own recipients and plan. */
export function bpPrefix(environment) {
  return environment === "production" ? "bp" : `${environment || "development"}:bp`;
}

export function createBusinessPlan({ url, token, prefix = "bp", fetch: send = fetch }) {
  const pipeline = upstash({ url, token, fetch: send });
  const recipientIndex = `${prefix}:recipients`;
  const recipientKey = (id) => `${prefix}:recipient:${id}`;
  const passwordKey = (password) => `${prefix}:password:${password}`;
  const viewerIndex = (recipientId) => `${prefix}:viewers:${recipientId}`;
  const viewerKey = (id) => `${prefix}:viewer:${id}`;
  const failureKey = (client) => `${prefix}:failures:${client}`;
  const documentKey = `${prefix}:document`;
  const partKey = (version, index) => `${documentKey}:${version}:${index}`;
  let secretValue;

  /** @returns {Promise<Row | null>} */
  async function read(key) {
    const [row] = await pipeline([["HGETALL", key]]);
    return row.length ? toObject(row) : null;
  }

  const store = {
    /** False once `client` has guessed wrong `limit` times in an hour.
        Right passwords never count, so one office can open it freely. */
    async allow(client, limit = 10) {
      const [count] = await pipeline([["GET", failureKey(client)]]);
      return Number(count ?? 0) < limit;
    },

    async recordFailure(client) {
      await pipeline([
        ["INCR", failureKey(client)],
        ["EXPIRE", failureKey(client), 3600, "NX"],
      ]);
    },

    /** A random key made once per database, used to sign sessions. */
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

    /* Recipients: one per person or firm the plan is sent to. */

    /** Adds a recipient. Resolves null when the password is taken.
        @param {{ label: string, password: string }} recipient */
    async createRecipient({ label, password }, now = new Date()) {
      const id = newId(now);
      const [claimed] = await pipeline([["SET", passwordKey(password), id, "NX"]]);
      if (claimed !== "OK") return null;
      const recipient = { id, label, password, createdAt: now.toISOString(), views: "0" };
      await pipeline([
        ["HSET", recipientKey(id), ...Object.entries(recipient).flat()],
        ["ZADD", recipientIndex, now.getTime(), id],
      ]);
      return recipient;
    },

    recipient: (id) => read(recipientKey(id)),

    /** The recipient a password opens the plan for, unless turned off. */
    async recipientFor(password) {
      const [id] = await pipeline([["GET", passwordKey(password)]]);
      const recipient = id && (await store.recipient(id));
      return recipient && !recipient.revokedAt ? recipient : null;
    },

    /** Every recipient, newest first, each with the people who opened the
        plan through it, newest first.
        @returns {Promise<Recipient[]>} */
    async listRecipients() {
      const [ids] = await pipeline([["ZREVRANGE", recipientIndex, 0, -1]]);
      if (!ids.length) return [];
      const results = await pipeline(
        ids.flatMap((id) => [
          ["HGETALL", recipientKey(id)],
          ["ZREVRANGE", viewerIndex(id), 0, -1],
        ]),
      );
      const viewerIds = ids.flatMap((_, i) => results[i * 2 + 1]);
      const viewerRows = viewerIds.length
        ? await pipeline(viewerIds.map((id) => ["HGETALL", viewerKey(id)]))
        : [];
      const viewers = new Map(
        viewerRows.filter((row) => row.length).map((row) => {
          const viewer = toObject(row);
          return [viewer.id, viewer];
        }),
      );
      return ids.flatMap((_, i) =>
        results[i * 2].length
          ? [
              {
                ...toObject(results[i * 2]),
                viewers: results[i * 2 + 1].map((id) => viewers.get(id)).filter(Boolean),
              },
            ]
          : [],
      );
    },

    /** Turns a recipient's password off, or back on. False if unknown. */
    async setRevoked(id, revoked, now = new Date()) {
      if (!(await store.recipient(id))) return false;
      await pipeline([
        revoked
          ? ["HSET", recipientKey(id), "revokedAt", now.toISOString()]
          : ["HDEL", recipientKey(id), "revokedAt"],
      ]);
      return true;
    },

    /** Deletes a recipient, their password, and their viewers' records. */
    async removeRecipient(id) {
      const recipient = await store.recipient(id);
      if (!recipient) return false;
      const [viewerIds] = await pipeline([["ZRANGE", viewerIndex(id), 0, -1]]);
      await pipeline([
        ["DEL", recipientKey(id), viewerIndex(id), passwordKey(recipient.password), ...viewerIds.map(viewerKey)],
        ["ZREM", recipientIndex, id],
      ]);
      return true;
    },

    /* Viewers: one per accepted set of terms. */

    /** Records who accepted the terms through a recipient's password.
        @param {string} recipientId
        @param {{ name: string, email: string, terms: string, country?: string, ip?: string }} details */
    async addViewer(recipientId, { name, email, terms, country = "", ip = "" }, now = new Date()) {
      const id = newId(now);
      const viewer = {
        id,
        recipientId,
        name,
        email,
        terms,
        acceptedAt: now.toISOString(),
        country,
        ip,
        views: "0",
      };
      await pipeline([
        ["HSET", viewerKey(id), ...Object.entries(viewer).flat()],
        ["ZADD", viewerIndex(recipientId), now.getTime(), id],
      ]);
      return viewer;
    },

    viewer: (id) => read(viewerKey(id)),

    /** The viewer a session cookie belongs to, with their recipient, while
        that recipient's password is still on. */
    async session(cookie, now = Date.now()) {
      const id = verifySession(await store.secret(), cookie, now);
      const viewer = id && (await store.viewer(id));
      const recipient = viewer && (await store.recipient(viewer.recipientId));
      return recipient && !recipient.revokedAt ? { viewer, recipient } : null;
    },

    /** Counts an opening of the plan for the viewer and their recipient. */
    async recordView(viewer, now = new Date()) {
      const at = now.toISOString();
      await pipeline([
        ["HINCRBY", viewerKey(viewer.id), "views", 1],
        ["HSET", viewerKey(viewer.id), "lastViewedAt", at],
        ["HINCRBY", recipientKey(viewer.recipientId), "views", 1],
        ["HSET", recipientKey(viewer.recipientId), "lastViewedAt", at],
      ]);
    },

    /* The document: parts upload one request at a time, then publishing
       swaps the new version in and drops the old one. */

    /** Stores one part of an upload. Parts never published expire in a day. */
    async putPart(version, index, base64) {
      await pipeline([["SET", partKey(version, index), base64, "EX", 86400]]);
    },

    /** Makes an uploaded version the current plan. Resolves null if a part
        is missing.
        @param {{ version: string, name: string, size: number, parts: number }} upload */
    async publishDocument({ version, name, size, parts }, now = new Date()) {
      const keys = Array.from({ length: parts }, (_, i) => partKey(version, i));
      const [present, previousRow] = await pipeline([
        ["EXISTS", ...keys],
        ["HGETALL", documentKey],
      ]);
      if (present !== parts) return null;
      const document = { version, name, size, parts, uploadedAt: now.toISOString() };
      const previous = toObject(previousRow);
      const commands = [
        ...keys.map((key) => ["PERSIST", key]),
        ["DEL", documentKey],
        ["HSET", documentKey, ...Object.entries(document).flat()],
      ];
      if (previous.version && previous.version !== version)
        commands.push([
          "DEL",
          ...Array.from({ length: Number(previous.parts) }, (_, i) => partKey(previous.version, i)),
        ]);
      await pipeline(commands);
      return store.document();
    },

    /** The current plan's details, or null before the first upload. */
    document: () => read(documentKey),

    /** @returns {Promise<string | null>} one part, base64 */
    async readPart(version, index) {
      const [part] = await pipeline([["GET", partKey(version, index)]]);
      return part;
    },
  };
  return store;
}

/** @param {string[]} row
    @returns {Row} */
function toObject(row) {
  const object = {};
  for (let i = 0; i < row.length; i += 2) object[row[i]] = row[i + 1];
  return object;
}

function newId(now) {
  return `${now.getTime().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
}

/** The store configured for this deployment, or null without credentials. */
export function businessPlanFromEnv(env = process.env) {
  const credentials = upstashFromEnv(env);
  return credentials
    ? createBusinessPlan({ ...credentials, prefix: bpPrefix(env.VERCEL_ENV) })
    : null;
}
