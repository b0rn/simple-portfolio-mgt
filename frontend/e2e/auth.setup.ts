import { test as setup, expect } from '@playwright/test';
import { TEST_USER, STORAGE_STATE_PATH, dismissCookieConsent } from './fixtures/test-fixtures';

/**
 * This setup file creates an authenticated user session that can be reused
 * across multiple test files. The storage state (cookies, localStorage) is
 * saved to a file and loaded before each test that depends on 'setup'.
 */
setup('authenticate test user', async ({ page }) => {
  // First, try to register the test user (in case it doesn't exist)
  await page.goto('/en/auth/signup');
  await dismissCookieConsent(page);

  await page.fill('#signup-form-email', TEST_USER.email);
  await page.fill('#signup-form-password', TEST_USER.password);
  await page.fill('#signup-form-confirm-password', TEST_USER.password);
  await page.click('button[type="submit"]');

  // Wait for either:
  // 1. Redirect to portfolios page (successful registration)
  // 2. Error alert (user already exists)
  await Promise.race([
    page.waitForURL(/\/app\/portfolios/, { timeout: 10000 }),
    page.waitForSelector('[role="alert"]', { timeout: 10000 }),
  ]);

  // If we got an error (user exists), try logging in instead
  if (await page.locator('[role="alert"]').isVisible()) {
    await page.goto('/en/auth/login');
    await dismissCookieConsent(page);

    await page.fill('#login-form-email', TEST_USER.email);
    await page.fill('#login-form-password', TEST_USER.password);
    await page.click('button[type="submit"]');

    // Wait for redirect to portfolios
    await page.waitForURL(/\/app\/portfolios/, { timeout: 10000 });
  }

  // Verify we're on the portfolios page
  await expect(page).toHaveURL(/\/app\/portfolios/);

  // Dismiss cookie consent on portfolios page to save the preference in storage state
  await dismissCookieConsent(page);

  // Save the storage state (cookies including JWT and cookie consent preference)
  await page.context().storageState({ path: STORAGE_STATE_PATH });
});
