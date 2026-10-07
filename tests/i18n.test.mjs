import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const output = new URL("../.next/server/app/", import.meta.url);
const read = (file) => readFile(new URL(file, output), "utf8");
const pages = ["", "/demo", "/developers", "/store", "/about"];
const file = (lang, page) => `${lang}${page}.html`;

test("serves every page in Chinese under /zh with its own links", async () => {
  for (const page of pages) {
    const html = await read(file("zh", page));
    const zhUrl = `https://www.synoring.ai/zh${page}`;
    const enUrl = `https://www.synoring.ai${page}`;
    assert.match(html, /<html lang="zh-CN"/, `${page} is marked Chinese`);
    assert.ok(html.includes(`rel="canonical" href="${zhUrl}"`), `${page} canonical`);
    assert.ok(html.includes(`hrefLang="en-US" href="${enUrl}"`), `${page} links its English`);
    assert.ok(html.includes(`hrefLang="zh-CN" href="${zhUrl}"`), `${page} links itself`);
    assert.ok(html.includes(`hrefLang="x-default" href="${enUrl}"`));
    assert.match(html, /property="og:locale" content="zh_CN"/);
    // Navigation stays in Chinese.
    for (const target of ["/demo", "/developers", "/store", "/about"])
      assert.ok(html.includes(`href="/zh${target}"`), `${page} links to /zh${target}`);
    assert.ok(html.includes(`href="/zh/store#early-access"`));
    assert.match(html, />抢先体验</);
    assert.doesNotMatch(html, />Get early access</);
    // The switch leads back to the same page in English.
    assert.ok(
      html.includes(`class="language-switch" href="${page || "/"}" hrefLang="en-US"`),
      `${page} switches to English`,
    );
    assert.doesNotMatch(html, /href="#"(?:\s|>)/);
  }
});

test("offers Chinese from every English page", async () => {
  for (const page of pages) {
    const html = await read(file("en", page));
    assert.match(html, /<html lang="en-US"/);
    assert.ok(
      html.includes(`class="language-switch" href="/zh${page}" hrefLang="zh-CN" lang="zh-CN"`),
      `${page || "/"} switches to Chinese`,
    );
    assert.ok(html.includes(">中文</a>"));
  }
});

test("translates the page copy, forms, and product data", async () => {
  const [home, store, demo] = await Promise.all([
    read("zh.html"),
    read("zh/store.html"),
    read("zh/demo.html"),
  ]);
  assert.match(home, /你的世界，尽在指尖。/);
  assert.match(home, />加入候补名单<\/button>/);
  assert.match(home, /placeholder="邮箱地址"/);
  assert.match(home, /"inLanguage":"zh-CN"/);
  assert.match(home, /"url":"https:\/\/www\.synoring\.ai\/zh\/store"/);
  assert.match(store, /技术规格。/);
  assert.match(store, /氧化锆陶瓷外壳/);
  assert.match(store, /深空灰/);
  assert.match(store, /class="spec-pending">待公布</);
  assert.match(demo, /智能眼镜交互演示/);
  assert.match(demo, /"name":"演示","item":"https:\/\/www\.synoring\.ai\/zh\/demo"/);
});

test("lists both languages in the sitemap", async () => {
  const sitemap = await read("sitemap.xml.body");
  for (const page of pages) {
    assert.ok(sitemap.includes(`<loc>https://www.synoring.ai/zh${page}</loc>`), `zh${page}`);
    assert.ok(sitemap.includes(`<loc>https://www.synoring.ai${page || "/"}</loc>`), `en${page}`);
  }
  assert.match(
    sitemap,
    /<xhtml:link rel="alternate" hreflang="zh-CN" href="https:\/\/www\.synoring\.ai\/zh\/store"/,
  );
});
