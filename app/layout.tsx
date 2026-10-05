import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./pages.css";
import { site } from "./site";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.organization, url: site.url }],
  creator: site.organization,
  publisher: site.organization,
  category: "technology",
  alternates: {
    canonical: "/",
  },
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
    apple: "/logo.svg",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: site.title,
    description: site.description,
    type: "website",
    url: "/",
    siteName: site.name,
    locale: site.locale,
    images: [
      {
        url: "/og.png",
        width: 1728,
        height: 910,
        type: "image/png",
        alt: "SynoRing titanium gesture controller concept",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#10110f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={site.language}
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
