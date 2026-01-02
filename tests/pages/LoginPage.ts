import { Page, Locator, expect } from '@playwright/test';

/**
 * LoginPage - Page Object Model for OrangeHRM Login
 * 
 * Provides methods to interact with the login page including:
 * - Standard authentication (username/password)
 * - Security testing (SQL injection, XSS prevention)
 * - Password field masking verification
 * - Error handling validation
 * 
 * @class LoginPage
 * @example
 * const loginPage = new LoginPage(page);
 * await loginPage.goto();
 * await loginPage.login('Admin', 'admin123');
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  /**
   * Creates an instance of LoginPage
   * @param {Page} page - Playwright Page object
   */
  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.oxd-alert-content');
  }

  /**
   * Navigates to the login page
   * Uses ORANGEHRM_URL environment variable or defaults to demo site
   * @async
   */
  async goto() {
    const url = process.env.ORANGEHRM_URL || 'https://opensource-demo.orangehrmlive.com/';
    await this.page.goto(url);
  }

  /**
   * Performs login with provided credentials
   * Waits for successful redirect to dashboard after login
   * @async
   * @param {string} username - Username for authentication
   * @param {string} password - Password for authentication
   */
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000);
  }

  /**
   * Attempts login with potentially malicious payloads
   * Used for security testing (SQL injection, XSS)
   * Does NOT wait for navigation - used for negative testing
   * @async
   * @param {string} usernamePayload - Payload to test (e.g., SQL injection string, XSS script)
   * @param {string} password - Password field value
   */
  async attemptLoginWithPayload(usernamePayload: string, password: string) {
    await this.usernameInput.fill(usernamePayload);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Verifies that no SQL error messages are exposed to the user
   * Checks page content for common SQL error indicators
   * Used for SQL injection prevention testing
   * @async
   * @throws {Error} If SQL-related error messages are found in page content
   */
  async verifyNoSqlErrorsExposed() {
    await this.page.waitForLoadState('networkidle'); // Add this line
    const pageContent = await this.page.content();
    expect(pageContent.toLowerCase()).not.toContain('sql');
    expect(pageContent.toLowerCase()).not.toContain('mysql');
    expect(pageContent.toLowerCase()).not.toContain('syntax error');
  }

  /**
   * Verifies that user remains on the login page
   * Used to confirm failed login attempts don't navigate away
   * @async
   * @throws {Error} If username input is not visible (indicating navigation occurred)
   */
  async verifyStillOnLoginPage() {
    const isOnLoginPage = await this.usernameInput.isVisible();
    expect(isOnLoginPage).toBeTruthy();
  }

  /**
   * Clears the username input field
   * @async
   */
  async clearUsernameField() {
    await this.usernameInput.clear();
  }

  /**
   * Gets the type attribute of the password field
   * Used to verify password masking
   * @async
   * @returns {Promise<string | null>} The type attribute value ('password' or 'text')
   */
  async getPasswordFieldType(): Promise<string | null> {
    return await this.passwordInput.getAttribute('type');
  }

  /**
   * Verifies that the password field is properly masked
   * Checks that type attribute is 'password' (not 'text')
   * Used for security testing
   * @async
   * @throws {Error} If password field type is not 'password'
   */
  async verifyPasswordFieldMasked() {
    const fieldType = await this.getPasswordFieldType();
    expect(fieldType).toBe('password');
  }

  /**
   * Verifies that the login form is visible on the page
   * @async
   * @throws {Error} If username input is not visible within 5 seconds
   */
  async verifyLoginFormVisible() {
    await expect(this.usernameInput).toBeVisible({ timeout: 5000 });
  }
}