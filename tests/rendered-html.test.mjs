import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders the complete SynoRing campaign page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>SynoRing — Gesture becomes intent<\/title>/i);
  assert.match(html, /Control AR without/);
  assert.match(html, /Interaction prototype in development/);
  assert.match(html, /WACV 2027 SEAI Workshop/);
  assert.match(html, /id="product-notes"/);
  assert.match(html, /href="#product-note-1"/);
  assert.match(html, /Product imagery is a concept rendering/);
  assert.match(html, /Joining early access is free/);
  assert.match(html, /Early means early\./);
  assert.match(html, /Request early access/);
  assert.match(html, /id="gestures"/);
  assert.match(html, /id="progress"/);
  assert.match(html, /id="faq"/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
  assert.doesNotMatch(html, /href="#"(?:\s|>)/);
});
