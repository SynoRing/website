import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.synoring.ai"),
  title: "SynoRing — Gesture becomes intent",
  description:
    "A quiet, wearable controller for spatial computing. Join SynoRing early access and help shape the interaction.",
  openGraph: {
    title: "SynoRing — Gesture becomes intent",
    description:
      "A quiet, wearable controller for spatial computing. Early-stage hardware, built in the open.",
    type: "website",
    url: "/",
    siteName: "SynoRing",
    images: [
      {
        url: "/og.png",
        width: 1728,
        height: 910,
        alt: "SynoRing titanium gesture controller concept",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SynoRing — Gesture becomes intent",
    description: "A quiet, wearable controller for spatial computing.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
