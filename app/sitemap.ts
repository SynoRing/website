import type { MetadataRoute } from "next";
import { site } from "./site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${site.url}/`,
      lastModified: new Date("2026-08-26T00:00:00.000Z"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
