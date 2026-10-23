import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Load .env.local so SEED_PASSWORD (and the Supabase keys the dev server needs) are present.
dotenv.config({ path: ".env.local", quiet: true });

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "tests/e2e",
  outputDir: "tests/e2e/.output",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 2 : undefined,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1360, height: 900 } },
    },
    {
      name: "phone",
      use: { ...devices["iPhone 14"], browserName: "chromium", viewport: { width: 390, height: 844 } },
    },
  ],
});
