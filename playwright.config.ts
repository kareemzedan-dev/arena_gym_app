import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  fullyParallel: false,
  timeout: 90000,
  expect: { timeout: 10000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:8082",
    actionTimeout: 10000,
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
