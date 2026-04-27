import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  globalSetup: "./tests/e2e/global-setup",
  webServer: [
    {
      command:
        'bash -lc "JWT_SECRET=${JWT_SECRET:-playwright-secret} PORT=${PORT:-4000} pnpm --filter backend dev"',
      url: "http://localhost:4000/api-docs",
      reuseExistingServer: true,
    },
    {
      command: "pnpm --filter frontend dev --port 5173",
      url: "http://localhost:5173",
      reuseExistingServer: true,
    },
  ],
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
