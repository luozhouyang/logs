import { getCollection } from "astro:content";
import { categoryLabel, localePath, ui, type Locale } from "./i18n";

export interface TaxonomyItem {
  slug: string;
  label: string;
  count: number;
}

export interface PostSummary {
  slug: string;
  title: string;
  description: string | undefined;
  tags: string[];
  category: string;
  order: number;
}

export type LocaleEntries = Awaited<ReturnType<typeof loadEntries>>;

/** Collection name for a locale. */
function collectionFor(locale: Locale): "docs" | "zh" {
  return locale === "zh" ? "zh" : "docs";
}

export async function loadEntries(locale: Locale) {
  const entries = await getCollection(collectionFor(locale));
  return entries.filter((entry) => !entry.data.draft);
}

export function getCategoryFromId(id: string): string {
  return id.split("/")[0] ?? id;
}

function sidebarOrder(entry: { data: { sidebar?: unknown } }): number {
  const sidebar = entry.data.sidebar;
  return typeof sidebar === "object" && sidebar !== null
    ? ((sidebar as { order?: number }).order ?? 999)
    : 999;
}

function toPostSummary(locale: Locale, entry: LocaleEntries[number]): PostSummary {
  return {
    slug: localePath(locale, `/${entry.id}/`),
    title: entry.data.title,
    description: entry.data.description,
    tags: entry.data.tags ?? [],
    category: getCategoryFromId(entry.id),
    order: sidebarOrder(entry),
  };
}

export async function getCategories(locale: Locale = "en"): Promise<TaxonomyItem[]> {
  const entries = await loadEntries(locale);
  const map = new Map<string, number>();
  for (const entry of entries) {
    const category = getCategoryFromId(entry.id);
    map.set(category, (map.get(category) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([slug, count]) => ({ slug, label: categoryLabel(locale, slug), count }))
    .sort((a, b) => a.label.localeCompare(b.label, locale));
}

export async function getTags(locale: Locale = "en"): Promise<TaxonomyItem[]> {
  const entries = await loadEntries(locale);
  const map = new Map<string, number>();
  for (const entry of entries) {
    for (const tag of entry.data.tags ?? []) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([slug, count]) => ({ slug, label: categoryLabel(locale, slug), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, locale));
}

export async function getPostsByCategory(
  category: string,
  locale: Locale = "en",
): Promise<PostSummary[]> {
  const entries = await loadEntries(locale);
  return entries
    .filter((entry) => getCategoryFromId(entry.id) === category)
    .map((entry) => toPostSummary(locale, entry))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, locale));
}

export async function getPostsByTag(tag: string, locale: Locale = "en"): Promise<PostSummary[]> {
  const entries = await loadEntries(locale);
  return entries
    .filter((entry) => (entry.data.tags ?? []).includes(tag))
    .map((entry) => toPostSummary(locale, entry))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, locale));
}

/** Count of posts in a category, for `postCount` strings. */
export function postsLabel(locale: Locale, count: number): string {
  return ui[locale].postCount(count);
}
