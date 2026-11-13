import { defineConfig } from "astro/config";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";
import nimbus, { defineConfig as defineNimbusConfig } from "@cloudflare/nimbus-docs";
import { tableScroll } from "@cloudflare/nimbus-docs/markdown";

const nimbusConfig = defineNimbusConfig({
  site: "https://luozhouyang.com",
  title: "luozhouyang's log",
  description: "Notes on Cloudflare, Kong Gateway, Docker, and self-hosting.",
  locale: "en",
  github: "https://github.com/luozhouyang",
  socialImageAlt: "luozhouyang's log — technical notes and guides",
});

export default defineConfig({
  output: "static",
  // The pre-Nimbus site served posts at /blog/<slug>/ and paginated listings
  // at /page/<n>/. Those URLs are in the wild, so keep them alive instead of
  // 404-ing: each one points at the post wherever it now lives.
  redirects: {
    "/blog": "/",
    "/blog/building-an-image-hosting-platform-with-cloudflare-r2": "/cloudflare/r2-image-hosting",
    "/blog/cloudflare-wrangler-usage-tips": "/cloudflare/wrangler-tips",
    "/blog/kong-introduction": "/kong/introduction",
    "/blog/kong-gateway-docker-deploy": "/kong/docker-deploy",
    "/page/1": "/",
    // The old starter "About me" page was placeholder copy; there is no
    // equivalent page now, so send the link home rather than 404 it.
    "/about": "/",
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
        hastPlugins: [tableScroll()],
      },
    }),
  ],
});
