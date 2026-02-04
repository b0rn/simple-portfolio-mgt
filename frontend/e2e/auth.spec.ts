import { test, expect, generateTestUser, dismissCookieConsent } from './fixtures/test-fixtures';

test.describe('Authentication', () => {
  test.describe('Signup', () => {
    test('should show signup form with all required fields', async ({ page, authPage }) => {
      await authPage.goto('signup');

      // Check form elements are visible
      await expect(page.locator('#signup-form-email')).toBeVisible();
      await expect(page.locator('#signup-form-password')).toBeVisible();
      await expect(page.locator('#signup-form-confirm-password')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should successfully register a new user', async ({ page, authPage }) => {
      const testUser = generateTestUser();
      await authPage.goto('signup');

      await authPage.signup(testUser.email, testUser.password);

      // Should redirect to portfolios page after successful registration
      await expect(page).toHaveURL(/\/app\/portfolios/, { timeout: 10000 });
    });

    test('should show password strength indicator', async ({ page, authPage }) => {
      await authPage.goto('signup');

      // Type a weak password
      await page.fill('#signup-form-password', 'weak');

      // Should show weak password indicator
      await expect(page.locator('text="Weak"')).toBeVisible();

      // Type a strong password
      await page.fill('#signup-form-password', 'VeryStr0ng!P@ssw0rd$123');

      // Should show strong password indicator
      await expect(page.locator('text="Strong"')).toBeVisible();
    });

    test('should show error for mismatched passwords', async ({ page, authPage }) => {
      await authPage.goto('signup');

      await page.fill('#signup-form-email', 'test@example.com');
      await page.fill('#signup-form-password', 'TestPassword123!@#$%');
      await page.fill('#signup-form-confirm-password', 'DifferentPassword123!');

      // Submit button should be disabled or form should show error
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeDisabled();
    });

    test('should show error for password too short', async ({ page, authPage }) => {
      await authPage.goto('signup');

      await page.fill('#signup-form-email', 'test@example.com');
      await page.fill('#signup-form-password', 'short');
      // Blur the password field to trigger validation
      await page.locator('#signup-form-password').blur();

      // Inline validation should show error about password length or "Weak" indicator
      // The validation message appears after blur
      await expect(page.locator('text=/must be between|Weak/i')).toBeVisible();
    });

    test('should show error for duplicate email', async ({ page, authPage }) => {
      // First, create a user
      const testUser = generateTestUser();
      await authPage.goto('signup');
      await authPage.signup(testUser.email, testUser.password);
      await expect(page).toHaveURL(/\/app\/portfolios/, { timeout: 10000 });

      // Logout or clear cookies
      await page.context().clearCookies();

      // Try to register with the same email
      await authPage.goto('signup');
      await authPage.signup(testUser.email, testUser.password);

      // Should show duplicate email error
      await authPage.expectErrorAlert();
    });

    test('should have link to login page', async ({ page, authPage }) => {
      await authPage.goto('signup');

      // Click the login link in the signup form (not the navbar one which may be hidden on mobile)
      await page.click('main a:has-text("Login")');

      await authPage.expectLoginPage();
    });
  });

  test.describe('Login', () => {
    test('should show login form with all required fields', async ({ page, authPage }) => {
      await authPage.goto('login');

      // Check form elements are visible
      await expect(page.locator('#login-form-email')).toBeVisible();
      await expect(page.locator('#login-form-password')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should successfully login an existing user', async ({ page, authPage }) => {
      // First, create a user
      const testUser = generateTestUser();
      await authPage.goto('signup');
      await authPage.signup(testUser.email, testUser.password);
      await expect(page).toHaveURL(/\/app\/portfolios/, { timeout: 10000 });

      // Logout (clear cookies)
      await page.context().clearCookies();

      // Now login
      await authPage.goto('login');
      await authPage.login(testUser.email, testUser.password);

      // Should redirect to portfolios page
      await expect(page).toHaveURL(/\/app\/portfolios/, { timeout: 10000 });
    });

    test('should show error for invalid credentials', async ({ page, authPage }) => {
      await authPage.goto('login');

      await authPage.login('nonexistent@example.com', 'WrongPassword123!');

      // Should show error alert with invalid credentials message
      await expect(page.locator('[role="alert"]:has-text("Invalid credentials"), [role="alert"]:has-text("Login failed")')).toBeVisible();
    });

    test('should show validation error for invalid email format', async ({ page, authPage }) => {
      await authPage.goto('login');

      await page.fill('#login-form-email', 'invalid-email');
      await page.fill('#login-form-password', 'TestPassword123!@#$%');
      await page.click('button[type="submit"]');

      // Should stay on login page (form submission blocked due to validation)
      // Either shows an error alert or stays on login page without redirect
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should have link to signup page', async ({ page, authPage }) => {
      await authPage.goto('login');

      await page.click('a:has-text("Sign up")');

      await authPage.expectSignupPage();
    });

    test('should have link to forgot password', async ({ page, authPage }) => {
      await authPage.goto('login');

      await expect(page.locator('a:has-text("Forgot")')).toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing portfolios without auth', async ({ page }) => {
      await page.goto('/en/app/portfolios');
      await dismissCookieConsent(page);

      // Should redirect to login page
      await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
    });
  });
});
