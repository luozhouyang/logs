import { test, expect } from "@playwright/test";
import { url } from "./helpers";

// One feed per locale, each with its own <language> and only that locale's
// posts. The site no longer ships redirect pages for the pre-Nimbus URLs.
test.describe("Feeds", () => {
  test("serves an English feed at /rss.xml", async ({ request }) => {
    const res = await request.get(url("/rss.xml"));
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("<language>en</language>");
    expect(body).toContain("<title>Kong Gateway introduction</title>");
    expect(body).toContain("Deploying Kong Gateway with Docker");
    // English feed, so the Chinese originals stay out of it.
    expect(body).not.toContain("在Docker部署Kong Gateway");
  });

  test("serves a Chinese feed at /zh/rss.xml", async ({ request }) => {
    const res = await request.get(url("/zh/rss.xml"));
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("<language>zh-CN</language>");
    expect(body).toContain("<title>在Docker部署Kong Gateway</title>");
    expect(body).not.toContain("Deploying Kong Gateway with Docker");
  });

  test("has no legacy redirect pages", async ({ request }) => {
    const res = await request.get(url("/blog/kong-introduction"));
    expect(res.status()).toBe(404);
  });
});
