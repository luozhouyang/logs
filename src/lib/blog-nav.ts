/**
 * Navigation data for the blog's locale-specific pages.
 *
 * Nimbus builds its sidebar/prev/breadcrumbs from the primary `docs` collection
 * and only prefixes URLs for docs *versions*, so pages in a second locale
 * (`zh`) derive their navigation here. Shapes match the Nimbus components, so
 * `Sidebar`, `Pagination` and `Breadcrumbs` render them unchanged.
 */
import { getCollection } from "astro:content";
import { categoryLabel, localePath, type Locale, type TranslationLinks } from "./i18n";
import { getCategoryFromId, loadEntries } from "./content";

export interface NavLink {
  type: "link";
  label: string;
  href: string;
  isCurrent: boolean;
  order: number;
}

export interface NavGroup {
  type: "group";
  /** Content folder this group represents (e.g. "kong"). */
  slug: string;
  label: string;
  order: number;
  children: NavLink[];
}

export type NavItem = NavLink | NavGroup;

export interface Crumb {
  label: string;
  href?: string;
}

export interface PrevNextLink {
  label: string;
  href: string;
}

export interface PrevNextLinks {
  prev?: PrevNextLink;
  next?: PrevNextLink;
}

const normalize = (path: string) => path.replace(/\/+$/, "") || "/";

function orderOf(entry: { data: { sidebar?: unknown } }): number {
  const sidebar = entry.data.sidebar;
  return typeof sidebar === "object" && sidebar !== null
    ? ((sidebar as { order?: number }).order ?? 999)
    : 999;
}

/** The top-level section (category) an entry belongs to. */
export function sectionOf(id: string): string {
  return getCategoryFromId(id);
}

/**
 * The sidebar tree for a locale: one group per section, posts ordered by
 * `sidebar.order` then title.
 */
export async function buildNav(locale: Locale, currentPath: string): Promise<NavItem[]> {
  const entries = await loadEntries(locale);
  const sections = new Map<string, NavLink[]>();

  for (const entry of entries) {
    const section = sectionOf(entry.id);
    const href = localePath(locale, `/${entry.id}/`);
    const link: NavLink = {
      type: "link",
      label: entry.data.title,
      href,
      isCurrent: normalize(href) === normalize(currentPath),
      order: orderOf(entry),
    };
    const bucket = sections.get(section);
    if (bucket) bucket.push(link);
    else sections.set(section, [link]);
  }

  const groups: NavGroup[] = [...sections.entries()].map(([slug, links]) => ({
    type: "group",
    slug,
    label: categoryLabel(locale, slug),
    order: 0,
    children: links.sort(
      (a, b) => a.order - b.order || a.label.localeCompare(b.label, locale),
    ),
  }));

  return groups.sort((a, b) => a.label.localeCompare(b.label, locale));
}

/** Flatten a nav tree into the reading order used for prev/next. */
export function flattenNav(items: NavItem[]): NavLink[] {
  return items.flatMap((item) => (item.type === "group" ? item.children : [item]));
}

/** Prev/next for the current page within its locale's nav order. */
export function findPrevNext(items: NavItem[], currentPath: string): PrevNextLinks {
  const links = flattenNav(items);
  const index = links.findIndex((link) => normalize(link.href) === normalize(currentPath));
  if (index === -1) return {};

  const toLink = (link: NavLink | undefined): PrevNextLink | undefined =>
    link ? { label: link.label, href: link.href } : undefined;

  return { prev: toLink(links[index - 1]), next: toLink(links[index + 1]) };
}

/**
 * Top-level sections in the shape the header's tab strip needs — the same
 * `{ label, href, isActive }` shape as Nimbus's `getSidebarSections`, so the
 * stock header markup can render either locale.
 */
export function navSections(items: NavItem[], currentPath: string) {
  const current = normalize(currentPath);
  return items
    .filter((item): item is NavGroup => item.type === "group")
    .map((group) => ({
      label: group.label,
      href: group.children[0]?.href ?? "/",
      isActive: group.children.some((child) => normalize(child.href) === current),
    }));
}

/** Sections plus where they lead, for the landing page's cards. */
export function navCards(items: NavItem[]) {
  return items
    .filter((item): item is NavGroup => item.type === "group")
    .map((group) => ({
      label: group.label,
      href: group.children[0]?.href ?? "/",
      count: group.children.length,
    }));
}

/** Home / section / page trail for a post. */
export function buildBreadcrumbs(
  locale: Locale,
  entry: { id: string; data: { title: string } },
  homeLabel: string,
): Crumb[] {
  const section = sectionOf(entry.id);
  return [
    { label: homeLabel, href: localePath(locale, "/") },
    {
      label: categoryLabel(locale, section),
    },
    { label: entry.data.title },
  ];
}

/**
 * Where this entry exists in other locales, keyed by locale, as site paths.
 * Translations share the entry id across collections (`kong/introduction`).
 */
export async function translationsFor(
  locale: Locale,
  id: string,
): Promise<TranslationLinks> {
  const others: Locale[] = locale === "en" ? ["zh"] : ["en"];
  const links: TranslationLinks = {};

  for (const other of others) {
    const collection = other === "zh" ? "zh" : "docs";
    const entries = await getCollection(collection);
    const match = entries.find((entry) => entry.id === id && !entry.data.draft);
    if (match) links[other] = localePath(other, `/${id}/`);
  }

  return links;
}
