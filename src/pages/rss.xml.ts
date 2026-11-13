/**
 * English feed — the default locale.
 *
 * The pre-Nimbus blog shipped /rss.xml, so the path stays; Chinese posts have
 * their own feed at /zh/rss.xml.
 */
import { buildFeed } from "../lib/feed";

export const prerender = true;

export async function GET(context: { site: URL | undefined }) {
  return buildFeed("en", context.site);
}
