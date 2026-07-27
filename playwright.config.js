// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4000',
    headless: true,
    screenshot: 'only-on-failure',
  },
  // Start the Express server before tests, stop after
  webServer: {
    command: 'node server.js',
    url: 'http://localhost:4000',
    reuseExistingServer: false,
    env: { PORT: '4000', NODE_ENV: 'test' },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
