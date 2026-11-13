/**
 * Locale-neutral feed builder.
 *
 * Each locale gets its own RSS feed (`/rss.xml`, `/zh/rss.xml`) so subscribers
 * get posts in one language rather than a mix. Dates resolve the way the page
 * does: authored `date`, then `lastUpdated`, then the file's git history —
 * never the build clock.
 */
import rss from "@astrojs/rss";
import { getLastUpdated } from "@cloudflare/nimbus-docs";
import { config } from "virtual:nimbus/config";
import { locales, localePath, type Locale } from "./i18n";
import { withBase } from "./base";
import { loadEntries } from "./content";

interface FeedItem {
  title: string;
  description: string | undefined;
  link: string;
  pubDate?: Date;
  categories: string[];
}

export async function buildFeed(locale: Locale, site: URL | undefined) {
  const entries = await loadEntries(locale);

  const items: FeedItem[] = await Promise.all(
    entries.map(async (entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      link: localePath(locale, `/${entry.id}/`),
      pubDate: entry.data.date ?? entry.data.lastUpdated ?? (await getLastUpdated(entry)),
      categories: entry.data.tags ?? [],
    })),
  );

  items.sort((a, b) => (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0));

  return rss({
    title: config.title,
    description: config.description ?? "",
    // Resolve item links against the deployment base, not the domain root.
    site: new URL(withBase("/"), site ?? config.site),
    items,
    customData: `<language>${locales[locale].htmlLang}</language>`,
  });
}
