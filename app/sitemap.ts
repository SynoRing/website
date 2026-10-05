import type { MetadataRoute } from "next";
import { site, navigation } from "./site";

export default function sitemap(): MetadataRoute.Sitemap {
  return navigation.map(([path]) => ({
    url: `${site.url}${path}`,
    lastModified: new Date("2026-10-05T00:00:00.000Z"),
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.8,
  }));
}
