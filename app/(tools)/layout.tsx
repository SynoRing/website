import type { Metadata, Viewport } from "next";
import { fontClasses } from "../fonts";
import { site } from "../site";
import "../globals.css";
import "../pages.css";

/* The root layout for pages outside the localized site: the marketing
   dashboard, the business plan, and unsubscribing. They stay in English
   and out of search. */

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  robots: { index: false, follow: false },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#10110f",
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontClasses}>
      <body>{children}</body>
    </html>
  );
}
