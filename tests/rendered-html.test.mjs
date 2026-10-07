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
    /<title>SynoRing R1 — Gesture Control Ring for AR &amp; Smart Glasses<\/title>/i,
  );
  assert.match(html, /rel="canonical" href="https:\/\/www\.synoring\.ai"/i);
  assert.match(html, /name="robots" content="index, follow"/i);
  assert.match(html, /name="googlebot"[^>]+max-image-preview:large/i);
  assert.match(html, /type="application\/ld\+json"/i);
  assert.match(html, /"@type":"WebSite"/);
  assert.match(html, /"@type":"Organization"/);
  assert.match(html, /"@type":"Product"/);
  assert.match(html, /"availability":"https:\/\/schema\.org\/PreOrder"/);
  assert.match(html, /"sameAs":\["https:\/\/x\.com\/SynoRing","https:\/\/github\.com\/SynoRing"\]/);
  assert.match(
    html,
    /property="og:image" content="https:\/\/www\.synoring\.ai\/opengraph-image\?[^"]+"/,
  );
  assert.match(
    html,
    /name="twitter:image" content="https:\/\/www\.synoring\.ai\/twitter-image\?[^"]+"/,
  );
  assert.match(html, /name="twitter:site" content="@SynoRing"/);
  assert.match(html, /rel="apple-touch-icon" href="\/apple-icon\.png"/);
  assert.doesNotMatch(html, /og\.png/);
  assert.match(
    html,
    /Control your AR glasses, smart glasses, headset, phone,\s+laptop, PC, or robot without breaking the moment\./,
  );
  assert.match(html, /WACV 2027 SEAI Workshop/);
  assert.match(
    html,
    /class="news-bar"[^>]+href="https:\/\/wacv27seai\.synoring\.ai\/"/,
  );
  assert.match(html, /id="product-notes"/);
  assert.match(html, /href="#product-note-3"/);
  assert.match(html, /Product imagery is a concept rendering/);
  assert.match(html, /Joining the waitlist or sending a pre-order request is free/);
  assert.match(html, /Early means early\./);
  assert.match(html, /Join the waitlist for launch updates/);
  assert.match(html, /<form class="waitlist-form waitlist-inline"/);
  assert.match(
    html,
    /<input(?=[^>]*type="email")(?=[^>]*name="email")(?=[^>]*required)/,
  );
  assert.match(html, />Join the waitlist<\/button>/);
  assert.doesNotMatch(html, /Early%20Access/);
  assert.match(html, /id="gestures"/);
  assert.match(html, /id="progress"/);
  assert.match(html, /id="faq"/);
  assert.match(html, /class="footer-wordmark"/);
  assert.match(html, /class="brand-wordmark"[^>]+src="\/wordmark\.svg"/);
  assert.match(html, /class="footer-wordmark"[\s\S]+src="\/wordmark\.svg"/);
  assert.match(html, /"logo":\{"@type":"ImageObject","url":"https:\/\/www\.synoring\.ai\/logo\.svg"/);
  assert.match(html, /aria-label="SynoRing — back to top"/);
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
  assert.match(robots, /Disallow: \/api\//);
  assert.match(robots, /Disallow: \/bp\n/);

  assert.match(sitemap, /<loc>https:\/\/www\.synoring\.ai\/<\/loc>/);

  assert.match(manifest, /"name"\s*:\s*"SynoRing"/);
  assert.match(manifest, /"src"\s*:\s*"\/favicon\.svg"/);
  assert.match(manifest, /"src"\s*:\s*"\/icon-512\.png"/);
  assert.match(manifest, /"purpose"\s*:\s*"maskable"/);
  assert.match(sitemap, /<image:loc>https:\/\/www\.synoring\.ai\/images\//);
});

test("adapts the favicon for dark browser chrome", async () => {
  const favicon = await readFile(
    new URL("../public/favicon.svg", import.meta.url),
    "utf8",
  );

  assert.match(favicon, /prefers-color-scheme:\s*dark/);
  assert.match(favicon, /filter:\s*invert\(1\)/);
});
