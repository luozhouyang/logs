/** English feed — the default locale. */
import { buildFeed } from "../lib/feed";

export const prerender = true;

export async function GET(context: { site: URL | undefined }) {
  return buildFeed("en", context.site);
}
