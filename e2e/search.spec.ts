import { test, expect } from "@playwright/test";
import { url } from "./helpers";

// Search is indexed per language (Pagefind splits indexes by <html lang>), so
// each locale's search finds that locale's posts.
test.describe("Site search", () => {
  async function search(page: import("@playwright/test").Page, path: string, query: string) {
    await page.goto(url(path));
    await page.keyboard.press("Control+k");
    const input = page.locator("[data-search-input]");
    await expect(input).toBeVisible();
    await input.fill(query);
    return page.locator("[data-search-results] a");
  }

  test("finds posts for an English query", async ({ page }) => {
    const results = await search(page, "/", "Kong");
    await expect(results.first()).toBeVisible();
    await expect(results.first()).toHaveAttribute("href", /\/kong\//);
  });

  test("finds Chinese posts from the Chinese site", async ({ page }) => {
    const results = await search(page, "/zh/", "部署");
    await expect(results.first()).toBeVisible();
    await expect(results.first()).toHaveAttribute("href", /\/zh\/kong\/docker-deploy/);
  });

  test("finds a Chinese post by a word that only appears in its body", async ({ page }) => {
    const results = await search(page, "/zh/", "图床");
    await expect(results.first()).toBeVisible();
    await expect(
      page.locator('[data-search-results] a[href*="r2-image-hosting"]').first(),
    ).toBeVisible();
  });

  test("search dialog copy follows the locale", async ({ page }) => {
    await page.goto(url("/zh/"));
    await page.keyboard.press("Control+k");
    await expect(page.locator("[data-search-input]")).toHaveAttribute(
      "placeholder",
      "搜索文章…",
    );
  });
});
