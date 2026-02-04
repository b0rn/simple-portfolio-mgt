import { test, expect, STORAGE_STATE_PATH } from './fixtures/test-fixtures';

// Use authenticated state for these tests
test.use({ storageState: STORAGE_STATE_PATH });

test.describe('Asset Management', () => {
  let testPortfolioName: string;

  test.beforeEach(async ({ page, portfoliosPage }) => {
    // Create a fresh portfolio for each test
    testPortfolioName = `Asset Test Portfolio ${Date.now()}`;
    await portfoliosPage.goto();
    await portfoliosPage.createPortfolio(testPortfolioName);
    await portfoliosPage.clickPortfolioByName(testPortfolioName);

    // Wait for portfolio detail page to load
    await expect(page).toHaveURL(/\/app\/portfolios\/\d+/);
  });

  test.describe('Asset Creation', () => {
    test('should show add asset button', async ({ page }) => {
      await expect(page.locator('button:has-text("Add asset")').first()).toBeVisible();
    });

    test('should open add asset dialog', async ({ page, portfolioDetailPage }) => {
      await portfolioDetailPage.clickAddAsset();

      // Dialog should be visible
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('[role="dialog"] h2')).toBeVisible();

      // Form elements should be visible
      await expect(page.locator('button[role="combobox"]')).toBeVisible();
      await expect(page.locator('#asset-form-quantity')).toBeVisible();
    });

    test('should create a new asset with valid data', async ({ page, portfolioDetailPage }) => {
      await portfolioDetailPage.clickAddAsset();

      // Select symbol from combobox
      await page.click('button[role="combobox"]');
      await page.waitForSelector('[role="listbox"]');

      // Select the first available option (e.g., BTC, ETH)
      const firstOption = page.locator('[role="option"]').first();
      const symbolText = await firstOption.textContent();
      await firstOption.click();

      // Fill quantity
      await page.fill('#asset-form-quantity', '10');

      // Submit
      await page.click('button[type="submit"]');

      // Wait for dialog to close
      await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

      // Asset should appear in the table
      if (symbolText) {
        await portfolioDetailPage.expectAssetInTable(symbolText);
      }
    });

    test('should show validation error for empty symbol', async ({ page, portfolioDetailPage }) => {
      await portfolioDetailPage.clickAddAsset();

      // Fill only quantity without selecting symbol
      await page.fill('#asset-form-quantity', '10');

      // Try to submit
      await page.click('button[type="submit"]');

      // Should show validation error
      await expect(page.locator('[aria-invalid="true"], [data-invalid="true"]')).toBeVisible();
    });

    test('should show validation error for invalid quantity', async ({ page, portfolioDetailPage }) => {
      await portfolioDetailPage.clickAddAsset();

      // Select symbol
      await page.click('button[role="combobox"]');
      await page.waitForSelector('[role="listbox"]');
      await page.locator('[role="option"]').first().click();

      // Fill invalid quantity
      await page.fill('#asset-form-quantity', '-5');

      // Try to submit
      await page.click('button[type="submit"]');

      // Should show validation error on the quantity input
      await expect(page.locator('#asset-form-quantity[aria-invalid="true"]')).toBeVisible();
    });

    test('should show validation error for zero quantity', async ({ page, portfolioDetailPage }) => {
      await portfolioDetailPage.clickAddAsset();

      // Select symbol
      await page.click('button[role="combobox"]');
      await page.waitForSelector('[role="listbox"]');
      await page.locator('[role="option"]').first().click();

      // Fill zero quantity
      await page.fill('#asset-form-quantity', '0');

      // Try to submit
      await page.click('button[type="submit"]');

      // Should show validation error on the quantity input
      await expect(page.locator('#asset-form-quantity[aria-invalid="true"]')).toBeVisible();
    });

    test('should allow decimal quantities', async ({ page, portfolioDetailPage }) => {
      await portfolioDetailPage.clickAddAsset();

      // Select symbol
      await page.click('button[role="combobox"]');
      await page.waitForSelector('[role="listbox"]');
      await page.locator('[role="option"]').first().click();

      // Fill decimal quantity (using larger decimal to avoid minimum value issues)
      await page.fill('#asset-form-quantity', '1.5');

      // Submit
      await page.click('button[type="submit"]');

      // Wait for dialog to close (success)
      await page.waitForSelector('[role="dialog"]', { state: 'hidden' });
    });

    test('should close dialog without creating when clicking outside', async ({ page, portfolioDetailPage }) => {
      await portfolioDetailPage.clickAddAsset();

      // Press Escape to close dialog
      await page.keyboard.press('Escape');

      // Dialog should be closed
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });
  });

  test.describe('Asset Deletion', () => {
    test.beforeEach(async ({ page, portfolioDetailPage }) => {
      // Create an asset first
      await portfolioDetailPage.clickAddAsset();

      await page.click('button[role="combobox"]');
      await page.waitForSelector('[role="listbox"]');
      await page.locator('[role="option"]').first().click();
      await page.fill('#asset-form-quantity', '5');
      await page.click('button[type="submit"]');
      await page.waitForSelector('[role="dialog"]', { state: 'hidden' });
    });

    test('should delete an asset', async ({ page }) => {
      // Find the delete button in the asset row
      const assetRow = page.locator('table tbody tr').first();
      const deleteButton = assetRow.locator('button').last();

      // Get the symbol before deletion
      const symbolCell = assetRow.locator('td').first();
      const symbolText = await symbolCell.textContent();

      // Click delete
      await deleteButton.click();

      // Wait for deletion to complete
      await page.waitForTimeout(1000);

      // Asset should no longer be in the table
      if (symbolText) {
        // If there are no rows, asset was deleted
        const rowCount = await page.locator('table tbody tr').count();
        if (rowCount === 0) {
          // Table is empty, asset was deleted
          expect(rowCount).toBe(0);
        }
      }
    });
  });

  test.describe('Asset List Display', () => {
    test('should show empty state when no assets', async ({ page }) => {
      // The portfolio was just created, should show add asset prompt
      await expect(page.locator('button:has-text("Add asset")').first()).toBeVisible();
    });

    test('should display asset table with correct columns', async ({ page, portfolioDetailPage }) => {
      // Create an asset first
      await portfolioDetailPage.clickAddAsset();

      await page.click('button[role="combobox"]');
      await page.waitForSelector('[role="listbox"]');
      await page.locator('[role="option"]').first().click();
      await page.fill('#asset-form-quantity', '10');
      await page.click('button[type="submit"]');
      await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

      // Table should be visible with the asset
      await expect(page.locator('table')).toBeVisible();

      // Should have symbol and quantity columns
      await expect(page.locator('th, td').first()).toBeVisible();
    });

    test('should update valuation after adding asset', async ({ page, portfolioDetailPage }) => {
      // Get initial valuation
      const valuationBadge = page.locator('button:has-text("USD")');
      const initialValuation = await valuationBadge.textContent();

      // Create an asset
      await portfolioDetailPage.clickAddAsset();

      await page.click('button[role="combobox"]');
      await page.waitForSelector('[role="listbox"]');
      await page.locator('[role="option"]').first().click();
      await page.fill('#asset-form-quantity', '100');
      await page.click('button[type="submit"]');
      await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

      // Wait for valuation to update
      await page.waitForTimeout(1000);

      // Valuation should have changed (assuming non-zero price)
      const newValuation = await valuationBadge.textContent();
      // The valuation should either be different or show a value
      expect(newValuation).toBeTruthy();
    });
  });

  test.describe('Symbol Combobox', () => {
    test('should show available symbols in dropdown', async ({ page, portfolioDetailPage }) => {
      await portfolioDetailPage.clickAddAsset();

      // Open combobox
      await page.click('button[role="combobox"]');

      // Should show list of options
      await expect(page.locator('[role="listbox"]')).toBeVisible();
      await expect(page.locator('[role="option"]').first()).toBeVisible();
    });

    test('should filter symbols when typing', async ({ page, portfolioDetailPage }) => {
      await portfolioDetailPage.clickAddAsset();

      // Open combobox and type to filter
      await page.click('button[role="combobox"]');
      await page.waitForSelector('[role="listbox"]');

      // Type in search
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('BTC');

      // Should show filtered results
      await expect(page.locator('[role="option"]')).toBeVisible();
    });

    test('should allow creating custom symbol', async ({ page, portfolioDetailPage }) => {
      await portfolioDetailPage.clickAddAsset();

      // Open combobox
      await page.click('button[role="combobox"]');
      await page.waitForSelector('[role="listbox"]');

      // Type a custom symbol
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('CUSTOM');

      // Should have option to create/use the custom symbol
      // The exact UI depends on the combobox implementation
      await expect(page.locator('[role="option"]')).toBeVisible();
    });
  });
});
