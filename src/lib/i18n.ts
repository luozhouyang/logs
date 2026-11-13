/**
 * Site locales.
 *
 * English is the default locale and is served at the site root; every other
 * locale is mounted under its own prefix (`/zh/...`). Content lives in a
 * collection per locale (`docs` for English, `zh` for Chinese) with identical
 * entry ids, so `/kong/introduction/` and `/zh/kong/introduction/` are the
 * same post in two languages.
 */

export const locales = {
  en: { base: "", htmlLang: "en", label: "English", short: "EN" },
  zh: { base: "/zh", htmlLang: "zh-CN", label: "中文", short: "中" },
} as const;

export type Locale = keyof typeof locales;

export const defaultLocale: Locale = "en";
export const allLocales = Object.keys(locales) as Locale[];

/** Astro content collection that holds each locale's posts. */
export const collections = {
  en: "docs",
  zh: "zh",
} as const;

export type LocaleCollection = (typeof collections)[Locale];

/** The locale a pathname belongs to, based on its prefix. */
export function parseLocale(pathname: string): Locale {
  const [, first] = pathname.split("/");
  return first === "zh" ? "zh" : defaultLocale;
}

/** Prefix an in-site path (`/kong/x/`) for a locale (`/zh/kong/x/`). */
export function localePath(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const base = locales[locale].base;
  if (!base) return clean;
  return clean === "/" ? `${base}/` : `${base}${clean}`;
}

/** Strip a locale prefix from a pathname, yielding the default-locale path. */
export function stripLocale(locale: Locale, pathname: string): string {
  const base = locales[locale].base;
  if (!base) return pathname;
  const stripped = pathname.slice(base.length) || "/";
  return stripped.startsWith("/") ? stripped : `/${stripped}`;
}

export function otherLocale(locale: Locale): Locale {
  return locale === "en" ? "zh" : "en";
}

/** The other locale's home, used when a page has no translation. */
export function localeHome(locale: Locale): string {
  return localePath(locale, "/");
}

/**
 * Per-page targets for the language switcher, keyed by locale. A locale is
 * absent when that language has no equivalent page.
 */
export type TranslationLinks = Partial<Record<Locale, string>>;

/** UI strings for the chrome this site owns (Nimbus's own labels stay English). */
export const ui = {
  en: {
    home: "Home",
    categories: "Categories",
    tags: "Tags",
    allCategories: "All categories",
    allTags: "All tags",
    browseByCategory: "Browse posts by category.",
    browseByTag: "Browse posts by tag.",
    categoriesTitle: "Categories",
    tagsTitle: "Tags",
    postCount: (n: number) => `${n} post${n === 1 ? "" : "s"}`,
    menu: "Menu",
    skipToContent: "Skip to content",
    language: "Language",
    switchTo: "中文",
    switchToLabel: "Read in Chinese",
  },
  zh: {
    home: "首页",
    categories: "分类",
    tags: "标签",
    allCategories: "全部分类",
    allTags: "全部标签",
    browseByCategory: "按分类浏览文章。",
    browseByTag: "按标签浏览文章。",
    categoriesTitle: "分类",
    tagsTitle: "标签",
    postCount: (n: number) => `${n} 篇文章`,
    menu: "菜单",
    skipToContent: "跳到正文",
    language: "语言",
    switchTo: "EN",
    switchToLabel: "Read in English",
  },
} as const;

export type UiStrings = (typeof ui)[Locale];

/** Display names for top-level sections (content folders), per locale. */
const categoryNames: Record<Locale, Record<string, string>> = {
  en: {},
  zh: {
    "e-commerce": "电子商务",
    cloudflare: "Cloudflare",
    kong: "Kong",
  },
};

/** "e-commerce" → "E Commerce", or the locale's own name for the section. */
export function categoryLabel(locale: Locale, slug: string): string {
  const override = categoryNames[locale][slug];
  if (override) return override;
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
