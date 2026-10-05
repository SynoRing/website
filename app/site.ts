import type { Metadata } from "next";

export const site = {
  name: "SynoRing",
  organization: "SynoRing Labs",
  url: "https://www.synoring.ai",
  locale: "en_US",
  language: "en-US",
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

export const navigation = [
  ["/", "The ring"],
  ["/demo", "Demo"],
  ["/developers", "Developers"],
  ["/store", "Store"],
  ["/about", "About"],
] as const;

export const developerEmail =
  "mailto:contact@synoring.ai?subject=SynoRing%20Developer%20Pilot&body=Hi%20SynoRing%20team%2C%0A%0AI%27m%20interested%20in%20a%20developer%20pilot.%0A%0AProject%3A%0ATarget%20device%3A%0AInteraction%20use%20case%3A%0A";

/** Page metadata. Open Graph images come from each route's
    opengraph-image.tsx, so they are not listed here. */
export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url: path,
      type: "website",
      siteName: site.name,
      locale: site.locale,
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
