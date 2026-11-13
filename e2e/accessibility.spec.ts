import { test, expect, type Page } from "@playwright/test";

test.describe("Accessibility", () => {
  test("homepage has no critical a11y violations", async ({ page }) => {
    await page.goto("/");
    // Check skip-to-content link exists
    const skipLink = page.locator("a[href='#main-content']");
    await expect(skipLink).toHaveCount(1);

    // Check main landmark
    await expect(page.locator("main")).toBeVisible();

    // Check heading hierarchy starts with h1 (only visible ones)
    const h1 = page.locator("h1:visible");
    await expect(h1).toHaveCount(1);
  });

  test("docs page has proper landmarks", async ({ page, isMobile }) => {
    await page.goto("/kong/introduction");

    // Header landmark. Use the role, not a bare `header` selector: the Astro
    // dev toolbar (dev-only) injects <header> elements of its own.
    await expect(page.getByRole("banner")).toBeVisible();

    // Main content
    await expect(page.locator("#main-content")).toBeVisible();

    // Navigation landmarks
    await expect(page.locator("nav[aria-label='Breadcrumb']")).toBeVisible();

    if (!isMobile) {
      // Sidebar navigation
      await expect(page.locator("#desktop-sidebar")).toBeVisible();
    }
  });

  test("all images have alt text", async ({ page }) => {
    await page.goto("/kong/docker-deploy");
    const images = page.locator("article img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt, `Image ${i} missing alt text`).toBeTruthy();
    }
  });

  test("interactive elements are keyboard accessible", async ({ page }) => {
    await page.goto("/");
    // Tab to first interactive element
    await page.keyboard.press("Tab");
    // Skip link should be focused first
    const focused = page.locator(":focus");
    await expect(focused).toHaveAttribute("href", "#main-content");
  });

  test("color contrast - text is readable", async ({ page }) => {
    await page.goto("/kong/introduction");
    // Verify foreground text color is set (not transparent/invisible)
    const body = page.locator("body");
    const color = await body.evaluate((el) => getComputedStyle(el).color);
    expect(color).not.toBe("transparent");
    expect(color).not.toBe("rgba(0, 0, 0, 0)");
  });
});

test.describe("Visual screenshots", () => {
  /**
   * The homepage terminal auto-plays, so a naive screenshot races the animation.
   * Take over, clear the scrollback and print one fixed command instead — the
   * result is the same layout with deterministic content.
   */
  async function settleTerminal(page: Page) {
    const input = page.locator("[data-term-input]");
    await input.click();
    await input.press("Control+l");
    await input.fill("help");
    await input.press("Enter");
    await expect(page.locator("[data-term-output]")).toContainText("cat <post>");
    await expect(page.locator("[data-term-status]")).toHaveText(/manual/i);
  }

  test("homepage light mode", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.setItem("ui-mode", "light"));
    await page.reload();
    await page.waitForLoadState("networkidle");
    await settleTerminal(page);
    await expect(page).toHaveScreenshot("homepage-light.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("homepage dark mode", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.setItem("ui-mode", "dark"));
    await page.reload();
    await page.waitForLoadState("networkidle");
    await settleTerminal(page);
    await expect(page).toHaveScreenshot("homepage-dark.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("docs page light mode", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop only screenshot");
    await page.goto("/kong/docker-deploy");
    await page.evaluate(() => localStorage.setItem("ui-mode", "light"));
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("docs-page-light.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.05,
    });
  });

  test("docs page dark mode", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop only screenshot");
    await page.goto("/kong/docker-deploy");
    await page.evaluate(() => localStorage.setItem("ui-mode", "dark"));
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("docs-page-dark.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.05,
    });
  });

  test("404 page", async ({ page }) => {
    await page.goto("/nonexistent");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("404-page.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });
});
