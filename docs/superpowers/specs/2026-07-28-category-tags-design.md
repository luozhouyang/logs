# Category & Tags System — Design

## Summary

Add category (derived from folder) and tags (frontmatter) metadata to the blog, with browse pages and header dropdown navigation.

## Data Model

- **Category**: derived from the first path segment of the entry id (`cloudflare/r2-image-hosting` → `cloudflare`). No frontmatter field needed.
- **Tags**: `tags: string[]` added to `content.config.ts` via `schemaFields`. Optional per page.

## Taxonomy Utilities (`src/lib/taxonomy.ts`)

Pure build-time functions over `getCollection("docs")`:

- `getCategories(): Promise<TaxonomyItem[]>` — `{ slug, label, count }[]`, sorted by label. Label = slug with `-` → space, title-cased.
- `getTags(): Promise<TaxonomyItem[]>` — aggregated from frontmatter, sorted by count desc then label.
- `getPostsByCategory(slug): Promise<PostSummary[]>` — entries whose folder matches, sorted by `sidebar.order` then title.
- `getPostsByTag(slug): Promise<PostSummary[]>` — entries whose tags include slug, same sort.
- `getCategoryFromId(id): string` — first path segment.
- `PostSummary` = `{ slug, title, description, tags, category }`.
- Drafts (`draft: true`) excluded from all taxonomy queries.

## Routes

| Route | Page |
|---|---|
| `/categories/` | All categories as LinkCard grid with post counts |
| `/categories/[category]/` | Post list for one category |
| `/tags/` | Tag cloud (Badge-based pills) with counts |
| `/tags/[tag]/` | Post list for one tag |

All use `BaseLayout` + `Header`, `getStaticPaths` from taxonomy utils. Post list items show title, description, category badge, tag badges.

## Header Navigation

Two Popover dropdowns in the header right area (left of search trigger), desktop only (`hidden md:flex`):

- **Categories** trigger → popover listing all categories with counts, each linking to `/categories/[slug]/`. Footer link "All categories →" → `/categories/`.
- **Tags** trigger → popover listing all tags as pills, each linking to `/tags/[slug]/`. Footer link "All tags →" → `/tags/`.

Uses installed `popover` component (Popover + PopoverTrigger + PopoverContent, placement `bottom-end`).

## Homepage

Replace hardcoded category cards with dynamic `getCategories()` output, rendered as LinkCards.

## Components

| Component | Source | Usage |
|---|---|---|
| Badge | installed | tag pills, category badges on post items |
| LinkCard | registry (installed) | category cards, post list items |
| CardGrid | installed | grid layouts |
| Popover/PopoverTrigger/PopoverContent | registry (installed) | header dropdowns |
| LinkButton | installed | "All categories/tags" links |

## Frontmatter Changes

Existing posts get `tags` added. Example:

```yaml
tags: [cloudflare, r2, storage, s3]
```

## Testing

- `pnpm typecheck` (astro check)
- `pnpm lint:docs`
- `pnpm build`
- E2E: new spec covering header dropdowns, category/tag page navigation, post list links

## Out of Scope

- Search integration (Pagefind facets) for tags
- RSS per tag/category
- i18n