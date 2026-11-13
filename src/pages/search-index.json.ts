/**
 * Machine-readable index of every published post, in both locales.
 *
 * It backs the development fallback in the search provider: Pagefind only
 * produces an index during a production build, so `astro dev` would otherwise
 * have no searchable data. In production the dialog still uses Pagefind; this
 * file just also happens to be a convenient agent-facing index.
 */
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { localePath, locales, type Locale } from "../lib/i18n";

export const prerender = true;

interface IndexItem {
  title: string;
  description: string;
  tags: string[];
  lang: string;
  url: string;
}

export const GET: APIRoute = async () => {
  const [english, chinese] = await Promise.all([getCollection("docs"), getCollection("zh")]);

  const items: IndexItem[] = [
    ...english.map((entry) => ({ locale: "en" as Locale, entry })),
    ...chinese.map((entry) => ({ locale: "zh" as Locale, entry })),
  ]
    .filter(({ entry }) => !entry.data.draft)
    .map(({ locale, entry }) => ({
      title: entry.data.title,
      description: entry.data.description ?? "",
      tags: entry.data.tags ?? [],
      lang: locales[locale].htmlLang,
      url: localePath(locale, `/${entry.id}/`),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  return new Response(JSON.stringify(items), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
