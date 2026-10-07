import assert from "node:assert/strict";
import test from "node:test";
import {
  createWaitlist,
  keyPrefix,
  normalizeEmail,
  parseSignup,
  selectAudience,
  toCsv,
  waitlistFromEnv,
} from "../app/waitlist.mjs";
import { fakeUpstash } from "./fake-upstash.mjs";

const finishIds = ["space-gray", "platinum", "rose-gold", "gold"];

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
  assert.deepEqual(parseSignup({ email: "ada@example.com", language: "zh" }, finishIds), {
    signup: { email: "ada@example.com", source: "waitlist", language: "zh" },
  });
  assert.deepEqual(parseSignup({ email: "ada@example.com", language: "xx" }, finishIds), {
    signup: { email: "ada@example.com", source: "waitlist" },
  });
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
      STORAGE_KV_REST_API_URL: "https://r.example",
      STORAGE_KV_REST_API_TOKEN: "t",
    }),
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
    "email,createdAt,waitlistAt,preorderAt,finish,quantity,country,language,updatedAt,unsubscribedAt\r\n" +
      "ada@example.com,2026-10-05T10:00:00.000Z,,,gold,2,,,,\r\n" +
      `'=cmd@example.com,,,,,,"a,""b""",,,\r\n`,
  );
});

function store(upstash = fakeUpstash()) {
  return createWaitlist({ url: "https://redis.example", token: "t", fetch: upstash.fetch });
}

test("unsubscribes, lets a new signup opt back in, and deletes on request", async () => {
  const waitlist = store();
  await waitlist.join({ email: "ada@example.com", source: "waitlist" });
  assert.equal(await waitlist.unsubscribe("nobody@example.com"), false);
  assert.equal(await waitlist.unsubscribe("ada@example.com"), true);
  assert.ok((await waitlist.get("ada@example.com")).unsubscribedAt);
  assert.deepEqual(selectAudience(await waitlist.list(), "all"), []);

  await waitlist.join({ email: "ada@example.com", source: "waitlist" });
  assert.equal((await waitlist.get("ada@example.com")).unsubscribedAt, undefined);

  await waitlist.remove("ada@example.com");
  assert.equal(await waitlist.get("ada@example.com"), null);
  assert.deepEqual(await waitlist.list(), []);
});

test("keeps one signing secret per database", async () => {
  const upstash = fakeUpstash();
  const first = await store(upstash).secret();
  assert.match(first, /^[0-9a-f]{64}$/);
  assert.equal(await store(upstash).secret(), first);
});

test("selects audiences from subscribed entries only", () => {
  const entries = [
    { email: "a@x.io", preorderAt: "t" },
    { email: "b@x.io" },
    { email: "c@x.io", preorderAt: "t", unsubscribedAt: "t" },
    { email: "d@x.io", unsubscribedAt: "t" },
  ];
  const emails = (audience) => selectAudience(entries, audience).map((entry) => entry.email);
  assert.deepEqual(emails("all"), ["a@x.io", "b@x.io"]);
  assert.deepEqual(emails("preorder"), ["a@x.io"]);
  assert.deepEqual(emails("waitlist"), ["b@x.io"]);
});

test("saves, lists, and deletes drafts, newest first", async () => {
  const waitlist = store();
  const first = await waitlist.saveDraft(
    { name: "Launch", subject: "Hi", preheader: "", body: "<p>One</p>", ignored: "x" },
    new Date("2026-10-05T10:00:00Z"),
  );
  await waitlist.saveDraft(
    { name: "Sizing", subject: "Kit", preheader: "", body: "<p>Two</p>" },
    new Date("2026-10-05T11:00:00Z"),
  );
  assert.equal(first.ignored, undefined);
  assert.deepEqual(
    (await waitlist.listDrafts()).map((draft) => draft.name),
    ["Sizing", "Launch"],
  );
  await waitlist.saveDraft({ ...first, body: "<p>Edited</p>" }, new Date("2026-10-05T12:00:00Z"));
  const drafts = await waitlist.listDrafts();
  assert.equal(drafts.length, 2);
  assert.equal(drafts[0].body, "<p>Edited</p>");
  await waitlist.deleteDraft(first.id);
  assert.deepEqual((await waitlist.listDrafts()).map((draft) => draft.name), ["Sizing"]);
});

test("queues a campaign and sends each recipient once, with retries", async () => {
  const waitlist = store();
  const emails = Array.from({ length: 45 }, (_, i) => `p${i}@example.com`);
  const campaign = await waitlist.createCampaign(
    { subject: "News", preheader: "", body: "<p>Hi</p>", audience: "all" },
    emails,
  );
  assert.equal(campaign.total, 45);
  assert.equal(campaign.pending, 45);

  const seen = new Set();
  for (;;) {
    const batch = await waitlist.takeRecipients(campaign.id, 20);
    if (!batch.length) break;
    batch.forEach((email) => {
      assert.ok(!seen.has(email), `${email} taken twice`);
      seen.add(email);
    });
    const [failed, ...sent] = batch;
    await waitlist.recordResults(campaign.id, {
      sent: sent.slice(1),
      skipped: sent.slice(0, 1),
      failed: [{ email: failed, error: "Address bounced" }],
    });
  }
  assert.equal(seen.size, 45);
  let status = await waitlist.campaign(campaign.id);
  assert.deepEqual(
    [status.pending, status.sent, status.failed, status.skipped],
    [0, 39, 3, 3],
  );
  assert.equal(Object.keys(await waitlist.campaignErrors(campaign.id)).length, 3);

  await waitlist.retryFailed(campaign.id);
  status = await waitlist.campaign(campaign.id);
  assert.deepEqual([status.pending, status.failed], [3, 0]);
  assert.deepEqual(await waitlist.campaignErrors(campaign.id), {});
  assert.deepEqual(
    (await waitlist.listCampaigns()).map((item) => item.id),
    [campaign.id],
  );
  assert.equal(await waitlist.campaign("missing"), null);
});
