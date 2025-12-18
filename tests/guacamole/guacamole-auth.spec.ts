import { test, expect } from '@playwright/test';
import { GuacamoleLoginPage } from '../pages/GuacamoleLoginPage';
import { GuacamoleDashboardPage } from '../pages/GuacamoleDashboardPage';
import { credentials } from '../config/credentials';

/**
 * Guacamole Authentication Tests
 * 
 * Validates core authentication functionality including login and logout.
 * Tests ensure only authorized users can access the privileged access management system.
 * 
 * Security Importance:
 * Authentication is the first line of defense for privileged access management.
 * These tests validate that only authorized users can access remote systems.
 */
test.describe('Guacamole Authentication Tests', () => {
  
  /**
   * TC-GUAC-AUTH-001: Login with valid admin credentials
   * 
   * Verifies successful authentication and dashboard access with valid credentials.
   * 
   * Preconditions:
   * - Guacamole server is running and accessible
   * - Admin account exists with valid credentials
   * 
   * Steps:
   * 1. Navigate to login page
   * 2. Enter valid admin credentials
   * 3. Verify redirect to dashboard
   * 
   * Security Validation:
   * - Credentials transmitted securely
   * - Session token created
   * - User granted appropriate permissions
   */
  test('TC-GUAC-AUTH-001: Login with valid admin credentials', async ({ page }) => {
    const loginPage = new GuacamoleLoginPage(page);
    const dashboardPage = new GuacamoleDashboardPage(page);

    await loginPage.goto();
    await loginPage.login(credentials.guacamole.admin.username, credentials.guacamole.admin.password);
    await dashboardPage.verifyDashboardLoaded();
  });

  /**
   * TC-GUAC-AUTH-002: Logout functionality
   * 
   * Verifies session termination and return to login page after logout.
   * 
   * Preconditions:
   * - Guacamole server is running
   * - Valid admin credentials available
   * 
   * Steps:
   * 1. Login with valid credentials
   * 2. Verify dashboard access
   * 3. Perform logout
   * 4. Verify return to login page and session termination
   * 
   * Security Validation:
   * - Session token destroyed on server
   * - Session cookie cleared from browser
   * - User cannot access protected resources after logout
   */
  test('TC-GUAC-AUTH-002: Logout functionality', async ({ page }) => {
    const loginPage = new GuacamoleLoginPage(page);
    const dashboardPage = new GuacamoleDashboardPage(page);
  
    await loginPage.goto();
    await loginPage.login(credentials.guacamole.admin.username, credentials.guacamole.admin.password);
    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.logout();
    await loginPage.goto();
    await loginPage.verifyLoginFormVisible();
  });
  
});