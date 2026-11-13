/**
 * Locale helpers for the terminal homepage and its navigation.
 *
 * Both locales live in the one `docs` collection: English posts at the root
 * and Chinese posts under `docs/zh/`. These helpers bridge the collection ids
 * to the public `/` and `/zh/` URLs.
 */

export const locales = {
  en: { base: "", htmlLang: "en" },
  zh: { base: "/zh", htmlLang: "zh-CN" },
} as const;

export type Locale = keyof typeof locales;

/** True for an entry id that belongs to the Chinese tree. */
export function isChineseId(id: string): boolean {
  return id === "zh" || id.startsWith("zh/");
}

/** `zh/kong/introduction` → `kong/introduction`; other ids pass through. */
export function localEntryId(id: string): string {
  return isChineseId(id) ? id.slice(3) : id;
}

/** Prefix an in-site path for a locale and the deployment base. */
export function localePath(locale: Locale, path: string): string {
  const siteBase = import.meta.env.BASE_URL.replace(/\/+$/, "");
  const prefix = locales[locale].base;
  const clean = path.startsWith("/") ? path : `/${path}`;
  const localized = prefix ? (clean === "/" ? `${prefix}/` : `${prefix}${clean}`) : clean;
  if (!siteBase) return localized;
  return localized === "/" ? `${siteBase}/` : `${siteBase}${localized}`;
}

/** The public URL for a post id in a locale (`/` and `/zh/` for index). */
export function entryPath(locale: Locale, id: string): string {
  const local = localEntryId(id);
  return localePath(locale, local === "index" ? "/" : `/${local}/`);
}
