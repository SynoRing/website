import { Geist, Geist_Mono } from "next/font/google";

/* Shared by the site's root layouts. Chinese text falls back to the
   system's CJK fonts (see globals.css). */

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

export const fontClasses = `${geist.variable} ${geistMono.variable}`;
