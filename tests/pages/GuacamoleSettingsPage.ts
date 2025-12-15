import { Page, Locator, expect } from '@playwright/test';

/**
 * Guacamole Settings Page Object
 * 
 * Purpose:
 * Page Object Model for Guacamole Settings/Administration interface.
 * Provides reusable methods for interacting with settings pages.
 * 
 * Page Object Model Benefits:
 * - Centralized element locators
 * - Reusable test methods
 * - Easier maintenance
 * - Abstraction from UI implementation
 * 
 * Covered Sections:
 * - Connections management
 * - Users management
 * - Groups management
 * - System settings
 * - LDAP configuration
 */

export class GuacamoleSettingsPage {
  readonly page: Page;
  private baseUrl: string;
  readonly settingsHeading: Locator;
  readonly connectionsTab: Locator;
  readonly usersTab: Locator;
  readonly groupsTab: Locator;

  /**
   * Constructor
   * 
   * @param page - Playwright Page object
   * 
   * Initializes all locators for settings page elements.
   * Uses environment variable for base URL configuration.
   */
  constructor(page: Page) {
    this.page = page;
    this.baseUrl = process.env.GUACAMOLE_URL || 'http://localhost:8080/guacamole';
    this.settingsHeading = page.locator('h1, h2').filter({ hasText: /settings/i });
    this.connectionsTab = page.getByRole('link', { name: 'Connections' });
    this.usersTab = page.getByRole('link', { name: 'Users' });
    this.groupsTab = page.getByRole('link', { name: 'Groups' });
  }

  /**
   * Verify Settings Page Loaded
   * 
   * Validates that the settings page has loaded successfully by checking
   * for the settings heading element.
   * 
   * Usage:
   * await settingsPage.verifySettingsPageLoaded();
   * 
   * Throws:
   * TimeoutError if settings heading not visible within 10 seconds
   */
  async verifySettingsPageLoaded() {
    await expect(this.settingsHeading).toBeVisible({ timeout: 10000 });
    console.log('✓ Settings page loaded');
  }

  /**
   * Navigate to Connections Tab
   * 
   * Navigates directly to Connections settings via URL.
   * 
   * Purpose:
   * Connections tab allows administrators to:
   * - View all configured connections (RDP, VNC, SSH)
   * - Create new connections
   * - Edit existing connections
   * - Delete connections
   * - Organize connections in groups
   * 
   * Usage:
   * await settingsPage.navigateToConnections();
   */
  async navigateToConnections() {
    await this.page.goto(`${this.baseUrl}/#/settings/connections`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Users Tab
   * 
   * Navigates directly to Users settings via URL.
   * 
   * Purpose:
   * Users tab allows administrators to:
   * - View all users (local and LDAP)
   * - Create new users
   * - Modify user permissions
   * - Disable/delete users
   * - Assign users to groups
   * 
   * Usage:
   * await settingsPage.navigateToUsers();
   */
  async navigateToUsers() {
    await this.page.goto(`${this.baseUrl}/#/settings/users`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Groups Tab
   * 
   * Navigates directly to Groups settings via URL.
   * 
   * Purpose:
   * Groups tab enables group-based access control:
   * - Create user groups
   * - Assign permissions to groups
   * - Map LDAP groups to Guacamole groups
   * - Manage group membership
   * 
   * Enterprise Use Case:
   * - "Database Admins" group → Access to DB servers
   * - "Developers" group → Access to dev environments
   * - "Support Team" group → Read-only access
   * 
   * Usage:
   * await settingsPage.navigateToGroups();
   */
  async navigateToGroups() {
    await this.page.goto(`${this.baseUrl}/#/settings/userGroups`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to History
   * 
   * Navigates directly to Connection History via URL.
   * 
   * Purpose:
   * View connection history and audit logs.
   * 
   * Usage:
   * await settingsPage.navigateToHistory();
   */
  async navigateToHistory() {
    await this.page.goto(`${this.baseUrl}/#/settings/postgresql/history`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Active Sessions
   * 
   * Navigates directly to Active Sessions page via URL.
   * 
   * Purpose:
   * Monitor and manage currently active connections.
   * 
   * Usage:
   * await settingsPage.navigateToActiveSessions();
   */
  async navigateToActiveSessions() {
    await this.page.goto(`${this.baseUrl}/#/settings/sessions`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Settings Home
   * 
   * Navigates to the main settings/preferences page.
   * 
   * Usage:
   * await settingsPage.navigateToSettingsHome();
   */
  async navigateToSettingsHome() {
    await this.page.goto(`${this.baseUrl}/#/settings/`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify LDAP Settings Visible
   * 
   * Checks if LDAP configuration options are present on the page.
   * 
   * Detection Method:
   * Searches page content for LDAP-related keywords:
   * - "ldap" - Direct reference to LDAP
   * - "directory" - Directory service reference
   * 
   * Returns:
   * true if LDAP settings are visible, false otherwise
   * 
   * Use Case:
   * Verify that LDAP authentication extension is installed and configured.
   * 
   * Usage:
   * const hasLDAP = await settingsPage.verifyLDAPSettingsVisible();
   * expect(hasLDAP).toBeTruthy();
   */
  async verifyLDAPSettingsVisible(): Promise<boolean> {
    const pageContent = await this.page.content();
    return pageContent.toLowerCase().includes('ldap') || 
           pageContent.toLowerCase().includes('directory');
  }

  /**
   * Verify Authentication Extension Listed
   * 
   * Checks if a specific authentication extension is listed in the
   * settings or configuration pages.
   * 
   * @param extensionName - Name of the extension to look for (e.g., "LDAP", "SAML", "TOTP")
   * 
   * Guacamole Authentication Extensions:
   * - JDBC: Database authentication
   * - LDAP: Directory service authentication
   * - SAML: Single Sign-On
   * - TOTP: Two-factor authentication
   * - Duo: Multi-factor authentication
   * 
   * Returns:
   * true if extension name found in page content, false otherwise
   * 
   * Usage:
   * const hasLDAP = await settingsPage.verifyAuthExtensionListed('LDAP');
   * const hasSAML = await settingsPage.verifyAuthExtensionListed('SAML');
   * 
   * Enterprise Scenario:
   * Check if required authentication methods are properly installed
   * and available for configuration.
   */
  async verifyAuthExtensionListed(extensionName: string): Promise<boolean> {
    const pageContent = await this.page.content();
    return pageContent.toLowerCase().includes(extensionName.toLowerCase());
  }

  /**
   * Verify LDAP Connection Parameters Exist
   * 
   * Checks if LDAP connection configuration fields are present.
   * 
   * Looks for:
   * - Hostname field
   * - Port field
   * 
   * Returns:
   * true if connection parameter fields exist, false otherwise
   * 
   * Usage:
   * const hasParams = await settingsPage.verifyLDAPConnectionParametersExist();
   */
  async verifyLDAPConnectionParametersExist(): Promise<boolean> {
    const hasHostnameField = await this.page.locator('input[name*="hostname"], input[name*="ldap-hostname"]').count() > 0;
    const hasPortField = await this.page.locator('input[name*="port"], input[name*="ldap-port"]').count() > 0;
    return hasHostnameField || hasPortField;
  }

  /**
   * Verify User Base DN Configuration Exists
   * 
   * Checks if User Base DN field for LDAP is present.
   * 
   * User Base DN defines where to search for users in LDAP directory.
   * 
   * Returns:
   * true if User Base DN configuration exists, false otherwise
   * 
   * Usage:
   * const hasBaseDN = await settingsPage.verifyUserBaseDNConfigExists();
   */
  async verifyUserBaseDNConfigExists(): Promise<boolean> {
    const pageContent = await this.page.content();
    return pageContent.includes('user-base-dn') || 
           pageContent.includes('User Base DN') ||
           pageContent.includes('search base');
  }

  /**
   * Verify Group Management Available
   * 
   * Checks if group management interface is accessible.
   * 
   * Returns:
   * true if groups can be managed, false otherwise
   * 
   * Usage:
   * const hasGroups = await settingsPage.verifyGroupManagementAvailable();
   */
  async verifyGroupManagementAvailable(): Promise<boolean> {
    return await this.page.locator('a:has-text("Groups"), button:has-text("Groups")').count() > 0;
  }
}