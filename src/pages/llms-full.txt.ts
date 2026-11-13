// Full-corpus markdown for AI agents — every published page in one
// document. Scope and collation live in the framework helper; reshape or
// delete this route to change the site's corpus policy.
import { renderCorpusMarkdown } from "@cloudflare/nimbus-docs";
import { config } from "virtual:nimbus/config";
import { SITE_BASE } from "../lib/base";

export const prerender = true;

export async function GET() {
  const body = await renderCorpusMarkdown();

  // The framework emits absolute URLs at the site root; on a sub-path deploy
  // every one of them needs the base prefix. All of them are site-absolute,
  // so a single rewrite of the origin is enough.
  const origin = config.site.replace(/\/$/, "");
  const corpus =
    SITE_BASE && origin
      ? body.replaceAll(`${origin}/`, `${origin}${SITE_BASE}/`)
      : body;

  return new Response(corpus, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
