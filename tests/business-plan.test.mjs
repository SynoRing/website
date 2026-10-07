import assert from "node:assert/strict";
import test from "node:test";
import {
  bpPrefix,
  businessPlanFromEnv,
  cleanHtml,
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

const at = (time) => new Date(`2026-10-06T${time}:00Z`);

test("generates readable passwords that name the recipient", () => {
  assert.match(generatePassword("Y Combinator"), /^y-combinator-[a-hj-km-np-z2-9]{4}-[a-hj-km-np-z2-9]{4}$/);
  assert.match(generatePassword("红杉"), /^[a-z2-9]{4}-[a-z2-9]{4}$/);
  assert.match(generatePassword("Andreessen Horowitz Growth"), /^andreessen-horow-\w{4}-\w{4}$/);
  assert.notEqual(generatePassword("yc"), generatePassword("yc"));
  assert.equal(normalizePassword("  YC-Summer-2026 "), "yc-summer-2026");
  for (const bad of ["short", "x".repeat(65), 42, undefined]) assert.equal(normalizePassword(bad), null);
});

test("asks only for the password", () => {
  assert.deepEqual(parseAccess({ password: " YC-k7pd-3mqx " }), { password: "yc-k7pd-3mqx" });
  assert.deepEqual(parseAccess({ password: " " }), { error: "wrong_password" });
  assert.deepEqual(parseAccess(null), { error: "invalid_request" });
});

test("keeps layout HTML and drops anything that runs code", () => {
  assert.equal(
    cleanHtml(
      '<h2 style="color:red">Market</h2><script>alert(1)</script><style>body{}</style>' +
        '<img src="x.png" onerror="alert(1)"><a href="javascript:alert(1)">x</a>' +
        '<a href="https://synoring.ai" target="_blank">ok</a><iframe src="//evil"></iframe><table><tr><td>1</td></tr></table>',
    ),
    '<h2 style="color:red">Market</h2><img src="x.png"><a>x</a><a href="https://synoring.ai" target="_blank">ok</a><table><tr><td>1</td></tr></table>',
  );
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

test("locks numbered copies of Latest that later edits don't change", async () => {
  const plan = store();
  assert.equal(await plan.lock(), null, "nothing to lock yet");
  const latest = await plan.saveLatest("<h1>Plan</h1><script>x</script>", at("09:00"));
  assert.equal(latest.html, "<h1>Plan</h1>");
  assert.equal(latest.updatedAt, "2026-10-06T09:00:00.000Z");

  const v1 = await plan.lock("First round", at("10:00"));
  assert.deepEqual(
    [v1.number, v1.html, v1.note, v1.lockedAt],
    ["1", "<h1>Plan</h1>", "First round", "2026-10-06T10:00:00.000Z"],
  );
  await plan.saveLatest("<h1>Plan, revised</h1>");
  assert.equal((await plan.version(v1.id)).html, "<h1>Plan</h1>");
  assert.equal((await plan.latest()).html, "<h1>Plan, revised</h1>");

  const v2 = await plan.lock("", at("11:00"));
  assert.deepEqual((await plan.versions()).map((version) => version.number), ["2", "1"]);
  assert.equal(await plan.removeVersion(v2.id), true);
  assert.equal(await plan.removeVersion(v2.id), false);
  assert.equal(await plan.nextNumber(), 3);
  assert.equal((await plan.lock()).number, "3", "numbers are never reused");
});

test("keeps a version's PDF until nothing uses it", async () => {
  const upstash = fakeUpstash();
  const plan = store(upstash);
  await plan.putPart("u1", 0, "AAA=");
  assert.equal(await plan.attachPdf({ upload: "u1", name: "plan.pdf", size: 5, parts: 2 }), null);
  await plan.putPart("u1", 1, "BBB=");
  const latest = await plan.attachPdf({ upload: "u1", name: "plan.pdf", size: 5, parts: 2 });
  assert.equal(latest.pdfName, "plan.pdf");

  const v1 = await plan.lock();
  assert.equal(v1.pdfUpload, "u1");
  assert.equal(v1.html, "", "a PDF alone is enough to lock");

  // Replacing Latest's PDF keeps v1's.
  await plan.putPart("u2", 0, "CCC=");
  await plan.attachPdf({ upload: "u2", name: "plan-v2.pdf", size: 2, parts: 1 });
  assert.equal(await plan.readPart("u1", 1), "BBB=");

  // Replacing a PDF no version has drops it.
  await plan.putPart("u3", 0, "DDD=");
  await plan.attachPdf({ upload: "u3", name: "plan-v3.pdf", size: 2, parts: 1 });
  assert.equal(await plan.readPart("u2", 0), null);

  // Copying v1 back to Latest brings its HTML and PDF; Latest's own goes.
  const restored = await plan.restoreLatest(v1.id);
  assert.equal(restored.pdfUpload, "u1");
  assert.equal(await plan.readPart("u3", 0), null);
  assert.equal(await plan.restoreLatest("missing"), null);
  await plan.putPart("u3", 0, "DDD=");
  await plan.attachPdf({ upload: "u3", name: "plan-v3.pdf", size: 2, parts: 1 });
  assert.equal(await plan.readPart("u1", 0), "AAA=", "v1 still has its PDF");

  await plan.detachPdf();
  assert.equal((await plan.latest()).pdfUpload, undefined);
  assert.equal(await plan.readPart("u3", 0), null);

  await plan.removeVersion(v1.id);
  assert.equal(await plan.readPart("u1", 0), null);
  assert.ok(![...upstash.data.keys()].some((key) => key.includes(":file:")));
});

test("keeps images and videos as assets until deleted", async () => {
  const upstash = fakeUpstash();
  const plan = store(upstash);
  const id = "0b6f1c3e-2a54-4f0e-9f55-9d6c1c1e2f70";
  await plan.putPart(id, 0, "AAA=");
  assert.equal(await plan.addAsset({ upload: id, name: "demo.mp4", type: "video/mp4", size: 5, parts: 2 }), null);
  await plan.putPart(id, 1, "BBB=");
  const asset = await plan.addAsset(
    { upload: id, name: "demo.mp4", type: "video/mp4", size: 5, parts: 2 },
    at("10:00"),
  );
  assert.deepEqual(asset, {
    id,
    name: "demo.mp4",
    type: "video/mp4",
    size: "5",
    parts: "2",
    createdAt: "2026-10-06T10:00:00.000Z",
  });
  assert.deepEqual((await plan.assets()).map((item) => item.id), [id]);
  assert.equal(await plan.readPart(id, 1), "BBB=");
  assert.equal(await plan.removeAsset(id), true);
  assert.equal(await plan.removeAsset(id), false);
  assert.deepEqual(await plan.assets(), []);
  assert.ok(![...upstash.data.keys()].some((key) => key.includes(id)));
});

test("shows each recipient live Latest unless pinned to a version", async () => {
  const plan = store();
  const yc = await plan.createRecipient({ label: "YC", password: "yc-k7pd-3mqx" });
  assert.equal(await plan.versionFor(yc), null, "nothing to show yet");
  await plan.saveLatest("<p>One</p>");
  const v1 = await plan.lock();
  const pinned = await plan.createRecipient({ label: "Seed fund", password: "seed-2a2a-3b3b", versionId: v1.id });
  await plan.saveLatest("<p>Two</p>");

  assert.equal((await plan.versionFor(yc)).html, "<p>Two</p>");
  assert.equal((await plan.versionFor(yc)).number, undefined);
  assert.equal((await plan.versionFor(pinned)).html, "<p>One</p>");
  await plan.updateRecipient(yc.id, { versionId: v1.id });
  assert.equal((await plan.versionFor(await plan.recipient(yc.id))).number, "1");
  await plan.removeVersion(v1.id);
  assert.equal((await plan.versionFor(await plan.recipient(yc.id))).html, "<p>Two</p>");
});

test("gives each recipient a unique password that can be turned off", async () => {
  const plan = store();
  const yc = await plan.createRecipient({ label: "YC", password: "yc-k7pd-3mqx" }, at("10:00"));
  assert.equal(yc.versionId, "");
  assert.equal(await plan.createRecipient({ label: "Copy", password: "yc-k7pd-3mqx" }), null);
  assert.equal((await plan.recipientFor("yc-k7pd-3mqx")).id, yc.id);
  assert.equal(await plan.recipientFor("nope-nope"), null);

  assert.equal(await plan.updateRecipient(yc.id, { revoked: true }), true);
  assert.equal(await plan.recipientFor("yc-k7pd-3mqx"), null);
  await plan.updateRecipient(yc.id, { revoked: false });
  assert.equal((await plan.recipientFor("yc-k7pd-3mqx")).id, yc.id);
  assert.equal(await plan.updateRecipient("missing", { revoked: true }), false);
});

test("records each sign-in and which version was opened", async () => {
  const upstash = fakeUpstash();
  const plan = store(upstash);
  await plan.saveLatest("<p>Plan</p>");
  const v1 = await plan.lock();
  const yc = await plan.createRecipient({ label: "YC", password: "yc-k7pd-3mqx" }, at("10:00"));
  const sequoia = await plan.createRecipient({ label: "Sequoia", password: "sequoia-2a2a-3b3b" }, at("11:00"));
  const first = await plan.addViewer(yc.id, { country: "US", ip: "1.2.3.4" }, at("12:00"));
  await plan.addViewer(yc.id, {}, at("13:00"));
  await plan.recordView(first, await plan.latest(), at("12:01"));
  await plan.recordView(first, v1, at("12:05"));

  const recipients = await plan.listRecipients();
  assert.deepEqual(recipients.map((item) => item.label), ["Sequoia", "YC"]);
  const [, listed] = recipients;
  assert.equal(listed.views, "2");
  assert.equal(listed.lastViewedAt, "2026-10-06T12:05:00.000Z");
  assert.equal(listed.viewers.length, 2);
  assert.equal(listed.viewers[1].views, "2");
  assert.equal(listed.viewers[1].lastVersion, "1");
  assert.equal(listed.viewers[1].country, "US");
  assert.equal(listed.viewers[1].openedAt, "2026-10-06T12:00:00.000Z");
  assert.deepEqual(recipients[0].viewers, []);

  const cookie = signSession(await plan.secret(), first.id);
  assert.equal((await plan.session(cookie)).recipient.id, yc.id);
  await plan.updateRecipient(yc.id, { revoked: true });
  assert.equal(await plan.session(cookie), null);
  assert.equal(await plan.session("forged.0.x"), null);

  assert.equal(await plan.removeRecipient(yc.id), true);
  assert.deepEqual((await plan.listRecipients()).map((item) => item.id), [sequoia.id]);
  assert.equal(await plan.viewer(first.id), null);
  assert.notEqual(await plan.createRecipient({ label: "YC again", password: "yc-k7pd-3mqx" }), null);
  assert.ok(![...upstash.data.keys()].some((key) => key.includes(yc.id)));
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
