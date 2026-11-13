// /rss.xml — the site feed. The pre-Nimbus blog shipped one at the same URL,
// so the refactor keeps subscribers working: same path, same posts.
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getLastUpdated } from "@cloudflare/nimbus-docs";
import { config } from "virtual:nimbus/config";

export const prerender = true;

type Item = {
  title: string;
  description: string | undefined;
  link: string;
  pubDate?: Date;
  categories: string[];
};

export async function GET(context: { site: URL | undefined }) {
  const entries = (await getCollection("docs")).filter((entry) => !entry.data.draft);

  // Dates resolve the way the page does: authored `date` first, then
  // `lastUpdated`, then the file's git history. Never the build clock — an
  // undated post must not look freshly published on every deploy.
  const items: Item[] = await Promise.all(
    entries.map(async (entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      link: `/${entry.id}/`,
      pubDate: entry.data.date ?? entry.data.lastUpdated ?? (await getLastUpdated(entry)),
      categories: entry.data.tags ?? [],
    })),
  );

  items.sort((a, b) => (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0));

  return rss({
    title: config.title,
    description: config.description ?? "",
    site: context.site ?? config.site,
    items,
  });
}
