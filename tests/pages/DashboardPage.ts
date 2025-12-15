import { Page, Locator, expect } from '@playwright/test';

/**
 * DashboardPage - Page Object Model for OrangeHRM Dashboard
 * 
 * Provides methods to interact with the main dashboard including:
 * - Navigation to different modules (Admin, PIM, Leave, Directory, Recruitment)
 * - User profile dropdown interactions
 * - Access control verification (RBAC testing)
 * - Session management (logout)
 * 
 * @class DashboardPage
 * @example
 * const dashboardPage = new DashboardPage(page);
 * await dashboardPage.navigateToAdmin();
 * await dashboardPage.verifyUserDropdownOptions();
 */
export class DashboardPage {
  readonly page: Page;
  readonly dashboardHeading: Locator;
  readonly adminMenu: Locator;
  readonly pimMenu: Locator;
  readonly leaveMenu: Locator;
  readonly directoryMenu: Locator;
  readonly recruitmentMenu: Locator;
  readonly userDropdown: Locator;
  readonly dashboardMenu: any;

  /**
   * Creates an instance of DashboardPage
   * @param {Page} page - Playwright Page object
   */
  constructor(page: Page) {
    this.page = page;
    this.dashboardHeading = page.locator('h6').first();
    this.dashboardMenu = page.locator('a.oxd-main-menu-item').filter({ hasText: 'Dashboard' });
    this.adminMenu = page.getByRole('link', { name: 'Admin' });
    this.pimMenu = page.getByRole('link', { name: 'PIM' });
    this.leaveMenu = page.getByRole('link', { name: 'Leave' });
    this.directoryMenu = page.getByRole('link', { name: 'Directory' });
    this.recruitmentMenu = page.getByRole('link', { name: 'Recruitment' });
    this.userDropdown = page.locator('.oxd-userdropdown-tab');
  }

  /**
   * Navigates to the Admin module
   * Waits for URL to contain 'admin' pattern
   * @async
   * @throws {Error} If navigation times out after 10 seconds
   */
  async navigateToAdmin() {
    await this.adminMenu.click();
    await this.page.waitForURL(/admin/, { timeout: 10000 });
  }

  /**
   * Navigates to the PIM (Personnel Information Management) module
   * Waits for URL to contain 'pim' pattern
   * @async
   * @throws {Error} If navigation times out after 10 seconds
   */
  async navigateToPIM() {
    await this.pimMenu.click();
    await this.page.waitForURL(/pim/, { timeout: 10000 });
  }

  /**
   * Navigates to the Directory module
   * Waits for URL to contain 'directory' pattern
   * @async
   * @throws {Error} If navigation times out after 10 seconds
   */
  async navigateToDirectory() {
    await this.directoryMenu.click();
    await this.page.waitForURL(/directory/, { timeout: 10000 });
  }

  /**
   * Clicks the user dropdown menu in the header
   * @async
   */
  async clickUserDropdown() {
    await this.userDropdown.click();
  }

  /**
   * Verifies that all expected user dropdown options are visible
   * Checks for: About, Support, Change Password, Logout
   * @async
   * @throws {Error} If any expected option is not visible
   */
  async verifyUserDropdownOptions() {
    await this.clickUserDropdown();
    await this.page.waitForTimeout(500);
    
    const dropdownOptions = ['About', 'Support', 'Change Password', 'Logout'];
    for (const option of dropdownOptions) {
      const optionVisible = await this.page.locator(`a:has-text("${option}")`).isVisible();
      expect(optionVisible).toBeTruthy();
      console.log(`✓ ${option} option available`);
    }
  }

  /**
   * Clicks the About option in the user dropdown
   * Waits 1 second for modal to appear
   * @async
   */
  async clickAboutOption() {
    await this.page.locator('a:has-text("About")').click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Verifies that the About modal dialog is visible
   * @async
   * @throws {Error} If modal is not visible
   */
  async verifyAboutModalVisible() {
    const modal = this.page.locator('.oxd-dialog-sheet');
    await expect(modal).toBeVisible();
  }

  /**
   * Closes the About modal dialog
   * @async
   */
  async closeAboutModal() {
    await this.page.locator('.oxd-dialog-close-button').click();
  }
  
  /**
   * Navigates back to the Dashboard from any module
   * @async
   */
  async navigateToDashboard() {
    await this.dashboardMenu.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verifies that admin access is denied for non-admin users
   * Attempts to access System Users page and confirms content is not visible
   * Used for RBAC (Role-Based Access Control) testing
   * @async
   * @throws {Error} If admin content is visible (access not properly restricted)
   */
  async verifyAdminAccessDenied() {
    await this.page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/admin/viewSystemUsers');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  
    // Check if System Users table/content is NOT visible (access denied)
    const hasSystemUsersHeader = await this.page.locator('h6:has-text("System Users")').isVisible().catch(() => false);
    const hasAddButton = await this.page.locator('button:has-text("Add")').isVisible().catch(() => false);
    const hasUserTable = await this.page.locator('.oxd-table').isVisible().catch(() => false);
  
    // If admin content is NOT visible, access is denied
    if (!hasSystemUsersHeader && !hasAddButton && !hasUserTable) {
      console.log('✓ ESS user correctly denied access - admin content not visible');
      return;
    }
  
    throw new Error('ESS user should not have access to Admin pages');
  }

  /**
   * Logs out the current user
   * Opens user dropdown and clicks Logout option
   * @async
   */
  async logout() {
    await this.clickUserDropdown();
    await this.page.locator('a:has-text("Logout")').click();
    await this.page.waitForLoadState('networkidle');
  }
  
  /**
   * Navigates to the Recruitment module
   * @async
   */
  async navigateToRecruitment() {
    await this.page.locator('a.oxd-main-menu-item').filter({ hasText: 'Recruitment' }).click();
    await this.page.waitForLoadState('networkidle');
  }
  
  /**
   * Verifies that the menu contains a minimum number of items
   * Used to validate role-based menu visibility
   * @async
   * @param {number} minimumCount - Minimum expected menu items (default: 5)
   * @throws {Error} If menu item count is less than expected
   */
  async verifyMenuItemCount(minimumCount: number = 5) {
    const menuItems = await this.page.locator('nav .oxd-main-menu-item').count();
    expect(menuItems).toBeGreaterThan(minimumCount);
    console.log(`✓ Total visible menu items: ${menuItems} (expected > ${minimumCount})`);
  }
}