import assert from "node:assert/strict";
import test from "node:test";
import {
  createWaitlist,
  keyPrefix,
  normalizeEmail,
  parseSignup,
  toCsv,
  waitlistFromEnv,
} from "../app/waitlist.mjs";

const finishIds = ["space-gray", "platinum", "rose-gold", "gold"];

/** An in-memory stand-in for the Upstash REST pipeline endpoint, covering
    the commands the waitlist sends. */
function fakeUpstash() {
  const strings = new Map();
  const hashes = new Map();
  const sorted = new Map();
  const requests = [];
  const run = ([command, key, ...args]) => {
    switch (command) {
      case "INCR": {
        const value = Number(strings.get(key) ?? 0) + 1;
        strings.set(key, String(value));
        return value;
      }
      case "EXPIRE":
        return 1;
      case "HSETNX": {
        const hash = hashes.get(key) ?? new Map();
        hashes.set(key, hash);
        if (hash.has(args[0])) return 0;
        hash.set(args[0], args[1]);
        return 1;
      }
      case "HSET": {
        const hash = hashes.get(key) ?? new Map();
        hashes.set(key, hash);
        let added = 0;
        for (let i = 0; i < args.length; i += 2) {
          if (!hash.has(args[i])) added++;
          hash.set(args[i], args[i + 1]);
        }
        return added;
      }
      case "ZADD": {
        const set = sorted.get(key) ?? new Map();
        sorted.set(key, set);
        const [flag, score, member] = args;
        assert.equal(flag, "NX");
        if (set.has(member)) return 0;
        set.set(member, Number(score));
        return 1;
      }
      case "ZRANGE":
        return [...(sorted.get(key) ?? new Map())]
          .sort((a, b) => a[1] - b[1])
          .map(([member]) => member);
      case "HGETALL":
        return [...(hashes.get(key) ?? new Map())].flat();
      default:
        throw new Error(`unexpected command ${command}`);
    }
  };
  async function fetch(url, init) {
    requests.push({ url, init });
    const commands = JSON.parse(init.body);
    for (const command of commands)
      for (const part of command) assert.equal(typeof part, "string");
    return Response.json(commands.map((command) => ({ result: run(command) })));
  }
  return { fetch, hashes, requests };
}

test("normalizes and validates email addresses", () => {
  assert.equal(normalizeEmail("  Ada@Example.COM "), "ada@example.com");
  for (const bad of ["", "ada", "ada@", "@example.com", "ada@example", "a b@c.io", 42])
    assert.equal(normalizeEmail(bad), null, String(bad));
  assert.equal(normalizeEmail(`${"a".repeat(250)}@x.io`), null);
});

test("accepts waitlist and pre-order requests and rejects the rest", () => {
  assert.deepEqual(parseSignup({ email: "ada@example.com" }, finishIds), {
    signup: { email: "ada@example.com", source: "waitlist" },
  });
  assert.deepEqual(
    parseSignup(
      { email: "ada@example.com", source: "preorder", finish: "gold", quantity: 2 },
      finishIds,
    ),
    {
      signup: {
        email: "ada@example.com",
        source: "preorder",
        finish: "gold",
        quantity: 2,
      },
    },
  );
  assert.deepEqual(parseSignup({ email: "nope" }, finishIds), {
    error: "invalid_email",
  });
  for (const body of [
    null,
    "ada@example.com",
    { email: "ada@example.com", source: "admin" },
    { email: "ada@example.com", source: "preorder", finish: "silver", quantity: 1 },
    { email: "ada@example.com", source: "preorder", finish: "gold", quantity: 0 },
    { email: "ada@example.com", source: "preorder", finish: "gold", quantity: 100 },
    { email: "ada@example.com", source: "preorder", finish: "gold", quantity: 1.5 },
  ])
    assert.deepEqual(parseSignup(body, finishIds), { error: "invalid_request" });
  assert.deepEqual(
    parseSignup({ email: "bot@example.com", website: "https://spam" }, finishIds),
    { spam: true },
  );
});

test("keeps one entry per email and adds the pre-order to it", async () => {
  const upstash = fakeUpstash();
  const waitlist = createWaitlist({
    url: "https://redis.example/",
    token: "secret",
    fetch: upstash.fetch,
  });
  const first = new Date("2026-10-05T10:00:00Z");
  const later = new Date("2026-10-06T09:30:00Z");

  assert.equal(
    await waitlist.join(
      { email: "ada@example.com", source: "waitlist" },
      { now: first, country: "US" },
    ),
    true,
  );
  assert.equal(
    await waitlist.join(
      { email: "ada@example.com", source: "preorder", finish: "rose-gold", quantity: 2 },
      { now: later },
    ),
    false,
  );
  await waitlist.join(
    { email: "grace@example.com", source: "preorder", finish: "gold", quantity: 1 },
    { now: later, country: "CA" },
  );

  assert.deepEqual(await waitlist.list(), [
    {
      createdAt: first.toISOString(),
      waitlistAt: first.toISOString(),
      email: "ada@example.com",
      updatedAt: later.toISOString(),
      country: "US",
      preorderAt: later.toISOString(),
      finish: "rose-gold",
      quantity: "2",
    },
    {
      createdAt: later.toISOString(),
      preorderAt: later.toISOString(),
      email: "grace@example.com",
      updatedAt: later.toISOString(),
      country: "CA",
      finish: "gold",
      quantity: "1",
    },
  ]);
  const { url, init } = upstash.requests[0];
  assert.equal(url, "https://redis.example/pipeline");
  assert.equal(init.headers.authorization, "Bearer secret");
});

test("limits repeated requests from one connection", async () => {
  const waitlist = createWaitlist({
    url: "https://redis.example",
    token: "secret",
    fetch: fakeUpstash().fetch,
  });
  for (let i = 0; i < 3; i++) assert.equal(await waitlist.allow("1.2.3.4", 3), true);
  assert.equal(await waitlist.allow("1.2.3.4", 3), false);
  assert.equal(await waitlist.allow("5.6.7.8", 3), true);
});

test("surfaces storage failures instead of reporting success", async () => {
  const failing = createWaitlist({
    url: "https://redis.example",
    token: "wrong",
    fetch: async () => new Response("Unauthorized", { status: 401 }),
  });
  await assert.rejects(
    failing.join({ email: "ada@example.com", source: "waitlist" }),
    /responded 401/,
  );
  const erroring = createWaitlist({
    url: "https://redis.example",
    token: "secret",
    fetch: async () => Response.json([{ error: "ERR wrong type" }]),
  });
  await assert.rejects(erroring.allow("1.2.3.4"), /wrong type/);
});

test("separates preview and local signups from production", () => {
  assert.equal(keyPrefix("production"), "waitlist");
  assert.equal(keyPrefix("preview"), "preview:waitlist");
  assert.equal(keyPrefix(undefined), "development:waitlist");
  assert.equal(waitlistFromEnv({}), null);
  assert.ok(
    waitlistFromEnv({ KV_REST_API_URL: "https://r.example", KV_REST_API_TOKEN: "t" }),
  );
  assert.ok(
    waitlistFromEnv({
      UPSTASH_REDIS_REST_URL: "https://r.example",
      UPSTASH_REDIS_REST_TOKEN: "t",
    }),
  );
});

test("exports spreadsheet-safe CSV", () => {
  const csv = toCsv([
    { email: "ada@example.com", createdAt: "2026-10-05T10:00:00.000Z", finish: "gold", quantity: "2" },
    { email: "=cmd@example.com", country: 'a,"b"' },
  ]);
  assert.equal(
    csv,
    "email,createdAt,waitlistAt,preorderAt,finish,quantity,country,updatedAt\r\n" +
      "ada@example.com,2026-10-05T10:00:00.000Z,,,gold,2,,\r\n" +
      `'=cmd@example.com,,,,,,"a,""b""",\r\n`,
  );
});
