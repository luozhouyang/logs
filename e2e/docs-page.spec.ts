import { test, expect } from "@playwright/test";

test.describe("Docs pages", () => {
  test("renders doc page with title, description, and content", async ({ page }) => {
    await page.goto("/kong/introduction");
    await expect(page.locator("h1")).toContainText("Kong Gateway介绍");
    await expect(page.locator("article.docs-content")).toBeVisible();
    await expect(page.locator("article")).toContainText("云原生的API Gateway");
  });

  test("shows breadcrumbs", async ({ page }) => {
    await page.goto("/kong/docker-deploy");
    const breadcrumbs = page.locator("nav[aria-label='Breadcrumb']");
    await expect(breadcrumbs).toBeVisible();
    await expect(breadcrumbs).toContainText("Kong");
  });

  test("shows sidebar with navigation groups", async ({ page, isMobile }) => {
    test.skip(isMobile, "Sidebar is hidden on mobile");
    await page.goto("/kong/introduction");
    const sidebar = page.locator("#desktop-sidebar");
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toContainText("Kong Gateway介绍");
    await expect(sidebar).toContainText("在Docker部署Kong Gateway");
  });

  test("sidebar highlights active page", async ({ page, isMobile }) => {
    test.skip(isMobile, "Sidebar is hidden on mobile");
    await page.goto("/kong/introduction");
    const activeLink = page.locator("#desktop-sidebar a[aria-current='page']");
    await expect(activeLink).toBeVisible();
    await expect(activeLink).toContainText("Kong Gateway介绍");
  });

  test("shows table of contents on desktop", async ({ page, isMobile }) => {
    test.skip(isMobile, "TOC aside is hidden on mobile");
    await page.goto("/kong/docker-deploy");
    const toc = page.locator("[data-nb-toc-scroll-host]");
    await expect(toc).toBeVisible();
    await expect(toc).toContainText("On this page");
  });

  test("shows pagination links", async ({ page }) => {
    await page.goto("/kong/introduction");
    const pagination = page.locator("nav[aria-label='Pagination']");
    await expect(pagination).toBeVisible();
  });

  test("code blocks render with copy button on hover", async ({ page }) => {
    await page.goto("/kong/docker-deploy");
    const codeBlock = page.locator(".nb-code-figure").first();
    await expect(codeBlock).toBeVisible();
    await codeBlock.hover();
    const copyBtn = codeBlock.locator(".nb-code-copy");
    await expect(copyBtn).toBeVisible();
  });

  test("images render correctly", async ({ page }) => {
    await page.goto("/kong/docker-deploy");
    const img = page.locator("article img").first();
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute("src", /\/images\//);
  });

  test("shows the authored publication date", async ({ page }) => {
    await page.goto("/kong/introduction");
    const actions = page.locator("[data-nb-page-actions]");
    await expect(actions).toContainText("Published");
    await expect(actions.locator("time").first()).toHaveAttribute(
      "datetime",
      /^2025-07-29/,
    );
  });

  test("page actions show markdown link", async ({ page }) => {
    await page.goto("/kong/introduction");
    const actions = page.locator("[data-nb-page-actions]");
    await expect(actions).toBeVisible();
  });

  test("headings have anchor links on hover", async ({ page }) => {
    await page.goto("/kong/docker-deploy");
    const heading = page.locator("article h2").first();
    await heading.hover();
    const anchor = heading.locator(".heading-anchor");
    await expect(anchor).toBeVisible();
  });
});
