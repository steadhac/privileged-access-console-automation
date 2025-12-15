import { test, expect } from '@playwright/test';

/**
 * Login & Authentication Test Suite
 * Tests authentication flows including login, logout, and session management
 */
test.describe('Authentication Tests', () => {
  
  /**
   * TC-AUTH-001: Verify Login with Valid Credentials
   * Priority: Critical
   * Type: E2E
   * 
   * Test Steps:
   * 1. Navigate to login page
   * 2. Enter valid username
   * 3. Enter valid password
   * 4. Click login button
   * 5. Verify successful login and redirect
   * 
   * Expected Results:
   * - User successfully authenticated
   * - Success flash message displayed
   * - Redirected to /secure page
   * - Session cookie created
   */
  test('TC-AUTH-001: Verify Login with Valid Credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('https://the-internet.herokuapp.com/login');
    
    // Enter valid username
    await page.fill('#username', 'tomsmith');
    
    // Enter valid password
    await page.fill('#password', 'SuperSecretPassword!');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Verify success message is visible
    await expect(page.locator('.flash.success')).toBeVisible();
    
    // Verify redirected to secure page
    await expect(page).toHaveURL(/secure/);
    
    // Verify session established
    const cookies = await page.context().cookies();
    expect(cookies.length).toBeGreaterThan(0);
  });

  /**
   * TC-AUTH-002: Verify Login with Invalid Credentials
   * Priority: High
   * Type: E2E
   * 
   * Test Steps:
   * 1. Navigate to login page
   * 2. Enter invalid username/password
   * 3. Click login button
   * 4. Verify error message displayed
   * 5. Verify user remains on login page
   * 
   * Expected Results:
   * - Login fails
   * - Error flash message displayed with "invalid" text
   * - User remains on /login page
   * - No session created
   */
  test('TC-AUTH-002: Verify Login with Invalid Credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('https://the-internet.herokuapp.com/login');
    
    // Enter invalid username
    await page.fill('#username', 'invaliduser');
    
    // Enter invalid password
    await page.fill('#password', 'wrongpassword');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Verify error message is visible
    await expect(page.locator('.flash.error')).toBeVisible();
    
    // Verify error message contains "invalid"
    await expect(page.locator('.flash.error')).toContainText('invalid');
    
    // Verify still on login page
    await expect(page).toHaveURL(/login/);
    
    // Verify no session cookie created
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(cookie => cookie.name === 'session');
    expect(sessionCookie).toBeUndefined();
  });

  /**
   * TC-AUTH-003: Verify Session Timeout
   * Priority: Medium
   * Type: E2E
   * 
   * Test Steps:
   * 1. Login to application
   * 2. Clear cookies to simulate session timeout
   * 3. Attempt to access secure page
   * 4. Verify redirect to login page
   * 
   * Expected Results:
   * - Session expires when cookies cleared
   * - User redirected to login page
   * - Cannot access protected pages without valid session
   */
  test('TC-AUTH-003: Verify Session Timeout', async ({ page, context }) => {
    // Step 1: Login to application
    await page.goto('https://the-internet.herokuapp.com/login');
    await page.fill('#username', 'tomsmith');
    await page.fill('#password', 'SuperSecretPassword!');
    await page.click('button[type="submit"]');
    
    // Verify successful login
    await expect(page).toHaveURL(/secure/);
    
    // Step 2: Clear all cookies to simulate session expiration
    await context.clearCookies();
    
    // Step 3: Try to access the secure page again
    await page.goto('https://the-internet.herokuapp.com/secure');
    
    // Step 4: Verify redirect back to login (session expired)
    await expect(page).toHaveURL(/login/);
  });

  /**
   * TC-AUTH-004: Verify Logout Functionality
   * Priority: High
   * Type: E2E
   * 
   * Test Steps:
   * 1. Login to application
   * 2. Click logout button
   * 3. Verify redirect to login page
   * 4. Verify logout message displayed
   * 5. Attempt to use back button
   * 6. Verify session terminated
   * 
   * Expected Results:
   * - User successfully logged out
   * - Success message: "You logged out" displayed
   * - Redirect to login page
   * - Cannot access protected pages via back button
   * - Session cookie removed
   */
  test('TC-AUTH-004: Verify Logout Functionality', async ({ page }) => {
    // Step 1: Login first
    await page.goto('https://the-internet.herokuapp.com/login');
    await page.fill('#username', 'tomsmith');
    await page.fill('#password', 'SuperSecretPassword!');
    await page.click('button[type="submit"]');
    
    // Verify login successful
    await expect(page).toHaveURL(/secure/);
    
    // Step 2: Click logout button
    await page.click('a[href="/logout"]');
    
    // Step 3: Verify success message
    await expect(page.locator('.flash.success')).toBeVisible();
    await expect(page.locator('.flash.success')).toContainText('logged out');
    
    // Step 4: Verify redirected to login page
    await expect(page).toHaveURL(/login/);
    
    // Step 5: Try to go back
    await page.goBack();
    
    // Step 6: Verify still on login page (session terminated)
    await expect(page).toHaveURL(/login/);
  });

});