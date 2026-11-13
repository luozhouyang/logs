import { defineCollection } from "astro:content";
// `z` re-exported from `astro:content` is deprecated; import it from
// `astro/zod` (the pattern nimbus-docs' own schema helpers document).
import { z } from "astro/zod";
import { docsCollection, partialsCollection } from "@cloudflare/nimbus-docs/content";

/**
 * Frontmatter fields this blog adds on top of Nimbus's docs schema. Shared by
 * both locales so a post reads the same wherever it lives.
 */
const blogFields = {
  // Nimbus docs are agent-friendly by default. Set `audience: human` to flag
  // a page that's written primarily for human readers.
  audience: z.literal("human").optional(),
  tags: z.array(z.string()).optional(),
  // First published, carried over from the pre-Nimbus blog (`pubDate`).
  // Nimbus models `lastUpdated` natively; `date` is the authored date shown
  // before it on the page.
  date: z.coerce.date().optional(),
  // Content language for pages that aren't in the site locale.
  lang: z.string().optional(),
  // Marks a post as a translation of the same-id post in the other locale.
  translatedFrom: z.enum(["en", "zh"]).optional(),
};

export const collections = {
  // English — the default locale, served at the site root.
  docs: defineCollection(
    docsCollection({
      schemaFields: blogFields,
    }),
  ),
  // Chinese — same structure and ids as `docs`, served under /zh.
  zh: defineCollection(
    docsCollection({
      base: "zh",
      schemaFields: blogFields,
    }),
  ),
  partials: defineCollection(partialsCollection()),
};
