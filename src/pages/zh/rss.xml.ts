/** Chinese feed, mirroring /rss.xml. */
import { buildFeed } from "../../lib/feed";

export const prerender = true;

export async function GET(context: { site: URL | undefined }) {
  return buildFeed("zh", context.site);
}
