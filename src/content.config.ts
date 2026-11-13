import { defineCollection } from "astro:content";
// `z` re-exported from `astro:content` is deprecated; import it from
// `astro/zod` (the pattern nimbus-docs' own schema helpers document).
import { z } from "astro/zod";
import { docsCollection, partialsCollection } from "@cloudflare/nimbus-docs/content";

// Post fields carried over from the original Astro blog. Nimbus models title,
// description, sidebar and lastUpdated itself; these are the blog's extras.
const schemaFields = {
  audience: z.literal("human").optional(),
  /** First published date. */
  date: z.coerce.date().optional(),
  tags: z.array(z.string()).optional(),
  /** Set on a translation: the language the post was translated from. */
  translatedFrom: z.enum(["en", "zh"]).optional(),
};

export const collections = {
  docs: defineCollection(docsCollection({ schemaFields })),
  partials: defineCollection(partialsCollection()),
};
