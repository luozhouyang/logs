import { test, expect } from "@playwright/test";

// The landing page is a single interactive terminal: it plays a scripted tour
// of every section and post, hands control over as soon as you type, and picks
// the tour back up after `data-idle-ms` of inactivity (10s by default).
test.describe("Homepage terminal", () => {
  test("shows a single terminal with the site heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-terminal]")).toBeVisible();
    await expect(page.locator("h1")).toContainText("luozhouyang");
    await expect(page.locator("[data-term-input]")).toBeVisible();
    await expect(page.locator("[data-term-status]")).toHaveText(/auto/i);
  });

  test("auto-plays the tour and lists the sections", async ({ page }) => {
    await page.goto("/");
    const output = page.locator("[data-term-output]");
    await expect(output).toContainText("$ whoami");
    await expect(output).toContainText("$ ls");
    await expect(output).toContainText("cloudflare/");
    await expect(output).toContainText("kong/");
  });

  test("typing takes over and commands run", async ({ page }) => {
    await page.goto("/");
    const input = page.locator("[data-term-input]");

    await input.click();
    await expect(page.locator("[data-term-status]")).toHaveText(/manual/i);

    await input.fill("ls kong");
    await input.press("Enter");
    await expect(page.locator("[data-term-output]")).toContainText(
      "Kong Gateway introduction",
    );

    await input.fill("cat kong/introduction");
    await input.press("Enter");
    await expect(page.locator("[data-term-output]")).toContainText(
      "Kong Gateway is one of the most widely used API Gateways",
    );
  });

  test("unknown commands fail loudly", async ({ page }) => {
    await page.goto("/");
    const input = page.locator("[data-term-input]");
    await input.click();
    await input.fill("sudo rm -rf /");
    await input.press("Enter");
    await expect(page.locator("[data-term-output]")).toContainText("command not found");
  });

  test("the tour resumes after the idle delay", async ({ page }) => {
    await page.goto("/");
    // Shorten the 10s default just for this test.
    await page
      .locator("[data-terminal]")
      .evaluate((element) => element.setAttribute("data-idle-ms", "1200"));

    const input = page.locator("[data-term-input]");
    await input.click();
    await input.fill("help");
    await input.press("Enter");
    await expect(page.locator("[data-term-status]")).toHaveText(/manual/i);

    await expect(page.locator("[data-term-status]")).toHaveText(/auto/i, { timeout: 5000 });
    await expect(page.locator("[data-term-output]")).toContainText("resuming the tour");
  });

  test("keeps a crawlable list of every post", async ({ page }) => {
    await page.goto("/");
    const mirror = page.locator("nav[aria-label='All posts']");
    await expect(mirror.locator("a")).toHaveCount(14);
  });
});
