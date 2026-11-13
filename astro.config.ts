import { defineConfig } from "astro/config";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";
import nimbus, { defineConfig as defineNimbusConfig } from "@cloudflare/nimbus-docs";
import { tableScroll } from "@cloudflare/nimbus-docs/markdown";
import { baseContentUrls } from "./src/lib/markdown-base";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// The site lives at https://luozhouyang.github.io/logs — a GitHub Pages project
// site, so everything is mounted under /logs/. Astro's `site` is the origin and
// `base` is the path; together they produce https://luozhouyang.github.io/logs/…
// (dev included: `pnpm dev` serves http://localhost:4321/logs/).
//
// The trailing slash matters: NimbusHead concatenates `import.meta.env.BASE_URL`
// with file names ("favicon.ico", "_nimbus/shiki.css"), so it must end in "/".
const SITE_URL = "https://luozhouyang.github.io";
const SITE_BASE = "/logs/";
const BASE_PREFIX = SITE_BASE.replace(/\/+$/, "");

/**
 * NimbusHead hardcodes `<link rel="sitemap" href="/sitemap-index.xml">`, which
 * breaks under a base path. Rewrite that one tag after the build rather than
 * forking the component.
 */
function baseSitemapLink() {
  return {
    name: "base-sitemap-link",
    hooks: {
      "astro:build:done": async ({ dir, logger }: { dir: URL; logger: { info: (m: string) => void } }) => {
        if (!BASE_PREFIX) return;
        const root = dir.pathname;
        const from = 'rel="sitemap" href="/sitemap-index.xml"';
        const to = `rel="sitemap" href="${BASE_PREFIX}/sitemap-index.xml"`;
        let rewritten = 0;

        const walk = async (directory: string) => {
          for (const entry of await readdir(directory, { withFileTypes: true })) {
            const full = join(directory, entry.name);
            if (entry.isDirectory()) {
              await walk(full);
            } else if (entry.name.endsWith(".html")) {
              const html = await readFile(full, "utf8");
              if (!html.includes(from)) continue;
              await writeFile(full, html.replaceAll(from, to));
              rewritten += 1;
            }
          }
        };

        await walk(root);
        logger.info(`base-sitemap-link: rewrote ${rewritten} page(s) for ${BASE_PREFIX}`);
      },
    },
  };
}

const nimbusConfig = defineNimbusConfig({
  site: SITE_URL,
  title: "luozhouyang's log",
  description: "Notes on Cloudflare, Kong Gateway, Docker, and self-hosting.",
  locale: "en",
  github: "https://github.com/luozhouyang",
  socialImageAlt: "luozhouyang's log — technical notes and guides",
});

export default defineConfig({
  output: "static",
  site: SITE_URL,
  base: SITE_BASE,
  // Tailwind v4 via its Vite plugin (the integration Astro recommends for
  // Tailwind v4 — replaces the PostCSS plugin, which doesn't build under
  // Astro 7's Vite 8 bundler).
  vite: {
    plugins: [tailwindcss()],
  },
  // Hover-prefetch link targets so full-page navigations feel instant without
  // a client-side router.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  integrations: [
    baseSitemapLink(),
    icon(),
    nimbus(nimbusConfig, {
      // Authoring rules are opt-in by design — your repo, your taste. The
      // two below are the load-bearing pair: frontmatter has to validate
      // against the content schema for the page to render properly, and
      // broken internal links are 404s for your readers. Add the others
      // (heading hierarchy, code-block language, style, etc.) when you're
      // ready to enforce them — see `nimbus-docs lint --help`.
      rules: {
        "nimbus/frontmatter-shape": "error",
        "nimbus/internal-link": "error",
      },
      // Wrap wide tables so they scroll instead of overflowing the page
      // (styled by `.nb-table-scroll` in src/styles/prose.css).
      markdown: {
        // tableScroll wraps wide tables; baseContentUrls rewrites `/images/…`
        // and other root-relative content URLs for the /logs deployment.
        hastPlugins: [tableScroll(), baseContentUrls(SITE_BASE)],
      },
    }),
  ],
});
