import assert from "node:assert/strict";
import test from "node:test";
import {
  confirmationEmail,
  fillVariables,
  htmlToText,
  renderEmail,
  starterDrafts,
  styleBody,
} from "../app/email-template.mjs";
import {
  createMailer,
  mailerFromEnv,
  parseAddress,
  unsubscribeHeaders,
  unsubscribeToken,
  unsubscribeUrl,
  verifyUnsubscribe,
} from "../app/mailer.mjs";

test("styles plain tags and leaves styled ones alone", () => {
  const html = styleBody(
    '<h1>Hi</h1><p>Text</p><a class="button" href="/store">Go</a><a href="/x">x</a><p style="color:red">Own</p><img src="a.jpg" /><hr>',
  );
  assert.match(html, /<h1 style="[^"]*font-size:30px/);
  assert.match(html, /<p style="[^"]*line-height:1\.6/);
  assert.match(html, /<a class="button" href="\/store" style="[^"]*background:#273a2f/);
  assert.match(html, /<a href="\/x" style="color:#4b6a3c;/);
  assert.match(html, /<p style="color:red">Own<\/p>/);
  assert.match(html, /<img src="a\.jpg" style="[^"]*max-width:100%[^"]*" \/>/);
  assert.match(html, /<hr style="[^"]*border-top/);
});

test("fills per-person values, escaped, and keeps unknown names visible", () => {
  assert.equal(
    fillVariables("Hi {{ email }}, {{finish}} {{nope}}", {
      email: "<a@b.io>",
      finish: "Gold",
    }),
    "Hi &lt;a@b.io&gt;, Gold {{nope}}",
  );
});

test("writes a readable plain-text version", () => {
  assert.equal(
    htmlToText(
      '<h1>Title</h1><p>Hello &amp; welcome.<br>Second line</p><ul><li>One</li><li>Two</li></ul><p><a class="button" href="https://www.synoring.ai/store">Pre-order</a></p>',
    ),
    "Title\n\nHello & welcome.\nSecond line\n\n• One\n• Two\n\nPre-order (https://www.synoring.ai/store)",
  );
});

test("renders the layout with preheader, unsubscribe link, and address", () => {
  const { subject, html, text } = renderEmail({
    subject: "News & more for {{email}}",
    preheader: "Short <summary>",
    body: "<p>Hi {{email}}</p>",
    variables: { email: "ada@example.com" },
    footer: {
      unsubscribeUrl: "https://www.synoring.ai/unsubscribe?e=a&t=b",
      postalAddress: "1 Main St, Springfield, IL",
    },
  });
  assert.equal(subject, "News & more for ada@example.com");
  assert.match(html, /<title>News &amp; more for ada@example\.com<\/title>/);
  assert.match(html, /Short &lt;summary&gt;/);
  assert.match(html, /Hi ada@example\.com/);
  assert.match(html, /href="https:\/\/www\.synoring\.ai\/unsubscribe\?e=a&amp;t=b"[^>]*>Unsubscribe/);
  assert.match(html, /SynoRing Labs · 1 Main St, Springfield, IL/);
  assert.match(html, /email\/wordmark\.png/);
  assert.match(text, /^Hi ada@example\.com/);
  assert.match(text, /Unsubscribe: https:\/\/www\.synoring\.ai\/unsubscribe\?e=a&t=b/);
  assert.match(text, /joined the SynoRing waitlist/);
});

test("ships complete starter templates and confirmations", () => {
  for (const draft of starterDrafts) {
    assert.ok(draft.name && draft.subject && draft.preheader && draft.body);
    assert.doesNotMatch(renderEmail(draft).html, /undefined/);
  }
  const preorder = confirmationEmail("preorder", { subtotal: "198" });
  const { html } = renderEmail({
    ...preorder,
    variables: { finish: "Rose Gold", quantity: "2" },
    footer: { reason: preorder.reason },
  });
  assert.match(html, /Rose Gold/);
  assert.match(html, /\$198 USD/);
  assert.match(html, /requested a SynoRing R1 pre-order/);
  assert.match(confirmationEmail("waitlist").subject, /waitlist/);
});

test("signs unsubscribe links per address", () => {
  const token = unsubscribeToken("secret", "ada@example.com");
  assert.equal(token.length, 32);
  assert.ok(verifyUnsubscribe("secret", "ada@example.com", token));
  assert.ok(!verifyUnsubscribe("secret", "eve@example.com", token));
  assert.ok(!verifyUnsubscribe("other", "ada@example.com", token));
  assert.ok(!verifyUnsubscribe("secret", "ada@example.com", "short"));
  assert.ok(!verifyUnsubscribe("secret", "ada@example.com", undefined));
  assert.equal(
    unsubscribeUrl("https://www.synoring.ai", "secret", "a+b@x.io"),
    `https://www.synoring.ai/unsubscribe?e=a%2Bb%40x.io&t=${unsubscribeToken("secret", "a+b@x.io")}`,
  );
  const headers = unsubscribeHeaders("https://www.synoring.ai", "secret", "ada@example.com");
  assert.match(headers["List-Unsubscribe"], /^<https:\/\/www\.synoring\.ai\/api\/unsubscribe\?e=ada%40example\.com&t=[\w-]{32}>$/);
  assert.equal(headers["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click");
});

test("sends through the Cloudflare email API and reports failures", async () => {
  assert.deepEqual(parseAddress("SynoRing <noreply@synoring.ai>"), {
    address: "noreply@synoring.ai",
    name: "SynoRing",
  });
  assert.deepEqual(parseAddress("noreply@synoring.ai"), { address: "noreply@synoring.ai" });

  const calls = [];
  const mailer = createMailer({
    accountId: "acc",
    token: "tok",
    from: "SynoRing <noreply@synoring.ai>",
    replyTo: "contact@synoring.ai",
    fetch: async (url, init) => {
      calls.push({ url, init });
      return Response.json({ success: true, result: { delivered: ["a@x.io"], message_id: "m1" } });
    },
  });
  assert.equal(
    await mailer.send({ to: "a@x.io", subject: "Hi", html: "<p>Hi</p>", text: "Hi", headers: { "X-Test": "1" } }),
    "m1",
  );
  assert.equal(calls[0].url, "https://api.cloudflare.com/client/v4/accounts/acc/email/sending/send");
  assert.equal(calls[0].init.headers.authorization, "Bearer tok");
  assert.deepEqual(JSON.parse(calls[0].init.body), {
    to: ["a@x.io"],
    from: { address: "noreply@synoring.ai", name: "SynoRing" },
    reply_to: "contact@synoring.ai",
    subject: "Hi",
    html: "<p>Hi</p>",
    text: "Hi",
    headers: { "X-Test": "1" },
  });

  const reply = (status, body) =>
    createMailer({ accountId: "a", token: "t", from: "x@y.io", fetch: async () => Response.json(body, { status }) });
  await assert.rejects(
    reply(403, { success: false, errors: [{ code: 10000, message: "Authentication error" }] }).send({ to: "a@x.io", subject: "s", html: "h", text: "t" }),
    /10000 Authentication error/,
  );
  await assert.rejects(
    reply(200, { success: true, result: { permanent_bounces: ["a@x.io"] } }).send({ to: "a@x.io", subject: "s", html: "h", text: "t" }),
    /bounced/,
  );
  await assert.rejects(
    reply(200, { success: true, result: { suppressed_recipients: ["a@x.io"] } }).send({ to: "a@x.io", subject: "s", html: "h", text: "t" }),
    /suppression/,
  );

  assert.equal(mailerFromEnv({}), null);
  const configured = mailerFromEnv({ CLOUDFLARE_ACCOUNT_ID: "a", CLOUDFLARE_EMAIL_TOKEN: "t" });
  assert.equal(configured.from, "SynoRing <noreply@synoring.ai>");
  assert.equal(configured.replyTo, "contact@synoring.ai");
});
