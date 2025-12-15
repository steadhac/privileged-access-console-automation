import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { credentials } from '../config/credentials';

/**
 * Security Tests
 * Testing security features and vulnerabilities using Page Object Model
 */

test.describe('Security Tests', () => {

  /**
   * TC-SEC-001: SQL Injection Prevention
   * 
   * Description: Verify that the application prevents SQL injection attacks
   * 
   * Test Steps:
   * 1. Attempt login with SQL injection payloads in username field
   * 2. Verify application rejects malicious input
   * 3. Confirm no database errors are exposed
   * 
   * Expected Results:
   * - Login fails with invalid credentials message
   * - No database error messages shown
   * - Application remains stable
   */
  test('TC-SEC-001: SQL Injection Prevention', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Common SQL injection payloads
    const sqlInjectionPayloads = [
      "' OR '1'='1",
      "admin'--",
      "' OR 1=1--",
      "admin' OR '1'='1' /*",
    ];

    for (const payload of sqlInjectionPayloads) {
      await loginPage.attemptLoginWithPayload(payload, 'password');
      
      // Verify no SQL errors exposed
      await loginPage.verifyNoSqlErrorsExposed();
      
      // Verify login failed properly
      await loginPage.verifyStillOnLoginPage();
      
      console.log(`✓ SQL Injection prevented for payload: ${payload}`);
    }
  });

  /**
   * TC-SEC-002: XSS Prevention
   * 
   * Description: Verify that the application prevents Cross-Site Scripting (XSS) attacks
   * 
   * Test Steps:
   * 1. Attempt to inject JavaScript code in input fields
   * 2. Verify script tags are sanitized or escaped
   * 3. Confirm no scripts execute
   * 
   * Expected Results:
   * - XSS payloads are sanitized/escaped
   * - No script execution occurs
   * - Alert boxes do not appear
   */
  test('TC-SEC-002: XSS Prevention', async ({ page }) => {
    const loginPage = new LoginPage(page);
    let alertTriggered = false;
    
    // Listen for alert dialogs
    page.on('dialog', async dialog => {
      alertTriggered = true;
      console.log('⚠️  Alert triggered:', dialog.message());
      await dialog.accept();
    });

    await loginPage.goto();

    // Common XSS payloads
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      '<svg/onload=alert("XSS")>',
      'javascript:alert("XSS")',
    ];

    for (const payload of xssPayloads) {
      alertTriggered = false;
      
      await loginPage.attemptLoginWithPayload(payload, 'password');
      
      await page.waitForTimeout(500);
      
      // Verify no alert was triggered (main XSS check)
      expect(alertTriggered).toBeFalsy();
      
      console.log(`✓ XSS prevented for payload: ${payload.substring(0, 30)}...`);
      
      // Clear field
      await loginPage.clearUsernameField();
    }
    
    // Final verification - no scripts executed
    expect(alertTriggered).toBeFalsy();
    console.log('✓ All XSS payloads blocked successfully');
  });

  /**
   * TC-SEC-003: Session Timeout Validation
   * 
   * Description: Verify that user sessions expire after inactivity
   * 
   * Test Steps:
   * 1. Login to application
   * 2. Wait for session timeout period
   * 3. Attempt to access protected page
   * 
   * Expected Results:
   * - Session expires after timeout
   * - User is redirected to login page
   * - Protected resources are inaccessible
   */
  test('TC-SEC-003: Session Timeout Validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    // Login first
    await loginPage.goto();
    await loginPage.login(credentials.orangeHRM.admin.username, credentials.orangeHRM.admin.password);
    
    // Verify logged in
    await expect(dashboardPage.userDropdown).toBeVisible();
    console.log('✓ User logged in successfully');
    
    // Clear cookies to simulate session expiry
    await page.context().clearCookies();
    console.log('✓ Session cookies cleared');
    
    // Try to access admin page without session
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/admin/viewSystemUsers');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Should be redirected to login - check URL contains login
    const currentUrl = page.url();
    expect(currentUrl).toContain('auth/login');
    
    // Verify login form is visible
    await loginPage.verifyLoginFormVisible();
    
    console.log('✓ Session expiry redirects to login page');
  });

  /**
   * TC-SEC-004: Password Field Masking
   * 
   * Description: Verify password fields properly mask input
   * 
   * Test Steps:
   * 1. Navigate to login page
   * 2. Enter password
   * 3. Verify password is masked
   * 
   * Expected Results:
   * - Password field has type="password"
   * - Input is not visible in plain text
   */
  test('TC-SEC-004: Password Field Masking', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    // Verify field type is password
    await loginPage.verifyPasswordFieldMasked();
    
    // Enter password
    await loginPage.passwordInput.fill('TestPassword123');
    
    // Verify type remains password (not changed to text)
    const fieldTypeAfter = await loginPage.getPasswordFieldType();
    expect(fieldTypeAfter).toBe('password');
    
    console.log('✓ Password field properly masked');
  });
});