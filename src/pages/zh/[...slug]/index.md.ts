/** Chinese markdown alternates: `/zh/<slug>/index.md`. */
import {
  getMarkdownStaticPaths,
  renderMarkdownResponse,
  type MarkdownProps,
} from "../../../lib/markdown-alternate";

export const prerender = true;

export const getStaticPaths = () => getMarkdownStaticPaths("zh");

export async function GET({ props }: { props: MarkdownProps }) {
  return renderMarkdownResponse(props);
}
