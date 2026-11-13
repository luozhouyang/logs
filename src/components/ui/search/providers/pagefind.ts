import type { SearchProvider, SearchResult } from "@cloudflare/nimbus-docs/types";
import { config } from "virtual:nimbus/config";

interface PagefindSubResult {
  title?: string;
  url?: string;
}

interface PagefindResultData {
  url: string;
  excerpt?: string;
  meta?: { title?: string };
  sub_results?: PagefindSubResult[];
}

interface PagefindSearchResponse {
  results: Array<{ data(): Promise<PagefindResultData> }>;
}

interface PagefindFilters {
  [key: string]: string | string[] | { none?: string | string[]; any?: string | string[] };
}

interface PagefindApi {
  init(): Promise<void>;
  search(query: string, options?: { filters?: PagefindFilters }): Promise<PagefindSearchResponse>;
}

let pagefind: PagefindApi | undefined;

/**
 * Development fallback.
 *
 * Pagefind indexes the built site, so `astro dev` has no index and the dialog
 * used to answer every query with "available after a production build". The
 * build-time `/search-index.json` (all posts, both locales) fills that gap with
 * a plain substring search; production keeps using Pagefind.
 */
interface FallbackItem {
  title: string;
  description: string;
  tags: string[];
  lang: string;
  url: string;
}

let fallbackIndex: FallbackItem[] | undefined;

function siteBase(): URL {
  return new URL(import.meta.env.BASE_URL ?? "/", window.location.origin);
}

async function loadPagefind(): Promise<PagefindApi | undefined> {
  try {
    const pagefindUrl = new URL("pagefind/pagefind.js", siteBase());
    const api = (await import(/* @vite-ignore */ pagefindUrl.href)) as PagefindApi;
    await api.init();
    return api;
  } catch {
    return undefined;
  }
}

async function loadFallbackIndex(): Promise<FallbackItem[]> {
  try {
    const response = await fetch(new URL("search-index.json", siteBase()).href);
    if (!response.ok) return [];
    return (await response.json()) as FallbackItem[];
  } catch {
    return [];
  }
}

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function snippetFor(item: FallbackItem, needle: string): string {
  const text = item.description || item.title;
  const index = text.toLowerCase().indexOf(needle);
  if (index === -1) return escapeHtml(text.slice(0, 140));

  const start = Math.max(0, index - 40);
  const end = Math.min(text.length, index + needle.length + 80);
  const before = (start > 0 ? "…" : "") + escapeHtml(text.slice(start, index));
  const hit = `<mark>${escapeHtml(text.slice(index, index + needle.length))}</mark>`;
  const after = escapeHtml(text.slice(index + needle.length, end)) + (end < text.length ? "…" : "");
  return before + hit + after;
}

function searchFallback(index: FallbackItem[], query: string): SearchResult[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  return index
    .map((item) => {
      const title = item.title.toLowerCase();
      const description = item.description.toLowerCase();
      const tags = item.tags.join(" ").toLowerCase();

      const score =
        (title.includes(needle) ? 4 : 0) +
        (tags.includes(needle) ? 2 : 0) +
        (description.includes(needle) ? 1 : 0);

      return { item, score };
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ item }) => ({
      title: item.title,
      url: item.url,
      snippet: snippetFor(item, needle),
    }));
}

/**
 * Default Pagefind filters applied to every search.
 *
 * Versioning: when the site has a `versions.deprecated` list, the
 * layout emits `data-pagefind-filter="status:deprecated"` on every
 * deprecated-version page. Search defaults to excluding those results
 * (readers searching for "auth" want the current version's auth page,
 * not the deprecated one). Future UI work can expose a "include
 * deprecated" toggle; for now the default is current + non-deprecated.
 *
 * Versions are still searchable individually — readers on a v0 page
 * who explicitly search from there can opt the UI into a version-scoped
 * filter. The default exclusion is just for the top-level search.
 *
 * Computed at module-import time so we don't pay the config lookup on
 * every keystroke.
 */
const defaultFilters: PagefindFilters | undefined =
  config.versions && config.versions.deprecated && config.versions.deprecated.length > 0
    ? { status: { none: "deprecated" } }
    : undefined;

export const provider: SearchProvider = {
  async init() {
    if (pagefind || fallbackIndex) return;
    pagefind = await loadPagefind();
    if (!pagefind) fallbackIndex = await loadFallbackIndex();
  },

  async search(query) {
    if (!pagefind && !fallbackIndex) await this.init?.();
    // Production (and any build with an index) uses Pagefind…
    if (!pagefind) {
      // …dev falls back to the JSON index so search still works.
      return fallbackIndex ? searchFallback(fallbackIndex, query) : [];
    }

    const search = await pagefind.search(
      query,
      defaultFilters ? { filters: defaultFilters } : undefined,
    );
    const results = await Promise.all(search.results.slice(0, 10).map((result) => result.data()));
    // Pagefind indexes paths relative to the site root; GH Pages serves the
    // site under a base path, so every result needs the prefix.
    const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
    const withBase = (url: string) =>
      base && url.startsWith("/") && !url.startsWith(`${base}/`) ? `${base}${url}` : url;

    return results.map((result): SearchResult => ({
      title: result.meta?.title ?? "Untitled",
      url: withBase(result.url),
      snippet: result.excerpt,
      subResults: result.sub_results
        ?.filter((sub): sub is Required<PagefindSubResult> => Boolean(sub.title && sub.url))
        .map((sub) => ({ title: sub.title, url: withBase(sub.url) })),
    }));
  },
};
