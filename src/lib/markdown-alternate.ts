/**
 * Per-page markdown alternates (`/<slug>/index.md`), shared by both locales.
 *
 * Nimbus computes each indexed entry's `markdownUrl` from its collection's
 * mount prefix, so the Chinese route reuses this with `collection: "zh"` and
 * gets `/zh/<slug>/index.md` for free.
 */
import {
  getIndexedEntries,
  renderEntryAsMarkdown,
  type IndexedEntry,
} from "@cloudflare/nimbus-docs";
import { config } from "virtual:nimbus/config";
import { withBase } from "./base";

export interface MarkdownProps {
  item: IndexedEntry;
}

export async function getMarkdownStaticPaths(collection: string) {
  const indexed = await getIndexedEntries();
  return indexed
    .filter((item) => item.collection === collection)
    .map((item) => ({
      // Root index (`entry.id === "index"`) emits at `/index.md`; every other
      // entry emits at `/<entry.id>/index.md`.
      params: {
        slug: item.entry.id === "index" ? undefined : item.entry.id,
      },
      props: { item } as MarkdownProps,
    }));
}

export function renderMarkdownResponse({ item }: MarkdownProps) {
  const { entry, title, description, markdownUrl, sourceUrl, version } = item;
  const data = (entry.data ?? {}) as Record<string, unknown>;
  const rawImage = data.socialImage;
  const socialImage =
    typeof rawImage === "string" && rawImage.length > 0 ? rawImage : config.socialImage;

  const markdown = renderEntryAsMarkdown(entry);
  const llmsIndex = item.collection === "zh" ? "/zh/llms.txt" : "/llms.txt";

  const body = [
    "---",
    `title: ${JSON.stringify(title)}`,
    ...(description ? [`description: ${JSON.stringify(description)}`] : []),
    ...(socialImage ? [`image: ${JSON.stringify(new URL(withBase(socialImage), config.site).href)}`] : []),
    ...(version ? [`version: ${JSON.stringify(version)}`] : []),
    "---",
    "",
    "> Documentation Index",
    `> Fetch the complete documentation index at: ${new URL(withBase(llmsIndex), config.site).href}`,
    "> Use this file to discover all available pages before exploring further.",
    "",
    `# ${title}`,
    "",
    markdown,
    "",
    // Point at the authored source (`.mdx` twin) when it exists.
    `Source: ${new URL(withBase(sourceUrl ?? markdownUrl), config.site).href}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
