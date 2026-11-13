import { test, expect } from "@playwright/test";

// The blog mixes Chinese and English posts. These tests exist because that is
// exactly the case search silently breaks in: Pagefind indexes per language,
// so without a single forced index a reader on an English page cannot find a
// Chinese post at all.
test.describe("Site search", () => {
  async function search(page: import("@playwright/test").Page, query: string) {
    await page.goto("/");
    await page.keyboard.press("Control+k");
    const input = page.locator("[data-search-input]");
    await expect(input).toBeVisible();
    await input.fill(query);
    return page.locator("[data-search-results] a");
  }

  test("finds a Chinese post from the English homepage", async ({ page }) => {
    const results = await search(page, "部署");
    await expect(results.first()).toBeVisible();
    await expect(results.first()).toHaveAttribute("href", /kong\/docker-deploy/);
  });

  test("finds posts for an English query", async ({ page }) => {
    const results = await search(page, "Kong");
    await expect(results.first()).toBeVisible();
    await expect(results.first()).toHaveAttribute("href", /kong\//);
  });

  test("finds a post by a Chinese word that only appears in its body", async ({
    page,
  }) => {
    const results = await search(page, "图床");
    await expect(results.first()).toBeVisible();
    // Pagefind emits the page hit plus in-page heading hits, so match the
    // first link that points at the post rather than expecting a single one.
    await expect(
      page.locator('[data-search-results] a[href*="r2-image-hosting"]').first(),
    ).toBeVisible();
  });
});
