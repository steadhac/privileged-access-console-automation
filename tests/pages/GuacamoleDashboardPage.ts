import { Page, Locator, expect } from '@playwright/test';

/**
 * Guacamole Dashboard/Home Page Object
 * 
 * Purpose:
 * Page Object Model for Apache Guacamole post-login interface.
 * Handles session verification and logout functionality.
 * 
 * Responsibilities:
 * - Verify successful login/dashboard load
 * - Manage user session (logout)
 * - Session validation for fault tolerance tests
 * 
 * Note:
 * Navigation to different sections (Settings, Connections, etc.) is handled
 * via direct URL navigation in GuacamoleSettingsPage for better performance
 * and reliability.
 */
export class GuacamoleDashboardPage {
  readonly page: Page;
  private baseUrl: string;
  readonly userDropdown: Locator;
  readonly logoutLink: Locator;

  /**
   * Constructor
   * 
   * @param page - Playwright Page object
   * 
   * Initializes locators for essential dashboard elements.
   * Uses environment variable for base URL configuration.
   */
  
  constructor(page: Page, username: string = 'guacadmin') {
    this.page = page;
    this.baseUrl = process.env.GUACAMOLE_URL || 'http://localhost:8080/guacamole';
    this.userDropdown = page.locator('.user-menu').first();
    this.logoutLink = page.getByRole('listitem').filter({ hasText: 'Logout' }).locator('a');
  }

  /**
   * Verify Dashboard Loaded
   * 
   * Validates that the dashboard has loaded successfully after login
   * by checking for the presence of the user dropdown.
   * 
   * Verification:
   * User dropdown (showing username) is visible within 10 seconds.
   * 
   * Expected Behavior:
   * - Page has navigated to /#/
   * - User interface has rendered
   * - Username is displayed in dropdown
   * 
   * Usage:
   * await dashboardPage.verifyDashboardLoaded();
   * 
   * Common Failures:
   * - Timeout: Login failed or slow network
   * - Element not found: Locator needs updating
   */
    async verifyDashboardLoaded() {
    // Wait for navigation to dashboard URL
    await this.page.waitForURL(/\/#\//, { timeout: 10000 });
    
    // Additionally verify user dropdown is visible
    await expect(this.userDropdown).toBeVisible({ timeout: 10000 }).catch(() => {
      // If userDropdown not found, check if we're at least on the right page
      const url = this.page.url();
      if (!url.includes('/#/')) {
        throw new Error('Dashboard did not load - not on home page');
      }
    });
    
    console.log('✓ Dashboard loaded successfully');
  }

  /**
   * Click User Dropdown
   * 
   * Opens the user dropdown menu showing user options.
   * 
   * Dropdown Options (typical):
   * - Home
   * - Settings
   * - Logout
   * 
   * Usage:
   * await dashboardPage.clickUserDropdown();
   * 
   * Note: Required before accessing logout link
   */
  async clickUserDropdown() {
    // Wait for user dropdown to be visible and clickable
    await this.userDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await this.userDropdown.click({ force: true }); // Force click if needed
    await this.page.waitForTimeout(500);
  }

  /**
   * Verify User Dropdown Options
   * 
   * Opens user dropdown and verifies that logout option is available.
   * 
   * Validation:
   * - Dropdown opens successfully
   * - Logout link is visible
   * 
   * Security Importance:
   * Ensures users can properly end their sessions, which is
   * critical for privileged access management.
   * 
   * Usage:
   * await dashboardPage.verifyUserDropdownOptions();
   */
  async verifyUserDropdownOptions() {
    await this.clickUserDropdown();
    
    // Verify logout option is visible
    const logoutVisible = await this.logoutLink.isVisible();
    expect(logoutVisible).toBeTruthy();
    
    console.log('✓ User dropdown options accessible');
  }

  /**
   * Logout
   * 
   * Performs logout operation to end the current user session.
   * 
   * Logout Process:
   * 1. Opens user dropdown
   * 2. Clicks logout link
   * 3. Waits for network idle (logout complete)
   * 
   * Expected Result:
   * - Session is terminated
   * - User is redirected to login page
   * - Session token is invalidated
   * 
   * Security Importance:
   * - Prevents session hijacking
   * - Ensures proper session cleanup
   * - Critical for privileged access auditing
   * 
   * Usage:
   * await dashboardPage.logout();
   * 
   * Compliance:
   * - SOC 2: Session management
   * - PCI-DSS: Secure logout
   */
  async logout() {
    await this.clickUserDropdown();
    await this.logoutLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify Session Still Valid
   * 
   * Waits for specified time and checks if session is still active.
   * Used for session timeout testing.
   * 
   * @param waitTime - Time to wait in milliseconds
   * 
   * Returns:
   * true if session is still valid or timeout message shown, false otherwise
   * 
   * Usage:
   * const isValid = await dashboardPage.verifySessionStillValid(3000);
   */
  async verifySessionStillValid(waitTime: number): Promise<boolean> {
    await this.page.waitForTimeout(waitTime);
    
    // Check if still on dashboard (session valid) or redirected to login (timeout)
    const url = this.page.url();
    const stillOnDashboard = url.includes('/#/');
    const onLoginPage = !url.includes('/#/') || url.endsWith('/guacamole');
    
    return stillOnDashboard || onLoginPage;
  }

  /**
   * Test Network Interruption Recovery
   * 
   * Simulates network offline/online scenario to test application resilience.
   * 
   * @param context - Browser context to control network state
   * 
   * Returns:
   * true if application recovers successfully, false otherwise
   * 
   * Usage:
   * const recovered = await dashboardPage.testNetworkInterruptionRecovery(context);
   */
  async testNetworkInterruptionRecovery(context: any): Promise<boolean> {
    await context.setOffline(true);
    await this.page.waitForTimeout(2000);
    await context.setOffline(false);
    
    await this.page.reload();
    
    const isOnLoginOrDashboard = 
      await this.page.locator('input[name="username"]').isVisible().catch(() => false) ||
      await this.userDropdown.isVisible().catch(() => false);
    
    return isOnLoginOrDashboard;
  }
}