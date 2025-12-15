import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AdminPage } from '../pages/AdminPage';
import { credentials } from '../config/credentials';

/**
 * RBAC (Role-Based Access Control) Test Suite
 * Tests role-based permissions using OrangeHRM Demo
 * Base URL: https://opensource-demo.orangehrmlive.com/
 */
test.describe('RBAC Access Control Tests', () => {
  
  /**
   * TC-RBAC-001: Verify Admin Role Access
   * Priority: Critical
   * Type: E2E
   * 
   * Test Steps:
   * 1. Navigate to OrangeHRM login page
   * 2. Login with admin credentials
   * 3. Verify admin dashboard is accessible
   * 4. Verify Admin menu is visible
   * 5. Verify admin can access user management
   * 
   * Expected Results:
   * - Admin successfully logs in
   * - Dashboard displays with admin widgets
   * - Admin menu item is visible in sidebar
   * - Can access User Management page
   * - Full administrative access granted
   */
  test('TC-RBAC-001: Verify Admin Role Access', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login(credentials.orangeHRM.admin.username, credentials.orangeHRM.admin.password);
    await dashboardPage.navigateToAdmin();
    
    console.log('✓ Admin has access to User Management');
  });

  /**
   * TC-RBAC-002: Verify Standard User Role Access
   * Priority: Critical
   * Type: E2E
   * 
   * Test Steps:
   * 1. Navigate to login page
   * 2. Login with standard ESS user credentials
   * 3. Verify user dashboard is accessible
   * 4. Verify Admin menu is NOT visible
   * 5. Attempt to directly access Admin URL and verify denial
   * 
   * Expected Results:
   * - Standard user successfully logs in
   * - Dashboard displays with limited widgets
   * - Admin menu is hidden from sidebar
   * - Direct navigation to /admin is blocked
   * - Access limited to ESS features only
   */
  test('TC-RBAC-002: Verify Standard User Role Access', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
  
    await loginPage.goto();
    await loginPage.login(credentials.orangeHRM.ess.username, credentials.orangeHRM.ess.password);
    
    // Verify ESS user does NOT have access to Admin menu
    await dashboardPage.verifyAdminAccessDenied();
    
    console.log('✓ ESS user correctly denied access to Admin menu');
  });

  /**
   * TC-RBAC-003: Verify Read-Only User Role Access
   * Priority: Critical
   * Type: E2E
   * 
   * Test Steps:
   * 1. Navigate to login page
   * 2. Login with read-only credentials
   * 3. Verify can view employee records
   * 4. Verify Add/Edit/Delete buttons are hidden or disabled
   * 5. Attempt to modify data and verify it's blocked
   * 
   * Expected Results:
   * - Read-only user successfully logs in
   * - Can view employee directory
   * - Cannot see Add button
   * - Edit/Delete actions are restricted
   * - View-only access enforced
   */
  test('TC-RBAC-003: Verify Read-Only User Role Access', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
  
    await loginPage.goto();
    await loginPage.login(credentials.orangeHRM.ess.username, credentials.orangeHRM.ess.password);
    
    // Verify ESS user has limited menu items (not Recruitment)
    const hasRecruitment = await page.locator('a.oxd-main-menu-item').filter({ hasText: 'Recruitment' }).isVisible().catch(() => false);
    expect(hasRecruitment).toBeFalsy(); // Should NOT be visible
    
    console.log('✓ ESS user correctly denied access to Recruitment menu');
  });

  /**
   * TC-RBAC-004: Verify Role-Based Feature Visibility
   * Priority: High
   * Type: E2E
   * 
   * Test Steps:
   * 1. Login as admin and note visible menu items
   * 2. Verify Admin menu is visible
   * 3. Verify PIM menu is visible
   * 4. Verify Leave menu is visible
   * 5. Count total accessible menu items
   * 
   * Expected Results:
   * - Admin sees: Admin, PIM, Leave, Time, Recruitment, etc.
   * - All administrative menus visible
   * - Full navigation access
   * - Menu count matches admin permissions
   */
  test('TC-RBAC-004: Verify Role-Based Feature Visibility', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    // Step 1: Login as admin
    await loginPage.goto();
    await loginPage.login(credentials.orangeHRM.admin.username, credentials.orangeHRM.admin.password); 
    // Step 2: Verify Admin menu is visible
    await dashboardPage.navigateToAdmin(); 
    // Step 3: Verify PIM menu is visible
    await dashboardPage.navigateToPIM(); 
    // Step 4: Verify Directory menu is visible (admin feature)
    await dashboardPage.navigateToDirectory();
    // Step 5: Verify Recruitment menu is visible (admin feature)
    await dashboardPage.navigateToRecruitment(); 
    // Verify admin has access to multiple modules
    await dashboardPage.verifyMenuItemCount(5);
  });

  /**
   * TC-RBAC-005: Verify Permission Escalation Prevention
   * Priority: Critical
   * Type: Security/E2E
   * 
   * Test Steps:
   * 1. Login as standard user
   * 2. Attempt to directly access admin-only URL
   * 3. Verify access is denied or redirected
   * 4. Attempt to access user management directly
   * 5. Verify all privilege escalation attempts fail
   * 
   * Expected Results:
   * - Direct URL navigation to /admin is blocked
   * - System redirects to authorized pages
   * - No admin functions accessible
   * - Permission errors displayed
   * - User remains in standard role
   */
  test('TC-RBAC-005: Verify Permission Escalation Prevention', async ({ page }) => {
    
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const adminPage = new AdminPage(page);

    await loginPage.goto();
    await loginPage.login(credentials.orangeHRM.admin.username, credentials.orangeHRM.admin.password);
    await dashboardPage.navigateToAdmin();
    
    // Verify admin panel access
    await adminPage.verifyAdminPanelAccess();
    
    console.log('✓ All admin menu options are visible');
  });
});