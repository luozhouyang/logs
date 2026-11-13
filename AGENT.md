# This Nimbus docs site

Astro-based docs. The `nimbus-docs` package handles content schemas, sidebar/TOC, MDX→markdown, build hooks, and the `nimbus` CLI. Everything in `src/` is yours to edit.

## This project

This is a personal blog built on the Nimbus docs framework, not a product docs
site. The original posts were migrated from an Astro blog, so:

- **The site is bilingual, English by default.** English posts live in
  `src/content/docs/<section>/<slug>.mdx` and are served at the root; Chinese
  posts live in `src/content/zh/<section>/<slug>.mdx` and are served under
  `/zh/`. The section directory groups posts in the sidebar — there is no
  separate categories/tags layer; post pages use the starter's layout and
  components as-is.
- **The homepage is the one bespoke surface.** `src/components/HomePage.astro`
  renders an interactive terminal; `src/scripts/terminal.ts` holds the client
  logic (command parser, scripted tour, takeover, idle resume). Content and
  copy are built from the locale's entries — keep the `zh`/`en` copy branches
  aligned, and keep the `sr-only` nav mirror (SEO and screen readers) when
  touching the layout. `data-idle-ms` on the terminal root tunes the resume
  delay (default 10s); tests shorten it.
- **Translations share the entry id.** A translation is the same
  `<section>/<slug>` in the other collection — that pairing drives the language
  switcher (`src/lib/blog-nav.ts`) and the `hreflang` alternates. Mark
  translations with `translatedFrom: en|zh`.
- **A missing translation is allowed.** The switcher falls back to the other
  locale's home; never duplicate a post just to fill the gap.
- **Locale plumbing** lives in `src/lib/i18n.ts` (base path, `<html lang>`,
  labels) and `src/lib/ui-labels.ts` (framework chrome strings). The `/zh`
  routes mirror the root ones and build their own sidebar/breadcrumbs/prev-next
  through `src/lib/blog-nav.ts`, because Nimbus's nav helpers only prefix docs
  *versions*, not second locales.
- **Extra frontmatter fields** are declared in `src/content.config.ts`:
  `tags`, `date` (first published, from the old `pubDate`), `lang` (rare
  per-page override), `translatedFrom`. `lastUpdated` is modelled by Nimbus and
  falls back to git history.
- **Never break a published URL.** When a post moves, add its old path to the
  `redirects` map in `astro.config.ts` — the pre-Nimbus `/blog/<slug>/` paths
  are kept alive there.
- **Search is per language.** Pagefind indexes each page under its
  `<html lang>` and the dialog queries the current page's language index, so
  English pages search English posts and `/zh/` pages search Chinese ones.
- **The site is deployed under a base path** (`/logs` on GitHub Pages). Never
  hardcode a root-relative URL in a component or route: use `withBase()` from
  `src/lib/base.ts` (or `localePath()` for locale-aware links). Nimbus 0.8
  predates `base`, so the post routes strip the base before calling its nav
  helpers and re-prefix the results; markdown content URLs are rewritten by
  `src/lib/markdown-base.ts`; redirect targets in `astro.config.ts` are
  prefixed at config time.
- **E2E runs against the production build** (`astro preview` on port 4327 under
  `/logs` via `playwright.config.ts`), not the dev server — the dev toolbar
  injects its own `<header>` elements and the static build is what actually
  ships. Tests use `url()` from `e2e/helpers.ts` for in-site paths
  (`E2E_BASE=""` runs them against a root build).

## File layout

```
astro.config.ts              # imports nimbus + defineNimbusConfig
src/
├── components.ts            # MDX globals registry — every component used in .mdx must be listed
├── components/              # AgentDirective, Header, Render + ui/<slug>/
├── content/
│   ├── docs/                # English posts (default locale, served at /)
│   ├── zh/                  # Chinese posts (served at /zh)
│   └── partials/*.mdx       # referenced via <Render file="..." />
├── content.config.ts        # registers docsCollection() + partialsCollection()
├── layouts/                 # BaseLayout (NimbusHead), DocsLayout (sidebar/TOC/breadcrumbs)
├── lib/cn.ts                # Tailwind className merger
├── pages/
│   ├── [...slug].astro
│   ├── [...slug]/index.md.ts   # per-page markdown alternate
│   ├── llms.txt.ts
│   ├── og.png.ts                # site-level OG card
│   ├── og/
│   │   ├── _og-card-config.ts   # shared OG theme tokens (underscore = not a route)
│   │   └── [...slug].ts         # per-page OG cards
│   └── robots.txt.ts
└── styles/                  # globals.css, prose.css
```

Cloudflare deploys also have `wrangler.jsonc` at the project root.

## Writing docs

Frontmatter validates against `docsSchema` (`nimbus-docs/schemas`). Required: `title`.

```mdx
---
title: My page
description: One-line summary.
---

Content here. The page H1 comes from `title` — don't repeat it in the body.

## Section heading
```

Rules:

- **Components must be PascalCase and registered in `src/components.ts`.** A pre-build validator catches typos with a "did you mean" hint.
- **Partials use `<Render file="..." />`.** Don't import `.mdx` directly. Shared content lives in `src/content/partials/<slug>.mdx`.
- **Icons use `astro-icon` + Phosphor.** `<Icon name="ph:<glyph>" class="w-4 h-4" />` from `astro-icon/components`. Glyphs: [phosphoricons.com](https://phosphoricons.com).
- **Don't remove `<AgentDirective />` from `BaseLayout.astro`.** It points agents at `/llms.txt`.

## Adding things

| Goal | Action |
|---|---|
| New doc page | Create `src/content/docs/<slug>.mdx`. Sidebar picks it up. |
| New partial | Create `src/content/partials/<slug>.mdx`. Use via `<Render file="<slug>" />`. |
| UI from registry | `pnpm exec nimbus-docs add <slug>`. Register in `src/components.ts` if used in MDX. |
| Feature recipe | `pnpm exec nimbus-docs add <feature-slug>`. Pipe the printed brief to your agent. |
| Custom page route | Add a file under `src/pages/`. |
| Custom OG style | Edit `src/pages/og/_og-card-config.ts`. |
| Check for updates | `pnpm exec nimbus-docs outdated` — starter files behind their tag + registry components behind. |
| Upgrade a starter file | `pnpm exec nimbus-docs diff <file>` to review, `diff --apply <file>` to pull a clean upstream change. |
| Upgrade a registry component | `pnpm exec nimbus-docs add <slug> --overwrite`, then review with `git diff`. |

List installable items: `pnpm exec nimbus-docs list`.

## Audit this site

When asked to audit, walk the categories below. Emit findings as:

```
- [error|warn|info] FILE:LINE — what + why + fix.
```

End with `Summary: N errors, N warnings.`

- **Config** — `astro.config.ts` calls `nimbus(defineNimbusConfig({ ... }))`; `site` is set; `editPattern` (if set) contains `{path}`; `output:` matches the deploy target.
- **Content** — `content.config.ts` registers `docsCollection()` (and `partialsCollection()` if used); every `.mdx` is inside a registered collection; frontmatter validates.
- **Sidebar** — every sidebar ref resolves to a content entry; no orphans; no slug collisions.
- **MDX** — every PascalCase component in `*.mdx` is registered; every `<Render file=...>` resolves; code-fence languages are valid.
- **Routes** — `llms.txt.ts`, `robots.txt.ts`, `[...slug]/index.md.ts`, `og.png.ts`, `og/[...slug].ts` all exist.
- **Registry hygiene** — every `src/components/ui/<slug>/` is either MDX-registered or imported in `src/`; transitive deps (`lib/cn.ts`, etc.) exist.
- **AI surface** — `<AgentDirective />` renders in `BaseLayout.astro`; doc `<head>` has `<link rel="alternate" type="text/markdown" ...>`.
- **Search** — `data-pagefind-body` is on the docs main wrapper; after `pnpm build`, `dist/pagefind/` exists with ≥1 indexed page.
- **Cloudflare** (if applicable) — `wrangler.jsonc` has `name`, `compatibility_date`, `assets.directory = "./dist"`, `not_found_handling`.

## Don't

- Hand-add components under `src/components/ui/` that exists in the nimbus-docs registry — use `nimbus-docs add` so deps resolve.
- Import `.mdx` files directly — use `<Render file="..." />`.
- Attach remark/rehype plugins via `mdx({ remarkPlugins })` — Sätteri silently drops them. Framework-side transformations run as content passes.
- Remove `<AgentDirective />` unless asked.
- Edit `src/components.ts` to bypass registration — if a component is used in `.mdx`, register it.

## Project home

[nimbus-docs.com](https://nimbus-docs.com)
