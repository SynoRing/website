import type { Metadata } from "next";

export const site = {
  name: "SynoRing",
  organization: "SynoRing Labs",
  url: "https://www.synoring.ai",
  locale: "en_US",
  language: "en-US",
  title: "SynoRing — Gesture Controller for AR & Spatial Computing",
  description:
    "SynoRing is a wearable gesture controller for AR glasses and spatial computing, designed for private, subtle navigation without voice commands.",
  shortDescription:
    "A wearable gesture controller for AR glasses and spatial computing.",
  email: "hello@synoring.com",
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

export const earlyAccessEmail =
  "mailto:hello@synoring.com?subject=SynoRing%20Early%20Access&body=Hi%20SynoRing%20team%2C%0A%0AI%27d%20like%20to%20follow%20SynoRing%20and%20hear%20about%20early%20access.%0A%0AName%3A%0AHow%20I%27d%20use%20SynoRing%3A%0A";
export const developerEmail =
  "mailto:hello@synoring.com?subject=SynoRing%20Developer%20Pilot&body=Hi%20SynoRing%20team%2C%0A%0AI%27m%20interested%20in%20a%20developer%20pilot.%0A%0AProject%3A%0ATarget%20device%3A%0AInteraction%20use%20case%3A%0A";

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
      title: `${title} | SynoRing`,
      description,
      url: path,
      type: "website",
      images: [
        {
          url: "/og.png",
          width: 1728,
          height: 910,
          alt: "SynoRing gesture controller concept",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | SynoRing`,
      description,
      images: ["/og.png"],
    },
  };
}
