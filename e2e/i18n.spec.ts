import { test, expect } from "@playwright/test";

// English is the default locale at the root; Chinese is mounted at /zh. Both
// render the same layout from the same content ids.
test.describe("Locales", () => {
  test("Chinese post renders in Chinese with a zh-CN document", async ({ page }) => {
    await page.goto("/zh/kong/docker-deploy/");
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(page.locator("h1")).toContainText("在Docker部署Kong Gateway");
    await expect(page.locator("article")).toContainText("Kong官方的文档");
    // The chrome is localized too, not just the post body.
    await expect(page.locator("nav[aria-label='面包屑导航']")).toBeVisible();
    await expect(page.locator(".toc-container h2")).toHaveText("本页目录");
  });

  test("English post is the default at the root", async ({ page }) => {
    await page.goto("/kong/docker-deploy/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toContainText("Deploying Kong Gateway with Docker");
    await expect(page.locator(".toc-container h2")).toHaveText("On this page");
  });

  test("language switcher jumps between translations", async ({ page }) => {
    await page.goto("/kong/introduction/");
    await page.locator("[data-lang-switch='zh']").click();

    await expect(page).toHaveURL(/\/zh\/kong\/introduction\/?$/);
    await expect(page.locator("h1")).toContainText("Kong Gateway介绍");

    await page.locator("[data-lang-switch='en']").click();
    await expect(page).toHaveURL(/\/kong\/introduction\/?$/);
    await expect(page.locator("h1")).toContainText("Kong Gateway introduction");
  });

  test("pages announce hreflang alternates", async ({ page }) => {
    await page.goto("/kong/introduction/");
    await expect(
      page.locator("link[rel='alternate'][hreflang='zh-CN']"),
    ).toHaveAttribute("href", /\/zh\/kong\/introduction\/$/);
    await expect(page.locator("link[rel='alternate'][hreflang='x-default']")).toHaveCount(1);
  });

  test("a post with no translation sends the switcher to the other home", async ({
    page,
  }) => {
    // The e-commerce series is English-only.
    await page.goto("/e-commerce/data-model-carts/");
    await expect(page.locator("[data-lang-switch='zh']")).toHaveAttribute("href", "/zh/");
  });

  test("Chinese landing lists only Chinese sections", async ({ page }) => {
    await page.goto("/zh/");
    const cards = page.locator("main a");
    await expect(cards.filter({ hasText: "Kong" })).toHaveAttribute(
      "href",
      "/zh/kong/introduction/",
    );
    await expect(cards.filter({ hasText: "Cloudflare" })).toHaveAttribute(
      "href",
      "/zh/cloudflare/r2-image-hosting/",
    );
    // The English-only e-commerce series has no Chinese counterpart.
    await expect(page.locator("main")).not.toContainText("E Commerce");
  });

  test("Chinese markdown alternate is available for agents", async ({ request }) => {
    const res = await request.get("/zh/kong/introduction/index.md");
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain("Kong Gateway介绍");
  });
});
