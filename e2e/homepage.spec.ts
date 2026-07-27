import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("renders title and description", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("luozhouyang's log");
    await expect(page.locator("main p").first()).toBeVisible();
  });

  test("displays topic cards with correct links", async ({ page }) => {
    await page.goto("/");
    const kongCard = page.locator('a[href="/kong/introduction"]');
    const cfCard = page.locator('a[href="/cloudflare/r2-image-hosting"]');

    await expect(kongCard).toBeVisible();
    await expect(kongCard).toContainText("Kong Gateway");
    await expect(cfCard).toBeVisible();
    await expect(cfCard).toContainText("Cloudflare");
  });

  test("topic cards navigate correctly", async ({ page }) => {
    await page.goto("/");
    await page.locator('a[href="/kong/introduction"]').click();
    await expect(page).toHaveURL(/\/kong\/introduction/);
    await expect(page.locator("h1")).toContainText("Kong Gateway Introduction");
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
