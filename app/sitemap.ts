import type { MetadataRoute } from "next";
import { languages, localePath, locales } from "./i18n";
import { ringFrontView, ringRenders } from "./product-visual";
import { navigation, site } from "./site";

const updated = new Date("2026-10-07T00:00:00.000Z");
const absolute = (path: string) => `${site.url}${path}`;
const renders = Object.values(ringRenders).map((render) =>
  absolute(render.src),
);

/* Image entries help product renders surface in image search. */
const images: Record<string, string[]> = {
  "/": [absolute(ringFrontView.src), ...renders],
  "/store": renders,
};

/* Every page in every language, each listing its translations. */
export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((lang) =>
    navigation.map((path) => ({
      url: absolute(localePath(lang, path)),
      lastModified: updated,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : path === "/store" ? 0.9 : 0.8,
      images: images[path],
      alternates: {
        languages: Object.fromEntries(
          locales.map((code) => [
            languages[code].htmlLang,
            absolute(localePath(code, path)),
          ]),
        ),
      },
    })),
  );
}
