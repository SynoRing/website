import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pages = ["demo", "developers", "store", "about"];
const output = new URL("../.next/server/app/", import.meta.url);

test("every public page has unique discovery metadata and complete navigation", async () => {
  const sitemap = await readFile(new URL("sitemap.xml.body", output), "utf8");
  for (const page of pages) {
    const html = await readFile(new URL(`${page}.html`, output), "utf8");
    assert.match(
      html,
      new RegExp(`rel="canonical" href="https://www\\.synoring\\.ai/${page}"`),
    );
    assert.match(
      html,
      new RegExp(
        `property="og:url" content="https://www\\.synoring\\.ai/${page}"`,
      ),
    );
    assert.equal(
      (html.match(/<h1(?:\s|>)/g) || []).length,
      1,
      `${page} has one primary heading`,
    );
    for (const target of pages)
      assert.ok(
        html.includes(`href="/${target}"`),
        `${page} links to ${target}`,
      );
    assert.ok(html.includes(`href="/${page}" aria-current="page"`));
    assert.match(
      html,
      new RegExp(
        `property="og:image" content="https://www\\.synoring\\.ai/${page}/opengraph-image\\?`,
      ),
      `${page} has its own Open Graph image`,
    );
    assert.match(html, /property="og:image:width" content="1200"/);
    assert.match(html, /name="twitter:card" content="summary_large_image"/);
    assert.match(html, /property="og:site_name" content="SynoRing"/);
    assert.match(html, /"@type":"BreadcrumbList"/);
    const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1] ?? "";
    assert.ok(
      description.length >= 70 && description.length <= 160,
      `${page} description is 70–160 characters (${description.length})`,
    );
    assert.ok(sitemap.includes(`<loc>https://www.synoring.ai/${page}</loc>`));
    assert.doesNotMatch(html, /href="#"(?:\s|>)/);
  }
});

test("pre-order route publishes confirmed pricing and keeps enquiry status clear", async () => {
  const store = await readFile(new URL("store.html", output), "utf8");
  const developers = await readFile(new URL("developers.html", output), "utf8");
  const demo = await readFile(new URL("demo.html", output), "utf8");
  assert.match(store, /Pre-order/);
  assert.match(store, /\$99/);
  assert.match(store, /<del>[\s\S]*?\$129<\/del>/);
  for (const finish of ["Space Gray", "Platinum", "Rose Gold", "Gold"])
    assert.ok(store.includes(finish));
  assert.match(store, /Technical specifications/);
  assert.match(store, /Zirconia ceramic outer shell/);
  assert.match(store, /"material":"Zirconia ceramic, stainless steel"/);
  assert.match(store, /this website does not collect payment/);
  assert.doesNotMatch(
    store,
    /Orders are not open|Price<\/dt><dd>To be announced/,
  );
  assert.match(developers, /Public SDK not yet available/);
  assert.match(
    developers,
    /mailto:contact@synoring.ai\?subject=SynoRing%20Developer%20Pilot/,
  );
  assert.match(demo, /Try it/);
  assert.match(demo, /Music is silent/);
});
