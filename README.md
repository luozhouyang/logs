# luozhouyang's log

A personal blog about Cloudflare, Kong Gateway, Docker, and self-hosting. It is
built on [Cloudflare Nimbus](https://nimbus-docs.com) — the Astro-based docs
framework — with Pagefind search.

Live at **<https://luozhouyang.github.io/logs>**, deployed by GitHub Actions to
GitHub Pages. The origin (`site`) and the `/logs` path (`base`) are fixed in
`astro.config.ts`, so every URL the build emits carries the prefix — dev
included.

## Languages

English is the default locale and lives at the root. Chinese is mounted at
`/zh/`. Each locale is a content collection:

| Locale | Collection | Content | URLs |
| :-- | :-- | :-- | :-- |
| English (default) | `docs` | `src/content/docs/<section>/<slug>.mdx` | `/kong/introduction/` |
| Chinese | `zh` | `src/content/zh/<section>/<slug>.mdx` | `/zh/kong/introduction/` |

A translation is a file with the **same id** in the other collection; that is
what pairs the pages for the language switcher.
Mark a translation with `translatedFrom: zh` (or `en`) in frontmatter so its
provenance is explicit. A post that exists in only one language is fine — its
switcher then sends readers to the other locale's home.

Adding a language means adding it to `src/lib/i18n.ts` (base path, `<html lang>`,
labels, UI strings) and registering its collection in `src/content.config.ts`;
the routes under `src/pages/<locale>/` are thin copies of the root ones.

## Content

Posts live in `src/content/<collection>/<section>/<slug>.mdx`. The section
directory groups posts in the sidebar (`/kong/introduction/` sits under `Kong`).
The site itself is the stock Nimbus structure: `src/pages/index.astro` landing,
`DocsLayout` for posts, the starter `Header` (section tabs, search, theme
toggle), and `Render`/partials support — only the locale plumbing is added.

The homepage (`src/components/HomePage.astro` + `src/scripts/terminal.ts`) is
the one custom surface: an interactive terminal. It plays a scripted tour that
types a command, prints the result and moves on, walking every section and post
(`ls`, `ls <section>`, `cat <post>`, …). Typing or clicking hands control to the
reader; once their command has printed and they have been idle for 10s
(`data-idle-ms`), the tour resumes where it left off.

Commands: `ls [section]`, `cat <post>`, `open <post>`, `find <kw>`, `whoami`,
`about`, `rss`, `llms`, `github`, `lang`, `date`, `pwd`, `echo`, `clear`, `help`.
Copy and content are baked in at build time; a screen-reader/crawler mirror of
every post lives in an `sr-only` nav. Everything else is the Nimbus starter.

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
| `npm run dev` | Dev server at `localhost:4321/logs/` |
| `npm run build` | Build to `dist/` (includes `astro check`, MDX validation, Pagefind) |
| `npm run preview` | Serve `dist/` locally |
| `npm run lint:docs` | Lint content (`nimbus-docs lint`), `--fix` to autofix |
| `npm run typecheck` | `astro check` |
| `npm run test:e2e` | Playwright suite against the production build under `/logs` (port 4327) |

## URLs and feeds

Posts live at `/<section>/<slug>/` (Chinese under `/zh/`); there is no `/blog/`
segment and no redirect layer. Feeds are per locale: `/rss.xml` (English) and `/zh/rss.xml` (Chinese). The
sitemap at `/sitemap-index.xml` covers both, and each language has its own
agent index (`/llms.txt`, `/zh/llms.txt`) plus clean-markdown alternates at
`<page>/index.md`.

## Search

Search is Pagefind. It indexes per language (from each page's `<html lang>`)
and the dialog queries the index for the page you're on: English pages search
English posts, `/zh/` pages search Chinese posts.

Pagefind only builds during `npm run build`. `astro dev` would otherwise have
no index, so the provider falls back to `/search-index.json` — a build-time
JSON index of every post in both locales. Production always uses Pagefind.

Layouts and UI components are the stock Nimbus starter files. The only
departures, all invisible or structural:

| File | Deviation |
| :-- | :-- |
| `src/components/Header.astro` | No section tab strip; adds the EN/中文 switch |
| `src/layouts/BaseLayout.astro` | `<html lang>` follows the URL locale |
| `src/components/ui/search/providers/pagefind.ts` | `/logs` prefix on results + dev fallback |
| `src/components/HomePage.astro` | The landing page is the terminal |

Chrome copy (TOC, pagination, search dialog, breadcrumbs) is the framework's
English default on both locales; only post content and `<html lang>` follow
the locale.

## Deployment

### GitHub Pages (default)

The site is built for `https://luozhouyang.github.io/logs`, i.e. `base: "/logs/"`,
and published by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
on every push to `main` (or manually via *Run workflow*). Enable it once under
**Settings → Pages → Build and deployment → Source: "GitHub Actions"**.

The workflow runs `npm ci && npm run build` and uploads `dist/` as the Pages
artifact. `site`/`base` live in `astro.config.ts` (`https://luozhouyang.github.io`
+ `/logs/`), so there is nothing to configure in the workflow.

Locally, `npm run preview` serves the build at `/logs/` too, and the e2e suite
expects that (`E2E_BASE=""` switches it to a root build).

### Base path

Everything that writes an in-site URL goes through `src/lib/base.ts`
(`withBase`) — including the locale helper and Nimbus's nav output. Content
markdown keeps plain `/images/...` paths; a markdown plugin prefixes them at
build time. If you add a route or component, use `withBase` (or `localePath`)
rather than a bare `/...` string.
