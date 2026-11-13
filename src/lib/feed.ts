/**
 * Locale-neutral feed builder.
 *
 * English posts live in `docs/` and Chinese posts in `docs/zh/`, so each feed
 * filters the one collection by id prefix. Dates resolve the way the page does:
 * authored `date`, then `lastUpdated`, then the file's git history — never the
 * build clock.
 */
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getLastUpdated } from "@cloudflare/nimbus-docs/runtime";
import { config } from "virtual:nimbus/config";

type Locale = "en" | "zh";

const isChineseId = (id: string) => id === "zh" || id.startsWith("zh/");
const isIndexId = (id: string) => id === "index" || id === "zh/index";

export async function buildFeed(locale: Locale, site: URL | undefined) {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, "");
  const href = (path: string) => `${base}${path}`;
  const pathFor = (id: string) =>
    isIndexId(id) ? (isChineseId(id) ? "/zh/" : "/") : `/${id}/`;

  const entries = (await getCollection("docs")).filter(
    (entry) => !entry.data.draft && isChineseId(entry.id) === (locale === "zh"),
  );

  const items = await Promise.all(
    entries.map(async (entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      link: href(pathFor(entry.id)),
      pubDate: entry.data.date ?? entry.data.lastUpdated ?? (await getLastUpdated(entry)),
      categories: entry.data.tags ?? [],
    })),
  );

  items.sort((a, b) => (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0));

  return rss({
    title: config.title,
    description: config.description ?? "",
    site: new URL(href(locale === "zh" ? "/zh/" : "/"), site ?? config.site),
    items,
    customData: `<language>${locale === "zh" ? "zh-CN" : "en"}</language>`,
  });
}
