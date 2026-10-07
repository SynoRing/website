import { notFound } from "next/navigation";

/* The site's languages. English is the default and keeps unprefixed URLs
   (/store); every other language lives under its own prefix (/zh/store).
   next.config.ts rewrites the English URLs onto app/[lang]. */

export const locales = ["en", "zh"] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = "en";

export const languages: Record<
  Lang,
  { htmlLang: string; ogLocale: string; name: string; short: string }
> = {
  en: { htmlLang: "en-US", ogLocale: "en_US", name: "English", short: "EN" },
  zh: { htmlLang: "zh-CN", ogLocale: "zh_CN", name: "简体中文", short: "中文" },
};

export type LanguageOption = {
  label: string;
  name: string;
  href: string;
  htmlLang: string;
  current: boolean;
};

/** The language switch's choices for a page, "中文 / EN": each links to the
    same page in that language; the page's own language is marked current. */
export function languageOptions(lang: Lang, path: string): LanguageOption[] {
  return (["zh", "en"] as const).map((code) => ({
    label: languages[code].short,
    name: languages[code].name,
    href: localePath(code, path),
    htmlLang: languages[code].htmlLang,
    current: code === lang,
  }));
}

export const isLang = (value: string): value is Lang =>
  (locales as readonly string[]).includes(value);

/** A site path in a language: "/store" → "/zh/store", "/#faq" → "/zh#faq". */
export function localePath(lang: Lang, path: string) {
  if (lang === defaultLang) return path;
  return path === "/" || path.startsWith("/#")
    ? `/${lang}${path.slice(1)}`
    : `/${lang}${path}`;
}

/** Canonical and hreflang links for a page in every language. */
export function alternates(lang: Lang, path: string) {
  return {
    canonical: localePath(lang, path),
    languages: {
      ...Object.fromEntries(
        locales.map((code) => [languages[code].htmlLang, localePath(code, path)]),
      ),
      "x-default": localePath(defaultLang, path),
    },
  };
}

/** The language of a page under app/[lang]. The layout only builds the
    listed languages, so anything else is a 404. */
export async function pageLang(params: Promise<{ lang: string }>): Promise<Lang> {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return lang;
}

export type PageProps = { params: Promise<{ lang: string }> };
