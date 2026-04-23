import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright 配置 — iM@S Archive 移动端自动化测试
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'Mobile iPhone SE',
      use: {
        ...devices['iPhone SE'],
        viewport: { width: 375, height: 667 },
      },
    },
    {
      name: 'Mobile iPhone 14 Pro',
      use: {
        ...devices['iPhone 14 Pro'],
        viewport: { width: 393, height: 852 },
      },
    },
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npx serve dist -l 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
