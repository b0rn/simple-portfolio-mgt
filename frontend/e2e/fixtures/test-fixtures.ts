import { test as base, expect, Page } from '@playwright/test';

// Test user credentials - use unique emails for test isolation
export const generateTestUser = () => ({
  email: `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
  password: 'TestPassword123!@#$%',
});

// Shared test user for authenticated tests (created in setup)
export const TEST_USER = {
  email: 'e2e-test-user@example.com',
  password: 'TestPassword123!@#$%',
};

// Storage state path for authenticated session
export const STORAGE_STATE_PATH = 'e2e/.auth/user.json';

// Helper to dismiss cookie consent banner if present
export async function dismissCookieConsent(page: Page) {
  try {
    // Wait a bit for the banner to appear
    await page.waitForTimeout(500);
    const acceptButton = page.locator('button:has-text("Accept")');
    if (await acceptButton.isVisible({ timeout: 2000 })) {
      await acceptButton.click();
      // Wait for banner to disappear
      await page.waitForTimeout(300);
    }
  } catch {
    // Cookie consent not visible, continue
  }
}

// Page Object helpers
export class AuthPage {
  constructor(private page: Page) {}

  async goto(type: 'login' | 'signup') {
    await this.page.goto(`/en/auth/${type}`);
    await dismissCookieConsent(this.page);
  }

  async login(email: string, password: string) {
    await this.page.fill('#login-form-email', email);
    await this.page.fill('#login-form-password', password);
    await this.page.click('button[type="submit"]');
  }

  async signup(email: string, password: string) {
    await this.page.fill('#signup-form-email', email);
    await this.page.fill('#signup-form-password', password);
    await this.page.fill('#signup-form-confirm-password', password);
    await this.page.click('button[type="submit"]');
  }

  async expectLoginPage() {
    await expect(this.page).toHaveURL(/\/auth\/login/);
  }

  async expectSignupPage() {
    await expect(this.page).toHaveURL(/\/auth\/signup/);
  }

  async expectErrorAlert(containsText?: string) {
    const alert = this.page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    if (containsText) {
      await expect(alert).toContainText(containsText);
    }
  }
}

export class PortfoliosPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/en/app/portfolios');
    await dismissCookieConsent(this.page);
  }

  async expectPortfoliosPage() {
    await expect(this.page).toHaveURL(/\/app\/portfolios/);
  }

  async clickAddPortfolio() {
    await this.page.click('button:has-text("Add")');
  }

  async createPortfolio(name: string) {
    await this.clickAddPortfolio();
    await this.page.waitForSelector('[role="dialog"]');
    await this.page.fill('#portfolio-form-name', name);
    await this.page.click('button[type="submit"]');
    // Wait for dialog to close and list to update
    await this.page.waitForSelector('[role="dialog"]', { state: 'hidden' });
  }

  async clickPortfolioByName(name: string) {
    // Find the portfolio card containing the name and click the "Assets" link
    // The structure is: div > div > div(name) and div > div > a(Assets link) as siblings
    const portfolioCard = this.page.locator(`div:has(> div > div:text-is("${name}"))`);
    const assetsLink = portfolioCard.locator('a:has-text("Assets")');
    await assetsLink.first().click();
  }

  async expectPortfolioInList(name: string) {
    await expect(this.page.locator(`text="${name}"`)).toBeVisible();
  }

  async expectPortfolioNotInList(name: string) {
    await expect(this.page.locator(`text="${name}"`)).not.toBeVisible();
  }
}

export class PortfolioDetailPage {
  constructor(private page: Page) {}

  async goto(portfolioId: number) {
    await this.page.goto(`/en/app/portfolios/${portfolioId}`);
    await dismissCookieConsent(this.page);
  }

  async expectPortfolioName(name: string) {
    await expect(this.page.locator('h1').first()).toContainText(name);
  }

  async clickEditPortfolio() {
    await this.page.click('button:has-text("Edit")');
    await this.page.waitForSelector('[role="dialog"]');
  }

  async updatePortfolioName(newName: string) {
    await this.clickEditPortfolio();
    await this.page.fill('#portfolio-form-name', newName);
    await this.page.click('button[type="submit"]');
    await this.page.waitForSelector('[role="dialog"]', { state: 'hidden' });
  }

  async clickDeletePortfolio() {
    await this.page.click('button:has-text("Delete")');
    await this.page.waitForSelector('[role="dialog"]');
  }

  async confirmDelete() {
    // Click the destructive delete button in the confirmation dialog
    await this.page.click('[role="dialog"] button:has-text("Delete")');
  }

  async clickAddAsset() {
    await this.page.click('button:has-text("Add asset")');
    await this.page.waitForSelector('[role="dialog"]');
  }

  async createAsset(symbol: string, quantity: string) {
    await this.clickAddAsset();
    // Click the combobox trigger to open it
    await this.page.click('button[role="combobox"]');
    // Type the symbol and select it
    await this.page.fill('input[placeholder*="Search"]', symbol);
    await this.page.click(`[role="option"]:has-text("${symbol}")`);
    // Fill quantity
    await this.page.fill('#asset-form-quantity', quantity);
    await this.page.click('button[type="submit"]');
    await this.page.waitForSelector('[role="dialog"]', { state: 'hidden' });
  }

  async expectAssetInTable(symbol: string) {
    await expect(this.page.locator(`td:has-text("${symbol}")`)).toBeVisible();
  }

  async expectAssetNotInTable(symbol: string) {
    await expect(this.page.locator(`td:has-text("${symbol}")`)).not.toBeVisible();
  }

  async deleteAsset(symbol: string) {
    // Find the row with the symbol and click the delete button
    const row = this.page.locator(`tr:has-text("${symbol}")`);
    await row.locator('button[aria-label*="delete"], button:has(svg)').last().click();
  }

  async clickValuationBadge() {
    await this.page.click('button:has-text("USD")');
    await this.page.waitForSelector('[role="dialog"]');
  }

  async expectValuationDialog() {
    await expect(this.page.locator('[role="dialog"]')).toBeVisible();
  }
}

// Extended test fixture with page objects
export const test = base.extend<{
  authPage: AuthPage;
  portfoliosPage: PortfoliosPage;
  portfolioDetailPage: PortfolioDetailPage;
}>({
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },
  portfoliosPage: async ({ page }, use) => {
    await use(new PortfoliosPage(page));
  },
  portfolioDetailPage: async ({ page }, use) => {
    await use(new PortfolioDetailPage(page));
  },
});

export { expect };
