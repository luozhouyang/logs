import { defineConfig } from "astro/config";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";
import nimbus, { defineConfig as defineNimbusConfig } from "@cloudflare/nimbus-docs";
import { tableScroll } from "@cloudflare/nimbus-docs/markdown";
import { baseContentUrls } from "./src/lib/markdown-base";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// GitHub Pages serves project sites under /<repo>/, so the site is built for
// https://luozhouyang.github.io/logs by default. The same source can still be
// built for a root deploy (e.g. Cloudflare Workers on luozhouyang.com) with
// `SITE_URL=https://luozhouyang.com SITE_BASE= npm run build`.
const SITE_URL = process.env.SITE_URL ?? "https://luozhouyang.github.io";
// Trailing slash matters: NimbusHead concatenates `import.meta.env.BASE_URL`
// with file names ("favicon.ico", "_nimbus/shiki.css"), so it must end in "/".
const SITE_BASE = process.env.SITE_BASE ?? "/logs/";
const BASE_PREFIX = SITE_BASE.replace(/\/+$/, "");

/** Prefix an in-site path for the deployment base (used by redirects). */
const withBasePath = (path: string) =>
  !BASE_PREFIX ? path : path === "/" ? `${BASE_PREFIX}/` : `${BASE_PREFIX}${path}`;

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
  // The pre-Nimbus site served posts at /blog/<slug>/ and paginated listings
  // at /page/<n>/. Those URLs are in the wild, so keep them alive instead of
  // 404-ing: each one points at the post wherever it now lives.
  // Astro emits these redirect pages at the old paths but does not add `base`
  // to the destination, so it is added here.
  redirects: {
    "/blog": withBasePath("/"),
    "/blog/building-an-image-hosting-platform-with-cloudflare-r2": withBasePath("/cloudflare/r2-image-hosting"),
    "/blog/cloudflare-wrangler-usage-tips": withBasePath("/cloudflare/wrangler-tips"),
    "/blog/kong-introduction": withBasePath("/kong/introduction"),
    "/blog/kong-gateway-docker-deploy": withBasePath("/kong/docker-deploy"),
    "/page/1": withBasePath("/"),
    // The old starter "About me" page was placeholder copy; there is no
    // equivalent page now, so send the link home rather than 404 it.
    "/about": withBasePath("/"),
  },
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
