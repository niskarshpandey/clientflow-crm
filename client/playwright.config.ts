import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120000,
  reporter: 'list',

  use: {
    browserName: 'chromium',
    headless: false,
    viewport: {
      width: 1440,
      height: 900
    },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  }
})
