import { defineCollection } from "astro:content";
// `z` re-exported from `astro:content` is deprecated; import it from
// `astro/zod` (the pattern nimbus-docs' own schema helpers document).
import { z } from "astro/zod";
import { docsCollection } from "@cloudflare/nimbus-docs/content";

export const collections = {
  docs: defineCollection(
    docsCollection({
      schemaFields: {
        audience: z.literal("human").optional(),
        tags: z.array(z.string()).optional(),
        // Publication date, carried over from the pre-Nimbus blog (`pubDate`).
        // Nimbus models `lastUpdated` natively; `date` is the authored "first
        // published" date and is shown ahead of it on the page.
        date: z.coerce.date().optional(),
        // Content language for pages that aren't in the site locale (posts are
        // written in Chinese and English). Drives <html lang> and search
        // segmentation.
        lang: z.string().optional(),
      },
    }),
  ),
};
