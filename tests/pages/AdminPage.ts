import { Page, Locator, expect } from '@playwright/test';

/**
 * AdminPage - Page Object Model for OrangeHRM Admin Panel
 * 
 * Provides methods to interact with the Admin section of OrangeHRM including:
 * - User management operations (search, add, edit, delete)
 * - Module navigation (User Management, Job, Organization)
 * - Admin panel access verification
 * 
 * @class AdminPage
 * @example
 * const adminPage = new AdminPage(page);
 * await adminPage.searchUser('Admin');
 * await adminPage.verifySearchResults('Admin');
 */
export class AdminPage {
  readonly page: Page;
  readonly pageHeading: Locator;
  readonly addButton: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly usernameSearchInput: Locator;
  readonly editIcon: Locator;
  readonly deleteIcon: Locator;
  readonly successToast: Locator;

  /**
   * Creates an instance of AdminPage
   * @param {Page} page - Playwright Page object
   */
  constructor(page: Page) {
    this.page = page;
    this.pageHeading = page.locator('h6').first();
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.locator('button.oxd-button--ghost').first();
    this.usernameSearchInput = page.locator('input').nth(1);
    this.editIcon = page.locator('.oxd-icon.bi-pencil-fill');
    this.deleteIcon = page.locator('.oxd-icon.bi-trash');
    this.successToast = page.locator('.oxd-toast-content');
  }

  /**
   * Clicks the Add button to create a new user
   * Waits for network to be idle after click
   * @async
   */
  async clickAdd() {
    await this.addButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Searches for a user by username
   * @async
   * @param {string} username - Username to search for
   * @param {string} userRole - Optional user role filter
   * @param {string} employeeName - Optional employee name filter
   * @param {string} status - Optional status filter
   */
  async searchUser(username: string, userRole: string = '', employeeName: string = '', status: string = '') {
    if (username) {
      await this.usernameSearchInput.fill(username);
    }
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verifies that search results contain the expected username
   * @async
   * @param {string} expectedUsername - Username expected in search results
   * @throws {Error} If username is not found in results
   */
  async verifySearchResults(expectedUsername: string) {
    await expect(this.page.locator('.oxd-table-card').first()).toBeVisible();
    const adminCell = this.page.locator(`.oxd-table-cell:has-text("${expectedUsername}")`);
    await expect(adminCell.first()).toBeVisible();
  }

  /**
   * Verifies that admin panel is accessible and displays required menu items
   * Checks for: User Management, Job, Organization modules
   * @async
   * @throws {Error} If admin panel or required menu items are not visible
   */
  async verifyAdminPanelAccess() {
    await expect(this.page.locator('h6:has-text("Admin")')).toBeVisible();
    
    const menuItems = ['User Management', 'Job', 'Organization'];
    for (const item of menuItems) {
      const menuVisible = await this.page.locator(`text=${item}`).count();
      expect(menuVisible).toBeGreaterThan(0);
    }
  }

  /**
   * Navigates to a specific admin module
   * @async
   * @param {string} moduleName - Name of the module to navigate to (e.g., 'User Management', 'Job')
   */
  async navigateToModule(moduleName: string) {
    await this.page.locator(`a:has-text("${moduleName}")`).first().click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000); // Brief wait for dynamic content
  }

  /**
   * Clicks the Reset button to clear search filters
   * @async
   */
  async clickResetButton() {
    await this.resetButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clicks the edit icon for the first user in the list
   * @async
   */
  async clickEditFirst() {
    await this.editIcon.first().click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clicks the delete icon for the first user in the list
   * @async
   */
  async clickDeleteFirst() {
    await this.deleteIcon.first().click();
  }

  /**
   * Confirms the delete action in the confirmation dialog
   * Clicks "Yes, Delete" button
   * @async
   */
  async confirmDelete() {
    await this.page.getByRole('button', { name: 'Yes, Delete' }).click();
  }
}