import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { siteCopy } from "../copy/site";
import { fontClasses } from "../fonts";
import { alternates, isLang, languages, locales } from "../i18n";
import { site } from "../site";
import "../globals.css";
import "../pages.css";

// Only the listed languages exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const { title, description } = siteCopy[lang];
  return {
    metadataBase: new URL(site.url),
    title: { default: title, template: `%s | ${site.name}` },
    description,
    applicationName: site.name,
    authors: [{ name: site.organization, url: site.url }],
    creator: site.organization,
    publisher: site.organization,
    category: "technology",
    alternates: alternates(lang, "/"),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      shortcut: "/favicon.svg",
      // Listed explicitly: a configured icons object replaces file-based ones.
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/manifest.webmanifest",
    openGraph: {
      title,
      description,
      type: "website",
      url: alternates(lang, "/").canonical,
      siteName: site.name,
      locale: languages[lang].ogLocale,
      alternateLocale: locales
        .filter((code) => code !== lang)
        .map((code) => languages[code].ogLocale),
    },
    twitter: {
      card: "summary_large_image",
      site: site.twitter,
      creator: site.twitter,
      title,
      description,
    },
  };
}

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#10110f",
};

export default async function RootLayout({
  children,
  params,
}: Props & { children: React.ReactNode }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <html lang={languages[lang].htmlLang} className={fontClasses}>
      <body>{children}</body>
    </html>
  );
}
