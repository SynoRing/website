import type { Metadata } from "next";
import { alternates, languages, type Lang } from "./i18n";

export const site = {
  name: "SynoRing",
  organization: "SynoRing Labs",
  url: "https://www.synoring.ai",
  title: "SynoRing R1 — Gesture Control Ring for AR & Smart Glasses",
  description:
    "SynoRing R1 is a gesture control ring for AR and smart glasses. Tap, glide, and circle to control what you see. Pre-order for $99, shipping Q1 2027.",
  shortDescription: "A gesture control ring for AR and smart glasses.",
  twitter: "@SynoRing",
  email: "contact@synoring.ai",
  social: [
    { id: "x", name: "X", url: "https://x.com/SynoRing" },
    { id: "github", name: "GitHub", url: "https://github.com/SynoRing" },
  ],
  github: "https://github.com/SynoRing",
} as const;

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
  return {
    title,
    description,
    alternates: links,
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url: links.canonical,
      type: "website",
      siteName: site.name,
      locale: languages[lang].ogLocale,
    },
    twitter: {
      card: "summary_large_image",
      site: site.twitter,
      creator: site.twitter,
      title: `${title} | ${site.name}`,
      description,
    },
  };
}
