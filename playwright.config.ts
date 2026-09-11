import { defineConfig } from "@playwright/test";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";

const testDirectory = join(tmpdir(), `huettentoene-tests-${randomUUID()}`);

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60000,
  expect: { timeout: 10000 },
  use: { baseURL: "http://127.0.0.1:3100", browserName: "chromium", viewport: { width: 1440, height: 1000 }, trace: "retain-on-failure" },
  reporter: "list",
  webServer: [
    { command: "node .next/standalone/server.js", url: "http://127.0.0.1:3100/api/health", timeout: 60000, reuseExistingServer: false, env: { PORT: "3100", HOSTNAME: "127.0.0.1", DATABASE_PATH: join(testDirectory, "open.sqlite"), TEAM_PASSWORD: "", NEXT_TELEMETRY_DISABLED: "1" } },
    { command: "node .next/standalone/server.js", url: "http://127.0.0.1:3101/api/health", timeout: 60000, reuseExistingServer: false, env: { PORT: "3101", HOSTNAME: "127.0.0.1", DATABASE_PATH: join(testDirectory, "protected.sqlite"), TEAM_PASSWORD: "test-huette-password", NEXT_TELEMETRY_DISABLED: "1" } },
  ],
});
