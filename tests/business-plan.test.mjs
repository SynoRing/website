import assert from "node:assert/strict";
import test from "node:test";
import {
  bpPrefix,
  businessPlanFromEnv,
  createBusinessPlan,
  generatePassword,
  normalizePassword,
  parseAccess,
  signSession,
  verifySession,
} from "../app/business-plan.mjs";
import { fakeUpstash } from "./fake-upstash.mjs";

function store(upstash = fakeUpstash()) {
  return createBusinessPlan({ url: "https://redis.example", token: "t", fetch: upstash.fetch });
}

test("generates readable passwords that name the recipient", () => {
  assert.match(generatePassword("Y Combinator"), /^y-combinator-[a-hj-km-np-z2-9]{4}-[a-hj-km-np-z2-9]{4}$/);
  assert.match(generatePassword("红杉"), /^[a-z2-9]{4}-[a-z2-9]{4}$/);
  assert.match(generatePassword("Andreessen Horowitz Growth"), /^andreessen-horow-\w{4}-\w{4}$/);
  assert.notEqual(generatePassword("yc"), generatePassword("yc"));
  assert.equal(normalizePassword("  YC-Summer-2026 "), "yc-summer-2026");
  for (const bad of ["short", "x".repeat(65), 42, undefined]) assert.equal(normalizePassword(bad), null);
});

test("requires a password, a name, an email, and the terms", () => {
  const body = { password: " YC-k7pd-3mqx ", name: "  Ada   Lovelace ", email: "Ada@YC.com", agree: true };
  assert.deepEqual(parseAccess(body), {
    access: { password: "yc-k7pd-3mqx", name: "Ada Lovelace", email: "ada@yc.com" },
  });
  assert.deepEqual(parseAccess({ ...body, password: " " }), { error: "wrong_password" });
  assert.deepEqual(parseAccess({ ...body, name: "" }), { error: "invalid_name" });
  assert.deepEqual(parseAccess({ ...body, email: "ada" }), { error: "invalid_email" });
  assert.deepEqual(parseAccess({ ...body, agree: "true" }), { error: "terms_not_accepted" });
  assert.deepEqual(parseAccess(null), { error: "invalid_request" });
});

test("signs sessions that expire and can't be altered", () => {
  const now = Date.UTC(2026, 9, 6);
  const cookie = signSession("secret", "viewer-1", now);
  assert.equal(verifySession("secret", cookie, now), "viewer-1");
  assert.equal(verifySession("secret", cookie, now + 8 * 24 * 3600 * 1000), null);
  assert.equal(verifySession("other", cookie, now), null);
  assert.equal(verifySession("secret", cookie.replace("viewer-1", "viewer-2"), now), null);
  const [id, , signature] = cookie.split(".");
  assert.equal(verifySession("secret", `${id}.never.${signature}`, now), null);
  assert.equal(verifySession("secret", `${cookie}.x`, now), null);
  assert.equal(verifySession("secret", undefined, now), null);
});

test("gives each recipient a unique password that can be turned off", async () => {
  const plan = store();
  const yc = await plan.createRecipient(
    { label: "YC", password: "yc-k7pd-3mqx" },
    new Date("2026-10-06T10:00:00Z"),
  );
  assert.equal(yc.label, "YC");
  assert.equal(await plan.createRecipient({ label: "Copy", password: "yc-k7pd-3mqx" }), null);
  assert.equal((await plan.recipientFor("yc-k7pd-3mqx")).id, yc.id);
  assert.equal(await plan.recipientFor("nope-nope"), null);

  assert.equal(await plan.setRevoked(yc.id, true), true);
  assert.equal(await plan.recipientFor("yc-k7pd-3mqx"), null);
  await plan.setRevoked(yc.id, false);
  assert.equal((await plan.recipientFor("yc-k7pd-3mqx")).id, yc.id);
  assert.equal(await plan.setRevoked("missing", true), false);
});

test("records who accepted the terms and how often they opened the plan", async () => {
  const upstash = fakeUpstash();
  const plan = store(upstash);
  const yc = await plan.createRecipient({ label: "YC", password: "yc-k7pd-3mqx" }, new Date("2026-10-06T10:00:00Z"));
  const sequoia = await plan.createRecipient({ label: "Sequoia", password: "sequoia-2a2a-3b3b" }, new Date("2026-10-06T11:00:00Z"));
  const ada = await plan.addViewer(
    yc.id,
    { name: "Ada", email: "ada@yc.com", terms: "2026-10-06", country: "US", ip: "1.2.3.4" },
    new Date("2026-10-06T12:00:00Z"),
  );
  await plan.addViewer(yc.id, { name: "Grace", email: "grace@yc.com", terms: "2026-10-06" }, new Date("2026-10-06T13:00:00Z"));
  await plan.recordView(ada, new Date("2026-10-06T12:01:00Z"));
  await plan.recordView(ada, new Date("2026-10-06T12:05:00Z"));

  const recipients = await plan.listRecipients();
  assert.deepEqual(recipients.map((item) => item.label), ["Sequoia", "YC"]);
  const [, listed] = recipients;
  assert.equal(listed.views, "2");
  assert.equal(listed.lastViewedAt, "2026-10-06T12:05:00.000Z");
  assert.deepEqual(listed.viewers.map((viewer) => viewer.name), ["Grace", "Ada"]);
  assert.equal(listed.viewers[1].views, "2");
  assert.equal(listed.viewers[1].country, "US");
  assert.deepEqual(recipients[0].viewers, []);

  const cookie = signSession(await plan.secret(), ada.id);
  assert.equal((await plan.session(cookie)).recipient.id, yc.id);
  await plan.setRevoked(yc.id, true);
  assert.equal(await plan.session(cookie), null);
  assert.equal(await plan.session("forged.0.x"), null);

  assert.equal(await plan.removeRecipient(yc.id), true);
  assert.deepEqual((await plan.listRecipients()).map((item) => item.id), [sequoia.id]);
  assert.equal(await plan.viewer(ada.id), null);
  assert.equal(await plan.createRecipient({ label: "YC again", password: "yc-k7pd-3mqx" }) !== null, true);
  assert.ok(![...upstash.data.keys()].some((key) => key.includes(yc.id)));
});

test("publishes an upload only when every part arrived, then drops the old one", async () => {
  const upstash = fakeUpstash();
  const plan = store(upstash);
  assert.equal(await plan.document(), null);

  await plan.putPart("v1", 0, "AAA=");
  assert.equal(await plan.publishDocument({ version: "v1", name: "plan.pdf", size: 5, parts: 2 }), null);
  await plan.putPart("v1", 1, "BBB=");
  const first = await plan.publishDocument(
    { version: "v1", name: "plan.pdf", size: 5, parts: 2 },
    new Date("2026-10-06T10:00:00Z"),
  );
  assert.deepEqual(first, {
    version: "v1",
    name: "plan.pdf",
    size: "5",
    parts: "2",
    uploadedAt: "2026-10-06T10:00:00.000Z",
  });
  assert.equal(await plan.readPart("v1", 1), "BBB=");

  await plan.putPart("v2", 0, "CCC=");
  await plan.publishDocument({ version: "v2", name: "plan-v2.pdf", size: 2, parts: 1 });
  assert.equal((await plan.document()).name, "plan-v2.pdf");
  assert.equal(await plan.readPart("v1", 0), null);
  assert.equal(await plan.readPart("v2", 0), "CCC=");
});

test("only counts wrong passwords toward the limit", async () => {
  const plan = store();
  for (let i = 0; i < 3; i++) {
    assert.equal(await plan.allow("1.2.3.4", 3), true);
    await plan.recordFailure("1.2.3.4");
  }
  assert.equal(await plan.allow("1.2.3.4", 3), false);
  assert.equal(await plan.allow("5.6.7.8", 3), true);
});

test("keeps production, preview, and local plans apart", () => {
  assert.equal(bpPrefix("production"), "bp");
  assert.equal(bpPrefix("preview"), "preview:bp");
  assert.equal(bpPrefix(undefined), "development:bp");
  assert.equal(businessPlanFromEnv({}), null);
  assert.ok(businessPlanFromEnv({ STORAGE_KV_REST_API_URL: "https://r.example", STORAGE_KV_REST_API_TOKEN: "t" }));
});
