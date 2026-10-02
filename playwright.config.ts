import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}/`,
    trace: 'retain-on-failure',
  },
  projects: [
    // The legacy app is characterized in one engine: the fixtures it exports are the contract.
    { name: 'legacy', testDir: 'e2e/legacy', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium', testDir: 'e2e/app', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testDir: 'e2e/app', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testDir: 'e2e/app', use: { ...devices['Desktop Safari'] } },
    // Only with `npm run visual` (human-review gallery, never blocking).
    ...(process.env.VISUAL ? [{ name: 'visual', testDir: 'e2e/visual', use: { ...devices['Desktop Chrome'] } }] : []),
  ],
  webServer: {
    command: `node scripts/serve.mjs ${PORT}`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env.CI,
  },
});
