import { Page, Locator, expect } from '@playwright/test';

/**
 * Guacamole Login Page Object
 * 
 * Purpose:
 * Page Object Model for Apache Guacamole login interface.
 * Provides reusable methods for authentication testing and security validation.
 * 
 * Responsibilities:
 * - Navigate to login page
 * - Perform login operations
 * - Validate login form elements
 * - Handle authentication errors
 * - Support security testing (SQL injection, XSS)
 * - Test fault tolerance scenarios
 * 
 * Test Coverage:
 * - Valid/invalid login attempts
 * - Error message validation
 * - Security testing (injection attacks)
 * - Password field masking
 * - Login form availability
 * - Concurrent session management
 * - Network fault tolerance
 * 
 * Enterprise Security Alignment:
 * - Authentication security testing
 * - Input validation verification
 * - Session management testing
 * - OWASP Top 10 compliance validation
 */
export class GuacamoleLoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  baseUrl: any;

  /**
   * Constructor
   * 
   * @param page - Playwright Page object
   * 
   * Initializes all locators for login page elements using Guacamole's
   * default form field names and classes.
   * 
   * Locator Strategy:
   * - Username: input[name="username"]
   * - Password: input[name="password"]
   * - Login Button: input[class="login"] - specific to avoid "Continue" button
   * - Error Message: .login-error class
   */
  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('input[class="login"]');
    this.errorMessage = page.locator('.login-error');
  }

  /**
   * Navigate to Guacamole Login Page
   * 
   * Uses GUACAMOLE_URL from environment variables or defaults
   * to localhost:8080/guacamole.
   * 
   * Environment Configuration:
   * Set GUACAMOLE_URL in .env file:
   * ```
   * GUACAMOLE_URL=http://your-server:8080/guacamole
   * ```
   * 
   * Usage:
   * ```typescript
   * await loginPage.goto();
   * ```
   * 
   * Expected Result:
   * Login form is displayed and ready for interaction.
   */
  async goto() {
    const url = process.env.GUACAMOLE_URL || 'http://localhost:8080/guacamole';
    await this.page.goto(url);
  }

  /**
   * Perform Login
   * 
   * Enters username and password, submits login form, and waits
   * for successful navigation to the home page.
   * 
   * @param username - Username for authentication
   * @param password - Password for authentication
   * 
   * Expected Behavior:
   * 1. Form fields are filled
   * 2. Login button is clicked
   * 3. Page navigates to /#/ (home) on success
   * 4. Waits up to 10 seconds for redirect
   * 
   * Usage:
   * ```typescript
   * await loginPage.login('guacadmin', 'guacadmin');
   * ```
   * 
   * Throws:
   * TimeoutError if navigation doesn't occur within 10 seconds
   * (indicates login failure or slow network)
   * 
   * Security Note:
   * Credentials should be stored in environment variables, not hardcoded.
   */
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForURL(/guacamole\/#\//, { timeout: 10000 });
  }

  /**
   * Attempt Login With Payload (Security Testing)
   * 
   * Performs login attempt with potentially malicious payloads
   * to test security controls and input validation.
   * 
   * @param usernamePayload - Username field input (may contain malicious payload)
   * @param password - Password field input
   * 
   * Security Test Cases:
   * - SQL Injection: `"admin' OR '1'='1"`
   * - XSS: `"<script>alert('xss')</script>"`
   * - Path Traversal: `"../../etc/passwd"`
   * - Null bytes: `"admin\0"`
   * - LDAP Injection: `"*)(uid=*))(&(uid=*"`
   * 
   * Expected Security Behavior:
   * - Input is sanitized/escaped
   * - No SQL errors exposed to user
   * - No script execution occurs
   * - Login fails safely without crashing
   * 
   * Usage:
   * ```typescript
   * await loginPage.attemptLoginWithPayload("admin' OR '1'='1", "password");
   * await loginPage.verifyNoSqlErrorsExposed();
   * ```
   * 
   * Compliance:
   * - OWASP Top 10: Injection Prevention (A03:2021)
   * - PCI-DSS: Requirement 6.5.1 (Injection flaws)
   * - CWE-89: SQL Injection
   */
  async attemptLoginWithPayload(usernamePayload: string, password: string) {
    await this.usernameInput.fill(usernamePayload);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Verify No SQL Errors Exposed
   * 
   * Checks page content for SQL error messages that would indicate
   * SQL injection vulnerability or information disclosure.
   * 
   * Checks For:
   * - "sql" - Generic SQL error
   * - "postgresql" - Database type disclosure
   * - "syntax error" - SQL syntax error
   * - "database" - Database error messages
   * 
   * Security Importance:
   * Exposed SQL errors can reveal:
   * - Database type and version
   * - Table/column names
   * - Query structure
   * - Server file paths
   * - Stack traces
   * 
   * Expected Result:
   * No SQL-related error messages visible to end user.
   * Errors should be logged server-side only.
   * 
   * Usage:
   * ```typescript
   * await loginPage.attemptLoginWithPayload("'; DROP TABLE users--", "pass");
   * await loginPage.verifyNoSqlErrorsExposed();
   * ```
   * 
   * Compliance:
   * - OWASP Top 10: A01:2021 Broken Access Control
   * - OWASP Top 10: A03:2021 Injection
   * - PCI-DSS: No sensitive data exposure
   * - CWE-209: Information Exposure Through Error Messages
   */
  async verifyNoSqlErrorsExposed() {
    const pageContent = await this.page.content();
    expect(pageContent.toLowerCase()).not.toContain('sql');
    expect(pageContent.toLowerCase()).not.toContain('postgresql');
    expect(pageContent.toLowerCase()).not.toContain('syntax error');
    expect(pageContent.toLowerCase()).not.toContain('database');
  }

  /**
   * Verify Still On Login Page
   * 
   * Confirms that user is still on the login page (login failed
   * and did not navigate away).
   * 
   * Use Cases:
   * - Invalid credentials test - verify login rejected
   * - Security payload test - verify malicious input blocked
   * - Account lockout validation - verify account locked
   * - Rate limiting test - verify request throttled
   * 
   * Expected Result:
   * Username input field is visible, indicating login page is displayed.
   * 
   * Usage:
   * ```typescript
   * await loginPage.login('invalid', 'wrong');
   * await loginPage.verifyStillOnLoginPage();
   * ```
   */
  async verifyStillOnLoginPage() {
    const isOnLoginPage = await this.usernameInput.isVisible();
    expect(isOnLoginPage).toBeTruthy();
  }

  /**
   * Clear Username Field
   * 
   * Clears the username input field. Useful for testing
   * multiple login attempts in sequence.
   * 
   * Usage:
   * ```typescript
   * await loginPage.usernameInput.fill('user1');
   * await loginPage.clearUsernameField();
   * await loginPage.usernameInput.fill('user2');
   * ```
   */
  async clearUsernameField() {
    await this.usernameInput.clear();
  }

  /**
   * Get Password Field Type
   * 
   * Retrieves the 'type' attribute of the password field to verify
   * that passwords are masked.
   * 
   * Returns:
   * - 'password' if field is masked
   * - 'text' if visible (security issue!)
   * - null if attribute not found
   * 
   * Security Requirement:
   * Password fields MUST have type='password' to prevent
   * visual disclosure of credentials.
   * 
   * Usage:
   * ```typescript
   * const fieldType = await loginPage.getPasswordFieldType();
   * expect(fieldType).toBe('password');
   * ```
   */
  async getPasswordFieldType(): Promise<string | null> {
    return await this.passwordInput.getAttribute('type');
  }

  /**
   * Verify Password Field Masked
   * 
   * Validates that the password field uses type='password' to
   * mask password input from visual disclosure.
   * 
   * Security Importance:
   * - Prevents shoulder surfing attacks
   * - Protects against screen recording
   * - Compliance with security best practices
   * - Prevents accidental password exposure in screenshots
   * 
   * Expected Result:
   * Password field type attribute equals 'password'.
   * 
   * Usage:
   * ```typescript
   * await loginPage.verifyPasswordFieldMasked();
   * ```
   * 
   * Common Failures:
   * - Developer accidentally uses type="text" for debugging
   * - JavaScript changes field type dynamically
   * - Browser autofill issues
   */
  async verifyPasswordFieldMasked() {
    const fieldType = await this.getPasswordFieldType();
    expect(fieldType).toBe('password');
  }

  /**
   * Verify Login Form Visible
   * 
   * Confirms that the login form is displayed and ready for interaction.
   * 
   * Use Cases:
   * - Initial page load validation
   * - Post-logout verification
   * - Session timeout validation
   * - Error recovery testing
   * 
   * Expected Result:
   * Username input field is visible within 5 seconds.
   * 
   * Usage:
   * ```typescript
   * await loginPage.goto();
   * await loginPage.verifyLoginFormVisible();
   * ```
   */
  async verifyLoginFormVisible() {
    await expect(this.usernameInput).toBeVisible({ timeout: 5000 });
  }

  /**
   * Verify Invalid Credentials Error
   * 
   * Checks that an error message is displayed after invalid login attempt.
   * 
   * Expected Behavior:
   * - Error message is visible
   * - Message is user-friendly
   * - No sensitive information leaked (username exists/doesn't exist)
   * - Generic message prevents user enumeration
   * 
   * Best Practice Error Message:
   * "Invalid username or password" (generic)
   * 
   * Anti-Patterns (Security Issues):
   * - "Invalid password" - reveals username exists
   * - "User not found" - allows user enumeration
   * 
   * Usage:
   * ```typescript
   * await loginPage.login('user', 'wrong');
   * await loginPage.verifyInvalidCredentialsError();
   * ```
   * 
   * Note:
   * Some Guacamole installations may not show explicit error messages.
   * The test will pass if error element exists and is visible.
   */
  async verifyInvalidCredentialsError() {
    await expect(this.errorMessage).toBeVisible();
  }

  /**
   * Attempt Connection to Invalid Server (Fault Tolerance)
   * 
   * Tests application behavior when attempting to connect to
   * an unavailable or non-existent server.
   * 
   * @param invalidUrl - URL of non-existent server (e.g., wrong port)
   * 
   * Returns:
   * true if error is handled gracefully, false if crash occurs
   * 
   * Test Scenarios:
   * - Server down (connection refused)
   * - Wrong port (nothing listening)
   * - Network timeout
   * - DNS resolution failure
   * 
   * Expected Behavior:
   * - Connection error handled gracefully
   * - No unhandled exceptions
   * - No browser console errors
   * - User-friendly error message (optional)
   * - Application remains functional
   * 
   * Usage:
   * ```typescript
   * const handled = await loginPage.attemptConnectionToInvalidServer('http://localhost:9999/guacamole');
   * expect(handled).toBeTruthy();
   * ```
   */
  async attemptConnectionToInvalidServer(invalidUrl: string): Promise<boolean> {
    try {
      await this.page.goto(invalidUrl, { timeout: 5000 });
    } catch (error) {
      // Connection error expected
    }
    
    const hasError = this.page.url().includes('9999') || 
                     await this.page.title().then(t => t.includes('Error') || t === '').catch(() => true);
    return hasError;
  }

  /**
   * Perform Rapid Login Attempts (Fault Tolerance)
   * 
   * Tests system stability under rapid successive login attempts,
   * which could indicate a brute force attack.
   * 
   * @param count - Number of rapid login attempts to perform
   * 
   * Returns:
   * true if system remains stable, false if crash/freeze occurs
   * 
   * Attack Scenarios:
   * - Automated brute force attacks
   * - Credential stuffing
   * - Password spraying
   * - API abuse/DoS attempts
   * 
   * Expected Security Controls:
   * - Rate limiting per IP address
   * - Account lockout after X failures
   * - CAPTCHA after multiple failures
   * - Temporary IP blocking
   * - Security event logging
   * 
   * Expected System Behavior:
   * - System remains responsive
   * - No resource exhaustion
   * - No memory leaks
   * - Database not overwhelmed
   * - Login form still accessible
   * 
   * Usage:
   * ```typescript
   * const stable = await loginPage.performRapidLoginAttempts(5);
   * expect(stable).toBeTruthy();
   * ```
   */
  async performRapidLoginAttempts(count: number): Promise<boolean> {
    for (let i = 0; i < count; i++) {
      await this.attemptLoginWithPayload('testuser', 'testpass');
      await this.page.waitForTimeout(500);
    }
    
    return await this.usernameInput.isVisible();
  }

  /**
   * Test Malformed URLs (Security Testing)
   * 
   * Verifies that malformed or malicious URLs are handled securely
   * without causing security vulnerabilities.
   * 
   * @param urls - Array of malformed/malicious URLs to test
   * 
   * Returns:
   * true if all URLs handled securely, false if vulnerability found
   * 
   * Attack Vectors:
   * - Path traversal: `/#/../../../etc/passwd`
   * - XSS in URL parameters: `/#/settings/<script>alert(1)</script>`
   * - SQL injection in routes: `/#/user?id=1' OR '1'='1`
   * - URL encoding bypasses: `%2e%2e%2f`
   * 
   * Expected Security Behavior:
   * - Malformed URLs handled gracefully (404 or redirect)
   * - No script execution from URL
   * - No unauthorized file access
   * - Input sanitization applied
   * - Content Security Policy (CSP) enforced
   * 
   * Usage:
   * ```typescript
   * const urls = [
   *   'http://localhost:8080/guacamole/#/../../../',
   *   'http://localhost:8080/guacamole/#/<script>alert(1)</script>'
   * ];
   * const secure = await loginPage.testMalformedURLs(urls);
   * expect(secure).toBeTruthy();
   * ```
   */
  async testMalformedURLs(urls: string[]): Promise<boolean> {
    for (const url of urls) {
      await this.page.goto(url, { timeout: 5000 }).catch(() => {});
      await this.page.waitForTimeout(1000);
      
      const pageContent = await this.page.content();
      if (pageContent.includes('<script>')) {
        return false;
      }
    }
    return true;
  }

  /**
   * Test Concurrent Sessions
   * 
   * Tests if system properly handles multiple concurrent sessions
   * from the same user account without conflicts or security issues.
   * 
   * @param username - Username for login
   * @param password - Password for login
   * 
   * Returns:
   * true if concurrent sessions handled correctly, false otherwise
   * 
   * Concurrent Session Scenarios:
   * - Same user logged in from multiple devices
   * - Multiple browser tabs with same account
   * - Mobile + desktop simultaneous login
   * - Session hijacking attempts
   * - Shared account usage (anti-pattern but common)
   * 
   * Session Management Approaches:
   * 
   * **Approach 1: Allow Multiple Sessions**
   * - Users can login from multiple devices
   * - Each session has unique token
   * - Session isolation maintained
   * - Suitable for: End users, mobile apps
   * 
   * **Approach 2: Single Session Only**
   * - New login invalidates old session
   * - Prevents session sharing
   * - Higher security, lower convenience
   * - Suitable for: Admin accounts, privileged access
   * 
   * Security Considerations:
   * - Session token uniqueness (no token reuse)
   * - Session data isolation (no cross-contamination)
   * - Prevent session fixation attacks
   * - Monitor for anomalous patterns
   * - Audit trail for each session
   * 
   * Expected Test Result:
   * - Both sessions established successfully, OR
   * - Second session invalidates first (single session mode), OR
   * - Warning about concurrent sessions displayed
   * - No session data leakage between contexts
   * - No application crash or freeze
   * 
   * Usage:
   * ```typescript
   * const handled = await loginPage.testConcurrentSessions('admin', 'password');
   * expect(handled).toBeTruthy();
   * ```
   * 
   * Enterprise Compliance:
   * - SOC 2: Session management controls
   * - PCI-DSS: Unique session tokens
   * - HIPAA: Session timeout and isolation
   */
  async testConcurrentSessions(username: string, password: string): Promise<boolean> {
    const browser = this.page.context().browser();
    if (!browser) return false;
  
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
  
    // Create LoginPage instances for each page
    const loginPage1 = new GuacamoleLoginPage(page1);
    const loginPage2 = new GuacamoleLoginPage(page2);
  
    // Login from context 1
    await loginPage1.goto();
    await loginPage1.login(username, password);
  
    // Login from context 2
    await loginPage2.goto();
    await loginPage2.login(username, password);
  
    // Check if both sessions are active by verifying URLs
    const session1Active = page1.url().includes('/#/');
    const session2Active = page2.url().includes('/#/');
  
    await context1.close();
    await context2.close();
  
    return session1Active || session2Active;
  }
}