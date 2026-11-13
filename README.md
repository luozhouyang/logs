# luozhouyang's log

A personal blog about Cloudflare, Kong Gateway, Docker, and self-hosting,
built on [Cloudflare Nimbus](https://nimbus-docs.com) 0.20.

Live at **<https://luozhouyang.github.io/logs>**, deployed by GitHub Actions to
GitHub Pages. `site` is the origin and `base` is `/logs/`, so every URL the
build emits carries the prefix.

## Structure

Everything lives in one `docs` collection:

| Language | Content | URLs |
| :-- | :-- | :-- |
| English (default) | `src/content/docs/<section>/<slug>.mdx` | `/kong/introduction/` |
| Chinese | `src/content/docs/zh/<section>/<slug>.mdx` | `/zh/kong/introduction/` |

The catch-all route `src/pages/[...slug].astro` serves both trees. It sets
`locale="zh-CN"` for `/zh/` pages so Pagefind indexes Chinese with Chinese
tokenisation. Post pages use the stock Nimbus `DocsLayout`: left sidebar,
right `On this page` TOC, breadcrumbs and prev/next.

## Homepage

`src/pages/index.astro` and `src/pages/zh/index.astro` render
`src/components/HomePage.astro`, an interactive terminal. It plays a scripted
tour of every section and post; typing takes over, and after 10s of inactivity
(`data-idle-ms`) the tour resumes. The client logic is in
`src/scripts/terminal.ts`; links go through `src/lib/i18n.ts` so they carry the
locale and `/logs` base. A screen-reader/crawler mirror of every post lives in
an `sr-only` nav.

## Commands

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at `localhost:4321/logs/` |
| `npm run build` | Build to `dist/` (includes Pagefind) |
| `npm run preview` | Serve `dist/` locally |
| `npm run typecheck` | `astro check` |
| `npm run lint:docs` | Lint content (`nimbus-docs lint`), `--fix` to autofix |

## Feeds and agent surfaces

Posts live at `/<section>/<slug>/` (Chinese under `/zh/`). Feeds are per
locale: `/rss.xml` and `/zh/rss.xml`. Nimbus also emits `/llms.txt`,
`/zh/llms.txt`, per-page `index.md` / `index.mdx` alternates, OG cards and the
sitemap.

## Search

Search is Pagefind, built during `npm run build`. It indexes each page under
its `<html lang>`, so English pages search English posts and `/zh/` pages
search Chinese ones.

## Deployment

Pushing to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which builds the site and publishes `dist/` with GitHub Pages. Enable it once
under **Settings → Pages → Build and deployment → Source: "GitHub Actions"**.
