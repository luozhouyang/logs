import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("sidebar navigates between pages", async ({ page, isMobile }) => {
    test.skip(isMobile, "Sidebar is hidden on mobile");
    await page.goto("/kong/introduction");
    await page.locator("#desktop-sidebar a", { hasText: "Deploy Kong Gateway with Docker" }).click();
    await expect(page).toHaveURL(/\/kong\/docker-deploy/);
    await expect(page.locator("h1")).toContainText("Deploy Kong Gateway with Docker");
  });

  test("mobile menu opens and closes sidebar", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile menu only on mobile");
    await page.goto("/kong/introduction");

    const menuBtn = page.locator("[data-menu-btn]");
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    const dialog = page.locator("dialog[data-mobile-sidebar]");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Navigation");

    // Close via close button
    await page.locator("[data-close-sidebar]").click();
    await expect(dialog).toBeHidden();
  });

  test("mobile sidebar navigates", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile menu only on mobile");
    await page.goto("/kong/introduction");
    await page.locator("[data-menu-btn]").click();
    await page.locator("dialog a", { hasText: "Deploy Kong Gateway with Docker" }).click();
    await expect(page).toHaveURL(/\/kong\/docker-deploy/);
  });

  test("breadcrumbs link back to section", async ({ page }) => {
    await page.goto("/kong/docker-deploy");
    const breadcrumbLink = page.locator("nav[aria-label='Breadcrumb'] a").first();
    await expect(breadcrumbLink).toBeVisible();
  });

  test("pagination navigates to next page", async ({ page }) => {
    await page.goto("/kong/introduction");
    const nextLink = page.locator("nav[aria-label='Pagination'] a").last();
    if (await nextLink.isVisible()) {
      await nextLink.click();
      await expect(page).toHaveURL(/\/kong\//);
    }
  });

  test("header section tabs appear on docs pages", async ({ page, isMobile }) => {
    test.skip(isMobile, "Section tabs hidden on mobile");
    await page.goto("/kong/introduction");
    const sections = page.locator("nav[aria-label='Sections']");
    // Sections only show when there are 2+ top-level groups
    if (await sections.isVisible()) {
      await expect(sections.locator("a")).toHaveCount(2);
    }
  });
});

test.describe("Theme toggle", () => {
  test("toggles between light and dark mode", async ({ page }) => {
    await page.goto("/");
    const toggle = page.locator("[data-nb-theme-toggle]");
    await expect(toggle).toBeVisible();

    // Get initial mode
    const initialMode = await page.evaluate(() =>
      document.documentElement.getAttribute("data-mode")
    );

    await toggle.click();

    const newMode = await page.evaluate(() =>
      document.documentElement.getAttribute("data-mode")
    );

    expect(newMode).not.toBe(initialMode);
  });

  test("theme persists across navigation", async ({ page }) => {
    await page.goto("/");

    // Force dark mode
    await page.evaluate(() => localStorage.setItem("ui-mode", "dark"));
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");

    // Navigate and verify persistence
    await page.goto("/kong/introduction");
    await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
  });
});

test.describe("404 page", () => {
  test("shows 404 for unknown routes", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    await expect(page.locator("h1")).toContainText("Page not found");
    await expect(page.locator("text=404")).toBeVisible();
  });

  test("404 has link back home", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    const homeLink = page.locator("a[href='/']", { hasText: "Back home" });
    await expect(homeLink).toBeVisible();
    await homeLink.click();
    await expect(page).toHaveURL(/\/$/);
  });
});
