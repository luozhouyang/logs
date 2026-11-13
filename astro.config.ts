import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import nimbus, {
  defineConfig as defineNimbusConfig,
} from "@cloudflare/nimbus-docs";
import { tableScroll } from "@cloudflare/nimbus-docs/markdown";
import { baseContentUrls } from "./src/lib/markdown-base";

const nimbusConfig = defineNimbusConfig({
  site: "https://luozhouyang.github.io",
  title: "luozhouyang's log",
  description: "Notes on Cloudflare, Kong Gateway, Docker, and self-hosting.",
  locale: "en",
  github: "https://github.com/luozhouyang",
  socialImageAlt: "luozhouyang's log — technical notes and guides",
  // The homepage is a custom terminal, so the sidebar is just the post
  // sections. `zh` is labelled so the Chinese tree reads as one group.
  sidebar: {
    items: [
      { label: "Cloudflare", autogenerate: { directory: "cloudflare" } },
      { label: "E Commerce", autogenerate: { directory: "e-commerce" } },
      { label: "Kong", autogenerate: { directory: "kong" } },
      { label: "中文", autogenerate: { directory: "zh" } },
    ],
  },
  // GitHub Pages project site: the origin root isn't ours, so leave
  // /.well-known to the origin and keep llms.txt under /logs.
  agents: { discovery: false },
});

export default defineConfig({
  // nimbus:adapter
  output: "static",
  // GitHub Pages project site: https://luozhouyang.github.io/logs
  base: "/logs/",
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
      markdown: {
        // Wrap wide tables so they scroll instead of overflowing the page
        // (styled by `.nb-table-scroll` in src/styles/prose.css).
        // baseContentUrls prefixes content images and links for /logs.
        hastPlugins: [tableScroll(), baseContentUrls("/logs/")],
        // `## Install {#install}` gives a heading a fixed id. A heading that
        // ends in other `{…}` text, such as `{account_id}` in a .md file, is
        // read as attributes too; remove this to keep it as text.
        features: { headingAttributes: true },
      },
    }),
  ],
});
