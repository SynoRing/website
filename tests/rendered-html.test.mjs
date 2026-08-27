import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
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
  assert.match(
    html,
    /<title>SynoRing — Gesture Controller for AR &amp; Spatial Computing<\/title>/i,
  );
  assert.match(html, /rel="canonical" href="https:\/\/www\.synoring\.ai"/i);
  assert.match(html, /name="robots" content="index, follow"/i);
  assert.match(html, /name="googlebot"[^>]+max-image-preview:large/i);
  assert.match(html, /type="application\/ld\+json"/i);
  assert.match(html, /"@type":"WebSite"/);
  assert.match(html, /"@type":"Organization"/);
  assert.match(html, /"@type":"Product"/);
  assert.match(html, /Control AR without/);
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
  assert.doesNotMatch(html, /Interaction prototype in development/);
  assert.doesNotMatch(html, /Explore the gestures/);
  assert.doesNotMatch(html, /↗/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
  assert.doesNotMatch(html, /href="#"(?:\s|>)/);
});

test("publishes crawl and discovery metadata", async () => {
  const [robotsResponse, sitemapResponse, manifestResponse] = await Promise.all([
    render("/robots.txt"),
    render("/sitemap.xml"),
    render("/manifest.webmanifest"),
  ]);

  assert.equal(robotsResponse.status, 200);
  assert.match(
    await robotsResponse.text(),
    /Sitemap: https:\/\/www\.synoring\.ai\/sitemap\.xml/,
  );

  assert.equal(sitemapResponse.status, 200);
  assert.match(
    await sitemapResponse.text(),
    /<loc>https:\/\/www\.synoring\.ai\/<\/loc>/,
  );

  assert.equal(manifestResponse.status, 200);
  assert.match(await manifestResponse.text(), /"name"\s*:\s*"SynoRing"/);
});
