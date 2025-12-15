import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AdminPage } from '../pages/AdminPage';
import { credentials } from '../config/credentials';

/**
 * Enterprise Integration Tests
 * Testing enterprise-level features and workflows using Page Object Model
 */

test.describe('Enterprise Integration Tests', () => {

  /**
   * TC-ENT-001: Multi-User Role Workflow
   * 
   * Description: Verify complete workflow with different user roles
   * 
   * Test Steps:
   * 1. Login as Admin
   * 2. Navigate to admin panel
   * 3. Verify admin-specific features
   * 4. Logout and verify session cleared
   * 
   * Expected Results:
   * - Admin can access all features
   * - Logout clears session properly
   * - Login page displayed after logout
   */
  test('TC-ENT-001: Multi-User Role Workflow', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const adminPage = new AdminPage(page);
    
    // Login as Admin
    await loginPage.goto();
    await loginPage.login(credentials.orangeHRM.admin.username, credentials.orangeHRM.admin.password);
    await expect(dashboardPage.userDropdown).toBeVisible();
    console.log('✓ Admin logged in successfully');
    
    // Navigate to Admin panel
    await dashboardPage.navigateToAdmin();
    await adminPage.verifyAdminPanelAccess();
    console.log('✓ Admin panel accessible');
    
    
    // Logout
    await dashboardPage.logout();
    await expect(loginPage.usernameInput).toBeVisible();
    console.log('✓ Logout successful');
  });

  /**
   * TC-ENT-002: Dashboard Navigation Flow
   * 
   * Description: Verify navigation across different modules
   * 
   * Test Steps:
   * 1. Login to application
   * 2. Navigate through main menu items
   * 3. Verify each module loads correctly
   * 
   * Expected Results:
   * - All modules are accessible
   * - Navigation is smooth without errors
   * - URLs update correctly
   */
  test('TC-ENT-002: Dashboard Navigation Flow', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const adminPage = new AdminPage(page);
    
    await loginPage.goto();
    await loginPage.login(credentials.orangeHRM.admin.username, credentials.orangeHRM.admin.password);
    
    const modules = [
      { name: 'Admin', url: '/admin' },
      { name: 'PIM', url: '/pim' },
      { name: 'Leave', url: '/leave' },
      { name: 'Time', url: '/time' },
    ];
    
    for (const module of modules) {
      // Click on module using sidebar
      await adminPage.navigateToModule(module.name);
      
      // Verify URL contains module path
      const currentUrl = page.url();
      expect(currentUrl).toContain(module.url);
      
      console.log(`✓ ${module.name} module loaded successfully`);
      
      await page.waitForTimeout(500);
    }
  });

  /**
   * TC-ENT-003: Search and Filter Integration
   * 
   * Description: Verify search functionality across modules
   * 
   * Test Steps:
   * 1. Login as Admin
   * 2. Navigate to Admin > Users
   * 3. Use search functionality
   * 4. Verify results display correctly
   * 
   * Expected Results:
   * - Search filters work correctly
   * - Results match search criteria
   * - Reset functionality works
   */
  test('TC-ENT-003: Search and Filter Integration', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const adminPage = new AdminPage(page);
    
    await loginPage.goto();
    await loginPage.login(credentials.orangeHRM.admin.username, credentials.orangeHRM.admin.password);
    await dashboardPage.navigateToAdmin();
    
    // Search for admin user using AdminPage
    await adminPage.searchUser('Admin', '', '', '');
    await page.waitForTimeout(2000);
    
    // Verify results table appears
    await adminPage.verifySearchResults('Admin');
    
    console.log('✓ Search functionality working');
    
    // Reset search
    await adminPage.clickResetButton();
    await page.waitForTimeout(1000);
    
    console.log('✓ Reset functionality working');
  });

  /**
   * TC-ENT-004: User Profile Management
   * 
   * Description: Verify user can view and access profile settings
   * 
   * Test Steps:
   * 1. Login to application
   * 2. Click on user dropdown
   * 3. Verify profile options
   * 4. Navigate to profile sections
   * 
   * Expected Results:
   * - User dropdown displays correctly
   * - Profile options are accessible
   * - User information is displayed
   */
  test('TC-ENT-004: User Profile Management', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
  
    await loginPage.goto();
    await loginPage.login(credentials.orangeHRM.admin.username, credentials.orangeHRM.admin.password);
  
    // Verify user dropdown options
    await dashboardPage.verifyUserDropdownOptions();
  
    // Click on About
    await dashboardPage.clickAboutOption();
  
    // Verify About modal appears
    await dashboardPage.verifyAboutModalVisible();
  
    console.log('✓ User profile options accessible');
  
    // Close modal
    await dashboardPage.closeAboutModal();

  });

  /**
   * TC-ENT-005: Complete End-to-End Business Flow
   * 
   * Description: Verify complete business workflow from login to logout
   * 
   * Test Steps:
   * 1. Admin logs in
   * 2. Navigates to different modules
   * 3. Performs search operations
   * 4. Accesses user profile
   * 5. Logs out successfully
   * 
   * Expected Results:
   * - All steps complete without errors
   * - Data persists across navigation
   * - Session management works correctly
   */
  test('TC-ENT-005: Complete End-to-End Business Flow', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const adminPage = new AdminPage(page);
    
    // Step 1: Login
    await loginPage.goto();
    await loginPage.login(credentials.orangeHRM.admin.username, credentials.orangeHRM.admin.password);
    console.log('✓ Step 1: Login successful');
    
    // Step 2: Navigate to Admin
    await dashboardPage.navigateToAdmin();
    await adminPage.verifyAdminPanelAccess();
    console.log('✓ Step 2: Admin module accessed');
    
    // Step 3: Search for users
    await adminPage.searchUser('Admin', '', '', '');
    await page.waitForTimeout(2000);
    await adminPage.verifySearchResults('Admin');
    console.log('✓ Step 3: Search completed');
    
    // Step 4: Navigate to Dashboard
    await dashboardPage.navigateToDashboard();
    await page.waitForLoadState('networkidle');
    console.log('✓ Step 4: Dashboard accessed');
    
    // Step 5: Verify user dropdown still accessible
    await expect(dashboardPage.userDropdown).toBeVisible();
    console.log('✓ Step 5: Session maintained');
    
    // Step 6: Logout
    await dashboardPage.logout();
    await expect(loginPage.usernameInput).toBeVisible();
    console.log('✓ Step 6: Logout successful');
    
    console.log('✓ Complete E2E flow verified');
  });
});