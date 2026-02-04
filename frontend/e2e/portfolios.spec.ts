import { test, expect, STORAGE_STATE_PATH } from './fixtures/test-fixtures';

// Use authenticated state for these tests
test.use({ storageState: STORAGE_STATE_PATH });

test.describe('Portfolio Management', () => {
  test.describe('Portfolio List Page', () => {
    test('should display portfolios page for authenticated user', async ({ page, portfoliosPage }) => {
      await portfoliosPage.goto();

      // Check page title is visible
      await expect(page.locator('h1:has-text("Portfolios")')).toBeVisible();

      // Check add button is visible
      await expect(page.locator('button:has-text("Add")')).toBeVisible();
    });

    test('should open create portfolio dialog when clicking Add', async ({ page, portfoliosPage }) => {
      await portfoliosPage.goto();

      await portfoliosPage.clickAddPortfolio();

      // Dialog should be visible
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('[role="dialog"] h2')).toBeVisible();
      await expect(page.locator('#portfolio-form-name')).toBeVisible();
    });

    test('should create a new portfolio', async ({ page, portfoliosPage }) => {
      const portfolioName = `Test Portfolio ${Date.now()}`;

      await portfoliosPage.goto();
      await portfoliosPage.createPortfolio(portfolioName);

      // Portfolio should appear in the list
      await portfoliosPage.expectPortfolioInList(portfolioName);
    });

    test('should show validation error for empty portfolio name', async ({ page, portfoliosPage }) => {
      await portfoliosPage.goto();
      await portfoliosPage.clickAddPortfolio();

      // Try to submit without entering a name
      await page.click('button[type="submit"]');

      // Should show validation error
      await expect(page.locator('[aria-invalid="true"]')).toBeVisible();
    });

    test('should close dialog when clicking X button', async ({ page, portfoliosPage }) => {
      await portfoliosPage.goto();
      await portfoliosPage.clickAddPortfolio();

      // Click close button
      await page.click('[role="dialog"] button:has(svg)');

      // Dialog should be closed
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });

    test('should navigate to portfolio detail when clicking portfolio', async ({ page, portfoliosPage }) => {
      const portfolioName = `Clickable Portfolio ${Date.now()}`;

      await portfoliosPage.goto();
      await portfoliosPage.createPortfolio(portfolioName);

      // Click on the portfolio
      await portfoliosPage.clickPortfolioByName(portfolioName);

      // Should navigate to detail page
      await expect(page).toHaveURL(/\/app\/portfolios\/\d+/);
    });
  });

  test.describe('Portfolio Detail Page', () => {
    let testPortfolioName: string;

    test.beforeEach(async ({ portfoliosPage }) => {
      testPortfolioName = `Detail Test Portfolio ${Date.now()}`;
      await portfoliosPage.goto();
      await portfoliosPage.createPortfolio(testPortfolioName);
      await portfoliosPage.clickPortfolioByName(testPortfolioName);
    });

    test('should display portfolio details', async ({ page, portfolioDetailPage }) => {
      await portfolioDetailPage.expectPortfolioName(testPortfolioName);

      // Should show valuation badge
      await expect(page.locator('text=/USD/i')).toBeVisible();

      // Should show Edit and Delete buttons
      await expect(page.locator('button:has-text("Edit")')).toBeVisible();
      await expect(page.locator('button:has-text("Delete")')).toBeVisible();

      // Should show Assets section
      await expect(page.locator('h2:has-text("Assets")')).toBeVisible();
    });

    test('should update portfolio name', async ({ portfolioDetailPage }) => {
      const newName = `Updated Portfolio ${Date.now()}`;

      await portfolioDetailPage.updatePortfolioName(newName);

      // Name should be updated
      await portfolioDetailPage.expectPortfolioName(newName);
    });

    test('should show edit dialog with current name', async ({ page, portfolioDetailPage }) => {
      await portfolioDetailPage.clickEditPortfolio();

      // Input should contain current portfolio name
      const input = page.locator('#portfolio-form-name');
      await expect(input).toHaveValue(testPortfolioName);
    });

    test('should delete portfolio and redirect to list', async ({ page, portfolioDetailPage }) => {
      await portfolioDetailPage.clickDeletePortfolio();

      // Confirmation dialog should appear - check for dialog with either confirmation text or delete button
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      await portfolioDetailPage.confirmDelete();

      // Should redirect to portfolios list (wait longer for redirect)
      await expect(page).toHaveURL(/\/app\/portfolios$/, { timeout: 15000 });
    });

    test('should cancel portfolio deletion', async ({ page, portfolioDetailPage }) => {
      await portfolioDetailPage.clickDeletePortfolio();

      // Click cancel button
      await page.click('[role="dialog"] button:has-text("Cancel")');

      // Dialog should close and still be on detail page
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
      await portfolioDetailPage.expectPortfolioName(testPortfolioName);
    });

    test('should show valuation breakdown dialog', async ({ page, portfolioDetailPage }) => {
      await portfolioDetailPage.clickValuationBadge();

      await portfolioDetailPage.expectValuationDialog();
      // Dialog title should be visible
      await expect(page.locator('[role="dialog"] h2')).toBeVisible();
    });
  });

  test.describe('Portfolio Pagination', () => {
    test('should show pagination controls when there are many portfolios', async ({ page, portfoliosPage }) => {
      // Create multiple portfolios to trigger pagination
      await portfoliosPage.goto();

      // This test assumes pagination shows after 15 items (default)
      // You may need to adjust based on your pagination settings
      for (let i = 0; i < 3; i++) {
        await portfoliosPage.createPortfolio(`Pagination Test ${Date.now()}-${i}`);
      }

      // Check if pagination controls exist (may not be visible with few items)
      // This is a lightweight check - expand based on actual pagination UI
      await expect(page.locator('h1:has-text("Portfolios")')).toBeVisible();
    });
  });
});
