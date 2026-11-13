/**
 * Deployment base path.
 *
 * GitHub Pages serves this project at `https://luozhouyang.github.io/logs`, so
 * every in-site link must carry the `/logs` prefix. Astro rewrites its own
 * asset URLs from `base`, but hand-written links (and Nimbus 0.8's nav helpers,
 * which predate base support) need this helper.
 *
 * `import.meta.env.BASE_URL` is "/logs/" here and "/" when the site is built
 * for a domain root.
 */

const RAW_BASE = import.meta.env.BASE_URL;

/** Normalised base without a trailing slash: "/logs" (or "" at the root). */
export const SITE_BASE = RAW_BASE.replace(/\/+$/, "");

/** Prefix an in-site absolute path with the deployment base, idempotently. */
export function withBase(path: string): string {
  if (!path.startsWith("/") || !SITE_BASE) return path;
  if (path === SITE_BASE || path.startsWith(`${SITE_BASE}/`)) return path;
  return path === "/" ? `${SITE_BASE}/` : `${SITE_BASE}${path}`;
}

/** Remove the deployment base from a pathname, if present. */
export function stripBase(pathname: string): string {
  if (!SITE_BASE) return pathname;
  if (pathname === SITE_BASE) return "/";
  if (pathname.startsWith(`${SITE_BASE}/`)) return pathname.slice(SITE_BASE.length);
  return pathname;
}

/**
 * Deep-copy a nav structure with every `href`/`indexHref` base-prefixed.
 * Nimbus 0.8 builds its sidebar, prev/next and breadcrumbs at the site root;
 * this adapts them to a sub-path deployment without touching the framework.
 */
export function withBaseDeep<T>(value: T): T {
  if (Array.isArray(value)) return value.map((entry) => withBaseDeep(entry)) as unknown as T;
  if (value && typeof value === "object" && !(value instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      if ((key === "href" || key === "indexHref") && typeof nested === "string") {
        out[key] = withBase(nested);
      } else {
        out[key] = withBaseDeep(nested);
      }
    }
    return out as T;
  }
  return value;
}

/** Absolute URL for an in-site path, using the configured site origin. */
export function absoluteUrl(site: URL | string | undefined, path: string): string {
  const origin = site ? new URL(site) : new URL("https://luozhouyang.github.io");
  return new URL(withBase(path), origin).href;
}
