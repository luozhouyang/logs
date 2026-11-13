import { test, expect } from "@playwright/test";
import { url } from "./helpers";

// English is the default locale at the root; Chinese is mounted at /zh. Both
// render the same layout from the same content ids.
test.describe("Locales", () => {
  test("Chinese post renders in Chinese with a zh-CN document", async ({ page }) => {
    await page.goto(url("/zh/kong/docker-deploy/"));
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(page.locator("h1")).toContainText("在Docker部署Kong Gateway");
    await expect(page.locator("article")).toContainText("Kong官方的文档");
    // Chrome is stock Nimbus (English) — only the content and <html lang>
    // follow the locale.
    await expect(page.locator("nav[aria-label='Breadcrumb']")).toBeVisible();
    await expect(page.locator(".toc-container h2")).toHaveText("On this page");
  });

  test("English post is the default at the root", async ({ page }) => {
    await page.goto(url("/kong/docker-deploy/"));
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toContainText("Deploying Kong Gateway with Docker");
    await expect(page.locator(".toc-container h2")).toHaveText("On this page");
  });

  test("language switcher jumps between translations", async ({ page }) => {
    await page.goto(url("/kong/introduction/"));
    await page.locator("[data-lang-switch='zh']").click();

    await expect(page).toHaveURL(/\/zh\/kong\/introduction\/?$/);
    await expect(page.locator("h1")).toContainText("Kong Gateway介绍");

    await page.locator("[data-lang-switch='en']").click();
    await expect(page).toHaveURL(/\/kong\/introduction\/?$/);
    await expect(page.locator("h1")).toContainText("Kong Gateway introduction");
  });

  test("a post with no translation sends the switcher to the other home", async ({
    page,
  }) => {
    // The e-commerce series is English-only.
    await page.goto(url("/e-commerce/data-model-carts/"));
    await expect(page.locator("[data-lang-switch='zh']")).toHaveAttribute("href", url("/zh/"));
  });

  test("Chinese terminal runs against the Chinese corpus", async ({ page }) => {
    await page.goto(url("/zh/"));
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    // Banner and chrome are Chinese…
    await expect(page.locator("[data-term-output]")).toContainText("交互式终端");

    // …and commands only reach Chinese posts: the e-commerce series has no
    // Chinese counterpart, so `ls` lists two sections and `ls kong` two posts.
    const input = page.locator("[data-term-input]");
    await input.click();
    await input.fill("ls");
    await input.press("Enter");
    const output = page.locator("[data-term-output]");
    await expect(output).toContainText("cloudflare/");
    await expect(output).not.toContainText("e-commerce/");

    await input.fill("ls kong");
    await input.press("Enter");
    await expect(output).toContainText("在Docker部署Kong Gateway");
  });

  test("Chinese markdown alternate is available for agents", async ({ request }) => {
    const res = await request.get(url("/zh/kong/introduction/index.md"));
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain("Kong Gateway介绍");
  });
});
