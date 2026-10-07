/* The confidential business plan at /bp. Everyone it is sent to gets their
   own password, so access can be followed, and turned off, one recipient at
   a time. A visitor enters the password and accepts the confidentiality
   terms; each acceptance is kept.

   The plan is written in the marketing dashboard as HTML, with an optional
   PDF alongside. That working copy is Latest: it is live, so recipients
   who see Latest get every saved edit. Locking Latest makes a numbered
   version (v1, v2, ...) that never changes afterwards, and a recipient can
   be pinned to one.

   Everything lives in the same Upstash database as the waitlist; PDFs are
   split into base64 parts that each fit in one request. The site's
   repository is public, so nothing confidential can ship with the code.
   Plain JavaScript so the tests run it directly. */

import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { upstash, upstashFromEnv } from "./waitlist.mjs";

/** @typedef {Record<string, string>} Row */
/** @typedef {Row & { viewers: Row[] }} Recipient */

/** Upload part size: under Vercel's 4.5 MB request limit, and still
    under Upstash's once base64 makes it a third larger. */
export const partBytes = 2 * 1024 * 1024;
export const maxPdfBytes = 40 * 1024 * 1024;
export const maxParts = Math.ceil(maxPdfBytes / partBytes);
export const maxHtmlLength = 500_000;

export const sessionSeconds = 7 * 24 * 60 * 60;

const pdfFields = ["pdfUpload", "pdfName", "pdfSize", "pdfParts"];

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

/** Validates the /bp form: the password and the terms box.
    @param {any} body
    @returns {{ password: string, error?: undefined } | { error: string, password?: undefined }} */
export function parseAccess(body) {
  if (!body || typeof body !== "object") return { error: "invalid_request" };
  const password = typeof body.password === "string" ? body.password.trim().toLowerCase() : "";
  if (!password) return { error: "wrong_password" };
  if (body.agree !== true) return { error: "terms_not_accepted" };
  return { password };
}

/** Strips what could run code from the plan's HTML: scripts, frames,
    style blocks, event handler attributes, and javascript: links. The
    dashboard is the only author; this keeps a pasted snippet from doing
    more than lay out text. */
export function cleanHtml(html) {
  return String(html)
    .replace(/<(script|style|iframe|object|embed|template)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<\/?(script|style|iframe|object|embed|template|link|meta|base|form)\b[^>]*>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s+(href|src)\s*=\s*("\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]+)/gi, "");
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
  const latestKey = `${prefix}:latest`;
  const versionIndex = `${prefix}:versions`;
  const versionKey = (id) => `${prefix}:version:${id}`;
  const counterKey = `${prefix}:version-number`;
  const partKey = (upload, index) => `${prefix}:pdf:${upload}:${index}`;
  const partKeys = (upload, parts) =>
    Array.from({ length: Number(parts) }, (_, i) => partKey(upload, i));
  let secretValue;

  /** @returns {Promise<Row | null>} */
  async function read(key) {
    const [row] = await pipeline([["HGETALL", key]]);
    return row.length ? toObject(row) : null;
  }

  /** @returns {Promise<Row[]>} */
  async function readAll(keys) {
    if (!keys.length) return [];
    const rows = await pipeline(keys.map((key) => ["HGETALL", key]));
    return rows.filter((row) => row.length).map(toObject);
  }

  /** Deletes a PDF's parts unless Latest or a version still uses it. */
  async function releasePdf(upload, parts) {
    if (!upload) return;
    const [ids] = await pipeline([["ZRANGE", versionIndex, 0, -1]]);
    const uploads = await pipeline([
      ["HGET", latestKey, "pdfUpload"],
      ...ids.map((id) => ["HGET", versionKey(id), "pdfUpload"]),
    ]);
    if (!uploads.includes(upload)) await pipeline([["DEL", ...partKeys(upload, parts)]]);
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

    /* Latest: the live plan the dashboard edits. */

    /** @returns {Promise<Row>} */
    async latest() {
      return (await read(latestKey)) ?? {};
    },

    async saveLatest(html, now = new Date()) {
      await pipeline([["HSET", latestKey, "html", cleanHtml(html), "updatedAt", now.toISOString()]]);
      return store.latest();
    },

    /** Stores one part of a PDF upload. Parts never attached expire in a day. */
    async putPart(upload, index, base64) {
      await pipeline([["SET", partKey(upload, index), base64, "EX", 86400]]);
    },

    /** Attaches an uploaded PDF to Latest, replacing its PDF. Resolves null
        if a part is missing.
        @param {{ upload: string, name: string, size: number, parts: number }} pdf */
    async attachPdf({ upload, name, size, parts }, now = new Date()) {
      const keys = partKeys(upload, parts);
      const [present] = await pipeline([["EXISTS", ...keys]]);
      if (present !== parts) return null;
      const previous = await store.latest();
      await pipeline([
        ...keys.map((key) => ["PERSIST", key]),
        ["HSET", latestKey, "pdfUpload", upload, "pdfName", name, "pdfSize", size, "pdfParts", parts, "updatedAt", now.toISOString()],
      ]);
      if (previous.pdfUpload !== upload) await releasePdf(previous.pdfUpload, previous.pdfParts);
      return store.latest();
    },

    /** Takes the PDF off Latest; versions that have it keep it. */
    async detachPdf(now = new Date()) {
      const previous = await store.latest();
      await pipeline([
        ["HDEL", latestKey, ...pdfFields],
        ["HSET", latestKey, "updatedAt", now.toISOString()],
      ]);
      await releasePdf(previous.pdfUpload, previous.pdfParts);
      return store.latest();
    },

    /** Replaces Latest with a copy of a version, its PDF included. */
    async restoreLatest(id, now = new Date()) {
      const version = await store.version(id);
      if (!version) return null;
      const previous = await store.latest();
      const pdf = pdfFields.filter((field) => version[field]).flatMap((field) => [field, version[field]]);
      await pipeline([
        ["DEL", latestKey],
        ["HSET", latestKey, "html", version.html ?? "", "updatedAt", now.toISOString(), ...pdf],
      ]);
      if (previous.pdfUpload !== version.pdfUpload)
        await releasePdf(previous.pdfUpload, previous.pdfParts);
      return store.latest();
    },

    /* Versions: numbered, locked copies of Latest, newest first. */

    /** Locks a copy of Latest as the next version. Resolves null when
        Latest has neither HTML nor a PDF. */
    async lock(note = "", now = new Date()) {
      const latest = await store.latest();
      if (!latest.html?.trim() && !latest.pdfUpload) return null;
      const [number] = await pipeline([["INCR", counterKey]]);
      const version = {
        id: newId(now),
        number: String(number),
        note,
        html: latest.html ?? "",
        lockedAt: now.toISOString(),
        ...Object.fromEntries(pdfFields.filter((field) => latest[field]).map((field) => [field, latest[field]])),
      };
      await pipeline([
        ["HSET", versionKey(version.id), ...Object.entries(version).flat()],
        ["ZADD", versionIndex, number, version.id],
      ]);
      return version;
    },

    /** The number the next locked version will get. Numbers of deleted
        versions aren't reused. */
    async nextNumber() {
      const [count] = await pipeline([["GET", counterKey]]);
      return Number(count ?? 0) + 1;
    },

    async versions() {
      const [ids] = await pipeline([["ZREVRANGE", versionIndex, 0, -1]]);
      return readAll(ids.map(versionKey));
    },

    version: (id) => read(versionKey(id)),

    /** What a recipient sees: the version they are pinned to, or Latest.
        Null while there is nothing to show. */
    async versionFor(recipient) {
      const pinned = recipient.versionId && (await store.version(recipient.versionId));
      if (pinned) return pinned;
      const latest = await store.latest();
      return latest.html?.trim() || latest.pdfUpload ? latest : null;
    },

    /** Deletes a version. Recipients pinned to it see Latest instead. */
    async removeVersion(id) {
      const version = await store.version(id);
      if (!version) return false;
      await pipeline([
        ["DEL", versionKey(id)],
        ["ZREM", versionIndex, id],
      ]);
      await releasePdf(version.pdfUpload, version.pdfParts);
      return true;
    },

    /** @returns {Promise<string | null>} one part of a PDF, base64 */
    async readPart(upload, index) {
      const [part] = await pipeline([["GET", partKey(upload, index)]]);
      return part;
    },

    /* Recipients: one per person or firm the plan is sent to. */

    /** Adds a recipient. Resolves null when the password is taken.
        @param {{ label: string, password: string, versionId?: string }} recipient */
    async createRecipient({ label, password, versionId = "" }, now = new Date()) {
      const id = newId(now);
      const [claimed] = await pipeline([["SET", passwordKey(password), id, "NX"]]);
      if (claimed !== "OK") return null;
      const recipient = { id, label, password, versionId, createdAt: now.toISOString(), views: "0" };
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

    /** Every recipient, newest first, each with the visits made through
        their password, newest first.
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
      const viewers = new Map(
        (await readAll(ids.flatMap((_, i) => results[i * 2 + 1]).map(viewerKey))).map(
          (viewer) => [viewer.id, viewer],
        ),
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

    /** Turns a recipient's password off or on, or pins them to a version
        ("" for Latest). False if the recipient is unknown.
        @param {string} id
        @param {{ revoked?: boolean, versionId?: string }} changes */
    async updateRecipient(id, { revoked, versionId }, now = new Date()) {
      if (!(await store.recipient(id))) return false;
      const commands = [];
      if (revoked === true) commands.push(["HSET", recipientKey(id), "revokedAt", now.toISOString()]);
      if (revoked === false) commands.push(["HDEL", recipientKey(id), "revokedAt"]);
      if (versionId !== undefined) commands.push(["HSET", recipientKey(id), "versionId", versionId]);
      if (commands.length) await pipeline(commands);
      return true;
    },

    /** Deletes a recipient, their password, and the record of their visits. */
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

    /** Records an acceptance of the terms through a recipient's password.
        @param {string} recipientId
        @param {{ terms: string, country?: string, ip?: string }} details */
    async addViewer(recipientId, { terms, country = "", ip = "" }, now = new Date()) {
      const id = newId(now);
      const viewer = { id, recipientId, terms, acceptedAt: now.toISOString(), country, ip, views: "0" };
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

    /** Counts an opening of a version, or of Latest, for the viewer and
        their recipient. */
    async recordView(viewer, version, now = new Date()) {
      const at = now.toISOString();
      await pipeline([
        ["HINCRBY", viewerKey(viewer.id), "views", 1],
        ["HSET", viewerKey(viewer.id), "lastViewedAt", at, "lastVersion", version.number || "latest"],
        ["HINCRBY", recipientKey(viewer.recipientId), "views", 1],
        ["HSET", recipientKey(viewer.recipientId), "lastViewedAt", at],
      ]);
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
