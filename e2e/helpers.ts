/**
 * The site is built for GitHub Pages at `/logs`, and `astro preview` serves it
 * there too, so every in-site path in a test needs the deployment base. Set
 * `E2E_BASE=""` to run the suite against a root-base build.
 */
export const BASE = process.env.E2E_BASE ?? "/logs";

/** Absolute in-site path for the deployment base. */
export function url(path: string): string {
  if (!BASE) return path;
  return path === "/" ? `${BASE}/` : `${BASE}${path}`;
}
