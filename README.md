# luozhouyang's log

A personal blog about Cloudflare, Kong Gateway, Docker, and self-hosting. It is
built on [Cloudflare Nimbus](https://nimbus-docs.com) — the Astro-based docs
framework — with Pagefind search and static hosting on Cloudflare Workers.

## Content

Posts live in `src/content/docs/<section>/<slug>.mdx`. The section directory is
the post's category (`/kong/introduction/` → category `kong`), and frontmatter
`tags` drive `/tags/<tag>/` pages.

```mdx
---
title: 在Docker部署Kong Gateway
description: 在Docker上部署Kong Gateway并且提供安全的Kong Manager UI访问
date: 2025-11-20          # first published (carried over from the old blog)
lastUpdated: 2025-11-20   # optional; falls back to git history
lang: zh-CN               # optional; defaults to the site locale (en)
tags: [kong, docker]
sidebar:
  order: 1                # order within the section
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

The feed is at `/rss.xml`, the sitemap at `/sitemap-index.xml`, and
`/llms.txt` indexes the site for agents.

## Search

Search is Pagefind, configured by `pagefind.yml`. The blog is bilingual, and
Pagefind would otherwise build one index per language and only query the one
matching the current page — making Chinese posts invisible from English pages.
`pagefind.yml` forces a single Chinese index so every post is findable from
anywhere; English queries still work, without stemming.

## Deployment

`wrangler.jsonc` serves `dist/` as static assets on Cloudflare Workers with a
custom 404 page:

```sh
npm run deploy
```
