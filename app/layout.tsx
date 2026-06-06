import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SynoRing — The silent command, cast in titanium.",
  description:
    "A new instrument of input for AR glasses. SynoRing turns the most natural human gesture into the next universal interface.",
  openGraph: {
    title: "SynoRing — A New Instrument of Input",
    description:
      "The most natural human gesture becomes the next universal interface.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} antialiased`}
    >
      <body className="min-h-screen bg-noir text-ivory font-sans">
        {children}
      </body>
    </html>
  );
}
