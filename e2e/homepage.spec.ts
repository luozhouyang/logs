import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("renders the hero title and description", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("luozhouyang");
    await expect(page.locator("main p").first()).toBeVisible();
  });

  test("lists every post in the log", async ({ page }) => {
    await page.goto("/");
    const log = page.locator('section[aria-labelledby="latest-heading"] li');
    await expect(log).toHaveCount(14);
    await expect(log.first()).toContainText("Database Design");
  });

  test("displays topic rows with correct links", async ({ page }) => {
    await page.goto("/");
    const topics = page.locator('section[aria-labelledby="topics-heading"]');
    await expect(topics.locator("a")).toHaveCount(3);
    await expect(topics.locator('a[href="/kong/introduction/"]')).toContainText("Kong");
    await expect(
      topics.locator('a[href="/cloudflare/r2-image-hosting/"]'),
    ).toContainText("Cloudflare");
  });

  test("topic rows navigate to a post", async ({ page }) => {
    await page.goto("/");
    await page.locator('section[aria-labelledby="topics-heading"] a[href="/kong/introduction/"]').click();
    await expect(page).toHaveURL(/\/kong\/introduction\/?$/);
    await expect(page.locator("h1")).toContainText("Kong Gateway introduction");
  });

  test("header shows site title and links back home", async ({ page }) => {
    await page.goto("/");
    const headerLink = page.locator("header a[href='/']");
    await expect(headerLink).toBeVisible();
    await expect(headerLink).toContainText("luozhouyang's log");
  });

  test("header has theme toggle and search", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-nb-theme-toggle]")).toBeVisible();
    await expect(page.locator("[data-search-trigger]")).toBeVisible();
  });

  test("header has GitHub link", async ({ page }) => {
    await page.goto("/");
    const ghLink = page.locator("header a[aria-label='GitHub']");
    await expect(ghLink).toBeVisible();
    await expect(ghLink).toHaveAttribute("href", "https://github.com/luozhouyang");
  });
});
