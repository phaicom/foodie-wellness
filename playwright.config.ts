import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    headless: true,
    launchOptions: {
      ...(process.env.FOODIE_CHROME
        ? { executablePath: process.env.FOODIE_CHROME }
        : {}),
      args: ['--no-sandbox'],
    },
  },
  webServer: {
    command: 'pnpm preview --port 3000',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
})
