import assert from "node:assert/strict";
import test from "node:test";
import { clickIdFrom } from "../app/x-click-id.mjs";
import {
  createXConversions,
  hashEmail,
  preorderConversion,
  xConversionsFromEnv,
} from "../app/x-conversions.mjs";

test("hashes emails the way X matches them", () => {
  // X's documented example hash, which predates the rename (test@twitter.com).
  const expected = "d360d510a224510f373931ce2d6215a799f5a9c1cef221b0149b6b6b50cced62";
  assert.equal(hashEmail("test@twitter.com"), expected);
  assert.equal(hashEmail("  Test@Twitter.com "), expected);
});

test("reads the stored click ID and ignores anything else", () => {
  assert.equal(clickIdFrom("a=1; twclid=23opevjt88psuo13lu8d020qkn; b=2"), "23opevjt88psuo13lu8d020qkn");
  assert.equal(clickIdFrom("twclid=bad%20value"), "");
  assert.equal(clickIdFrom("other=twclid"), "");
  assert.equal(clickIdFrom(null), "");
});

test("describes a pre-order as an X conversion", () => {
  const now = new Date("2026-10-10T12:00:00Z");
  assert.deepEqual(
    preorderConversion({
      email: "ada@example.com",
      finish: "gold",
      name: "Syno Ring R1 Gold",
      quantity: 2,
      price: 99,
      twclid: "abc123",
      ip: "192.0.2.1",
      userAgent: "Mozilla/5.0",
      sourceUrl: "https://synoring.ai/store",
      now,
    }),
    {
      conversion_timestamp: now.getTime(),
      identifiers: [
        {
          twclid: "abc123",
          hashed_email: hashEmail("ada@example.com"),
          ip_address: "192.0.2.1",
          user_agent: "Mozilla/5.0",
        },
      ],
      event_id: "tw-rgxw1-rgxwh",
      event_source_url: "https://synoring.ai/store",
      value: 198,
      price_currency: "USD",
      contents: [
        { content_id: "gold", content_name: "Syno Ring R1 Gold", content_price: 99, num_items: 2 },
      ],
      number_items: 2,
    },
  );
  const bare = preorderConversion({
    email: "ada@example.com",
    finish: "gold",
    name: "Syno Ring R1 Gold",
    quantity: 1,
    price: 99,
  });
  assert.deepEqual(bare.identifiers, [{ hashed_email: hashEmail("ada@example.com") }]);
  assert.equal("event_source_url" in bare, false);
});

test("posts to the pixel with its access token", async () => {
  const calls = [];
  const conversions = createXConversions({
    token: "pixel-token",
    fetch: async (url, init) => {
      calls.push({ url, init });
      return Response.json({ data: { conversions_processed: 1 } });
    },
  });
  const reply = await conversions.send({ event_id: "tw-rgxw1-rgxwh" });
  assert.equal(reply.data.conversions_processed, 1);
  assert.equal(calls[0].url, "https://ads-api.x.com/12/measurement/conversions/rgxw1");
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.headers["x-pixel-token"], "pixel-token");
  assert.deepEqual(JSON.parse(calls[0].init.body), {
    conversions: [{ event_id: "tw-rgxw1-rgxwh" }],
  });

  const failing = createXConversions({
    token: "bad",
    fetch: async () => new Response("invalid token", { status: 401 }),
  });
  await assert.rejects(failing.send({}), /401 invalid token/);
});

test("reports conversions from production only", () => {
  assert.equal(xConversionsFromEnv({}), null);
  assert.equal(xConversionsFromEnv({ X_PIXEL_TOKEN: "t", VERCEL_ENV: "preview" }), null);
  assert.equal(xConversionsFromEnv({ VERCEL_ENV: "production" }), null);
  assert.ok(xConversionsFromEnv({ X_PIXEL_TOKEN: "t", VERCEL_ENV: "production" }));
});
