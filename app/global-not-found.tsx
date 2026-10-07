import type { Metadata } from "next";
import { fontClasses } from "./fonts";
import "./globals.css";
import "./pages.css";

export const metadata: Metadata = {
  title: "Page not found | SynoRing",
  robots: { index: false, follow: false },
};

/* The 404 page for any URL that matches no page, in both languages. */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontClasses}>
      <body>
        <main className="unsubscribe-page">
          <a href="/" aria-label="SynoRing home">
            <img src="/wordmark.svg" width="132" height="44" alt="SynoRing" />
          </a>
          <div className="unsubscribe-card">
            <h1>This page doesn’t exist.</h1>
            <p lang="zh-CN">页面不存在。</p>
            <p>
              <a className="button button-dark" href="/">
                SynoRing home
              </a>{" "}
              <a className="button" href="/zh" lang="zh-CN">
                中文首页
              </a>
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
