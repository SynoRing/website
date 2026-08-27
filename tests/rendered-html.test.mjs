import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const outputPath = new URL("../.next/server/app/", import.meta.url);

async function render(artifact = "index.html") {
  return readFile(new URL(artifact, outputPath), "utf8");
}

test("renders the complete SynoRing campaign page", async () => {
  const html = await render();
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
  const [robots, sitemap, manifest] = await Promise.all([
    render("robots.txt.body"),
    render("sitemap.xml.body"),
    render("manifest.webmanifest.body"),
  ]);

  assert.match(
    robots,
    /Sitemap: https:\/\/www\.synoring\.ai\/sitemap\.xml/,
  );

  assert.match(sitemap, /<loc>https:\/\/www\.synoring\.ai\/<\/loc>/);

  assert.match(manifest, /"name"\s*:\s*"SynoRing"/);
});
