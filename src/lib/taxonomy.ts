import { getCollection, type CollectionEntry } from "astro:content";

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

type DocEntry = CollectionEntry<"docs">;

export function getCategoryFromId(id: string): string {
  return id.split("/")[0] ?? id;
}

function toLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function toPostSummary(entry: DocEntry): PostSummary {
  const sidebar = entry.data.sidebar;
  const order = typeof sidebar === "object" && sidebar !== null ? (sidebar.order ?? 999) : 999;
  return {
    slug: `/${entry.id}`,
    title: entry.data.title,
    description: entry.data.description,
    tags: entry.data.tags ?? [],
    category: getCategoryFromId(entry.id),
    order,
  };
}

function isPublished(entry: DocEntry): boolean {
  return !entry.data.draft;
}

async function getPublishedEntries(): Promise<DocEntry[]> {
  const all = await getCollection("docs");
  return all.filter(isPublished);
}

export async function getCategories(): Promise<TaxonomyItem[]> {
  const entries = await getPublishedEntries();
  const map = new Map<string, number>();
  for (const entry of entries) {
    const cat = getCategoryFromId(entry.id);
    map.set(cat, (map.get(cat) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([slug, count]) => ({ slug, label: toLabel(slug), count }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export async function getTags(): Promise<TaxonomyItem[]> {
  const entries = await getPublishedEntries();
  const map = new Map<string, number>();
  for (const entry of entries) {
    for (const tag of entry.data.tags ?? []) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([slug, count]) => ({ slug, label: toLabel(slug), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export async function getPostsByCategory(category: string): Promise<PostSummary[]> {
  const entries = await getPublishedEntries();
  return entries
    .filter((e) => getCategoryFromId(e.id) === category)
    .map(toPostSummary)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export async function getPostsByTag(tag: string): Promise<PostSummary[]> {
  const entries = await getPublishedEntries();
  return entries
    .filter((e) => (e.data.tags ?? []).includes(tag))
    .map(toPostSummary)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}
