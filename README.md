# luozhouyang's log

A personal blog about Cloudflare, Kong Gateway, Docker, and self-hosting. It is
built on [Cloudflare Nimbus](https://nimbus-docs.com) — the Astro-based docs
framework — with Pagefind search and static hosting on Cloudflare Workers.

## Languages

English is the default locale and lives at the root. Chinese is mounted at
`/zh/`. Each locale is a content collection:

| Locale | Collection | Content | URLs |
| :-- | :-- | :-- | :-- |
| English (default) | `docs` | `src/content/docs/<section>/<slug>.mdx` | `/kong/introduction/` |
| Chinese | `zh` | `src/content/zh/<section>/<slug>.mdx` | `/zh/kong/introduction/` |

A translation is a file with the **same id** in the other collection; that is
what pairs the pages for the language switcher and the `hreflang` alternates.
Mark a translation with `translatedFrom: zh` (or `en`) in frontmatter so its
provenance is explicit. A post that exists in only one language is fine — its
switcher then sends readers to the other locale's home.

Adding a language means adding it to `src/lib/i18n.ts` (base path, `<html lang>`,
labels, UI strings) and registering its collection in `src/content.config.ts`;
the routes under `src/pages/<locale>/` are thin copies of the root ones.

## Content

Posts live in `src/content/<collection>/<section>/<slug>.mdx`. The section
directory is the post's category (`/kong/introduction/` → category `kong`), and
frontmatter `tags` drive `/tags/<tag>/` pages.

```mdx
---
title: Deploying Kong Gateway with Docker
description: Deploy Kong Gateway on Docker and secure Kong Manager UI access.
date: 2025-11-20           # first published, carried over from the old blog
lastUpdated: 2025-11-20    # optional; falls back to git history
tags: [kong, docker]
sidebar:
  order: 1                 # order within the section
translatedFrom: zh         # translations only: this file is the English version
---
```

Only `title` is required. Component and authoring rules are documented in
[AGENT.md](AGENT.md).

## Commands

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Build to `dist/` (includes `astro check`, MDX validation, Pagefind) |
| `npm run preview` | Serve `dist/` locally |
| `npm run lint:docs` | Lint content (`nimbus-docs lint`), `--fix` to autofix |
| `npm run typecheck` | `astro check` |
| `npm run test:e2e` | Playwright suite against the production build (port 4327) |
| `npm run deploy` | Check, build, and `wrangler deploy` |

## URLs and redirects

Posts used to live at `/blog/<slug>/`. Those paths are kept alive in the
`redirects` map in `astro.config.ts` — add an entry there whenever a post moves,
so old links (feeds, search results, other people's bookmarks) keep working.

Feeds are per locale: `/rss.xml` (English) and `/zh/rss.xml` (Chinese). The
sitemap at `/sitemap-index.xml` covers both, and each language has its own
agent index (`/llms.txt`, `/zh/llms.txt`) plus clean-markdown alternates at
`<page>/index.md`.

## Search

Search is Pagefind. It indexes per language (from each page's `<html lang>`
and the search dialog queries the index for the page you're on: English pages
search English posts, `/zh/` pages search Chinese posts.

Framework chrome (table of contents, pagination, page actions, search dialog)
is localized through `src/lib/ui-labels.ts`; components fall back to English
when no labels are passed.

## Deployment

`wrangler.jsonc` serves `dist/` as static assets on Cloudflare Workers with a
custom 404 page:

```sh
npm run deploy
```
