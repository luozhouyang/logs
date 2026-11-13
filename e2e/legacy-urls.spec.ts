import { test, expect } from "@playwright/test";

// The blog moved from `/blog/<slug>/` to a topic-section layout during the
// Nimbus refactor. These URLs are in the wild (feeds, search results, other
// people's links), so the old paths must still land on the right post.
test.describe("Legacy blog URLs", () => {
  const redirects = [
    ["/blog/kong-introduction", "/kong/introduction"],
    ["/blog/kong-gateway-docker-deploy", "/kong/docker-deploy"],
    ["/blog/cloudflare-wrangler-usage-tips", "/cloudflare/wrangler-tips"],
    [
      "/blog/building-an-image-hosting-platform-with-cloudflare-r2",
      "/cloudflare/r2-image-hosting",
    ],
  ] as const;

  for (const [from, to] of redirects) {
    test(`${from} lands on ${to}`, async ({ page }) => {
      await page.goto(from);
      await page.waitForURL(new RegExp(`${to.replace(/\//g, "\\/")}/?$`));
      await expect(page.locator("h1")).toBeVisible();
    });
  }

  test("blog index still resolves", async ({ page }) => {
    await page.goto("/blog");
    await page.waitForURL(/\/$/);
  });
});

test.describe("Feed", () => {
  test("serves an RSS feed with the posts", async ({ request }) => {
    const res = await request.get("/rss.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("<title>Kong Gateway介绍</title>");
    expect(body).toContain("在Docker部署Kong Gateway");
  });
});
