import { defineConfig, devices } from "@playwright/test";

// Astro's default dev port (4321) is a popular one and may already host
// another local app, in which case the suite would silently test the wrong
// site. Pin a dedicated port so the run always targets this repo.
const PORT = Number(process.env.E2E_PORT ?? 4327);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
  // Test the production build, not the dev server: this is a static site, so
  // `astro preview` serves exactly what Cloudflare will (redirects included)
  // and stays free of the dev toolbar, which injects its own <header>s.
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
