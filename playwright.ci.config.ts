import { defineConfig, devices } from '@playwright/test';
import { testPlanFilter } from 'allure-playwright/testplan';
import path from 'path';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
require('dotenv').config();

// Global timeout values
const DEFAULT_TIMEOUT = 60000; // Higher timeout for CI
const DEFAULT_NAVIGATION_TIMEOUT = 60000; // Higher timeout for CI

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  testIgnore: /(.local.)|(setup.)/,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Timeout for each test */
  timeout: DEFAULT_TIMEOUT,
  /* Expect timeout */
  expect: {
    timeout: DEFAULT_TIMEOUT / 2,
  },
  grep: testPlanFilter(),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['blob'],
    ['allure-playwright'],
    ['html', { open: 'never' }]
  ],
  /* Directory for snapshots and artifacts */
  outputDir: './test-results',
  snapshotDir: './artifacts',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'https://www.youtube.com/',
    
    /* Larger viewport for consistent test results */
    // 1960 instead maybe
    viewport: { width: 1920, height: 1080 },
    
    /* Browser context settings */
    contextOptions: {
      acceptDownloads: true,
      ignoreHTTPSErrors: true,
    },
    
    /* Collect trace for failed tests */
    trace: 'on',
    
    /* Capture screenshot on test failure */
    screenshot: 'only-on-failure',
    
    /* Record video for failed tests */
    video: 'on-first-retry',
    
    /* Set navigation timeout */
    navigationTimeout: DEFAULT_NAVIGATION_TIMEOUT,
    
    /* Additional browser launch options */
    launchOptions: {
      // BrowserType Options to allow for Google account log in
      /*headless: false,
      args: ['--disable-blink-features=AutomationControlled'],*/
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          // BrowserType Options to allow for Google account log in
          headless: true,
          args: ['--disable-blink-features=AutomationControlled'],
        },
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        launchOptions: {
          // BrowserType Options to allow for Google account log in
          headless: true,
          args: ['--disable-blink-features=AutomationControlled'],
        },
      },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

