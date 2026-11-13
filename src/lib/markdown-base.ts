/**
 * Rewrite root-relative URLs in rendered markdown for a sub-path deployment.
 *
 * Content writes images as `/images/kong-manager.png`. On GitHub Pages the site
 * lives under `/logs`, so that would 404. Nimbus runs its own markdown
 * pipeline (`markdown.hastPlugins`) and leaves absolute content URLs alone, so
 * this pass prefixes them at build time.
 */

import type { Element } from "hast";

const URL_ATTRIBUTE: Record<string, string> = {
  img: "src",
  a: "href",
  video: "src",
  source: "src",
};

export function baseContentUrls(base: string) {
  const prefix = base.replace(/\/+$/, "");

  return {
    name: "nimbus:base-content-urls",
    element: {
      filter: Object.keys(URL_ATTRIBUTE),
      visit(node: Element): Element | undefined {
        if (!prefix || !node.tagName) return;
        const attribute = URL_ATTRIBUTE[node.tagName];
        const value = node.properties?.[attribute];
        if (typeof value !== "string") return;
        if (!value.startsWith("/") || value.startsWith("//")) return;
        if (value === prefix || value.startsWith(`${prefix}/`)) return;

        return {
          ...node,
          properties: { ...node.properties, [attribute]: `${prefix}${value}` },
        } as Element;
      },
    },
  };
}
