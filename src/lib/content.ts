/**
 * Locale-aware content access. One collection per locale, same entry ids, so a
 * post's id doubles as its translation key.
 */
import { getCollection } from "astro:content";
import type { Locale } from "./i18n";

export type LocaleEntries = Awaited<ReturnType<typeof loadEntries>>;

function collectionFor(locale: Locale): "docs" | "zh" {
  return locale === "zh" ? "zh" : "docs";
}

/** Published entries of a locale, newest first is not implied — see sidebar.order. */
export async function loadEntries(locale: Locale) {
  const entries = await getCollection(collectionFor(locale));
  return entries.filter((entry) => !entry.data.draft);
}

/** Top-level section (content folder) an entry id belongs to. */
export function getCategoryFromId(id: string): string {
  return id.split("/")[0] ?? id;
}
