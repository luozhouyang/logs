import { getCollection } from "astro:content";
import { OGImageRoute } from "astro-og-canvas";
import { ogCardConfig } from "./_og-card-config";

// One card per post in every locale. The key is the card's path under /og/,
// so Chinese posts live at /og/zh/<slug>.png — matching the /zh route.
const englishEntries = await getCollection("docs", (entry) => !entry.data.draft);
const chineseEntries = await getCollection("zh", (entry) => !entry.data.draft);

type OgPage = { title: string; description: string };

const pageEntries: [string, OgPage][] = [
  ...englishEntries.map((entry): [string, OgPage] => [
    entry.id,
    { title: entry.data.title, description: entry.data.description ?? "" },
  ]),
  ...chineseEntries.map((entry): [string, OgPage] => [
    `zh/${entry.id}`,
    { title: entry.data.title, description: entry.data.description ?? "" },
  ]),
];

const pages = Object.fromEntries(pageEntries);

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    ...ogCardConfig,
  }),
});
