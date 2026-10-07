import type { NextConfig } from "next";

/* The site's pages live in app/[lang]. English keeps its plain URLs, so
   they are rewritten onto /en; /en itself redirects back to them. Other
   languages use their prefix directly (/zh/store). */
const pages = "store|demo|developers|about";
const images = "opengraph-image|twitter-image";

const nextConfig: NextConfig = {
  experimental: {
    // One 404 page across the two root layouts.
    globalNotFound: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/en" },
        { source: `/:page(${pages})`, destination: "/en/:page" },
        { source: `/:image(${images})`, destination: "/en/:image" },
        {
          source: `/:page(${pages})/:image(${images})`,
          destination: "/en/:page/:image",
        },
      ],
    };
  },
  async redirects() {
    return [
      { source: "/en", destination: "/", permanent: true },
      { source: `/en/:page(${pages})`, destination: "/:page", permanent: true },
    ];
  },
};

export default nextConfig;
