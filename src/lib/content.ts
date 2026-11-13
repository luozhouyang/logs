/**
 * Locale-aware content access over the single `docs` collection.
 *
 * The terminal homepage only needs the published entries for one locale and
 * the section (top-level folder) each entry belongs to.
 */
import { getCollection } from "astro:content";
import { isChineseId, type Locale } from "./i18n";

/** Published entries of a locale. */
export async function loadEntries(locale: Locale) {
  const entries = await getCollection("docs");
  return entries.filter(
    (entry) => !entry.data.draft && isChineseId(entry.id) === (locale === "zh"),
  );
}

/** Top-level section (content folder) an entry id belongs to. */
export function getCategoryFromId(id: string): string {
  const local = isChineseId(id) ? id.slice(3) : id;
  return local.split("/")[0] ?? local;
}
