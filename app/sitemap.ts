import type { MetadataRoute } from "next";
import { site, navigation } from "./site";
import { ringFrontView, ringRenders } from "./product-visual";

const updated = new Date("2026-10-05T00:00:00.000Z");
const absolute = (path: string) => `${site.url}${path}`;
const renders = Object.values(ringRenders).map((render) =>
  absolute(render.src),
);

/* Image entries help product renders surface in image search. */
const images: Record<string, string[]> = {
  "/": [absolute(ringFrontView.src), ...renders],
  "/store": renders,
};

export default function sitemap(): MetadataRoute.Sitemap {
  return navigation.map(([path]) => ({
    url: absolute(path === "/" ? "/" : path),
    lastModified: updated,
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : path === "/store" ? 0.9 : 0.8,
    images: images[path],
  }));
}
