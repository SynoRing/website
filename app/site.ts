import type { Metadata } from "next";
import { alternates, languages, type Lang } from "./i18n";

export const site = {
  name: "Syno",
  productName: "Syno Ring R1",
  organization: "Syno Labs LLC",
  url: "https://www.synoring.ai",
  title: "Syno Ring",
  description:
    "Syno Ring R1 is a gesture control ring for AR and smart glasses. Tap, glide, and circle to control what you see. Pre-order for $99, shipping Q1 2027.",
  shortDescription: "A gesture control ring for AR and smart glasses.",
  twitter: "@SynoRing",
  email: "contact@synolabs.org",
  social: [
    { id: "x", name: "X", url: "https://x.com/SynoRing" },
    { id: "github", name: "GitHub", url: "https://github.com/SynoRing" },
  ],
  github: "https://github.com/SynoRing",
} as const;

export function companyUrl(lang: Lang) {
  const origin = process.env.NEXT_PUBLIC_COMPANY_URL ||
    (process.env.NODE_ENV === "development" ? "http://127.0.0.1:4173" : "https://synolabs.org");
  return new URL(lang === "zh" ? "/zh/" : "/", origin).href;
}

/** The main navigation, in order. Labels live in copy/site.ts. */
export const navigation = ["/", "/demo", "/developers", "/store", "/about"] as const;
export type NavigationPath = (typeof navigation)[number];

/** Page metadata in a language. Open Graph images come from each route's
    opengraph-image.tsx, so they are not listed here. */
export function pageMetadata(
  lang: Lang,
  title: string,
  description: string,
  path: string,
): Metadata {
  const links = alternates(lang, path);
  const shareTitle = `${title} | ${site.title}`;
  return {
    title,
    description,
    alternates: links,
    openGraph: {
      title: shareTitle,
      description,
      url: links.canonical,
      type: "website",
      siteName: site.title,
      locale: languages[lang].ogLocale,
    },
    twitter: {
      card: "summary_large_image",
      site: site.twitter,
      creator: site.twitter,
      title: shareTitle,
      description,
    },
  };
}
