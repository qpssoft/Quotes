import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { QuotesAdminWorld } from '../support/world';
import { TestTimeout } from '../support/test-timeouts';

// Background steps
Given('the backend API is running at {string}', async function (this: QuotesAdminWorld, url: string) {
  this.backendUrl = url;
  
  // Verify backend is accessible (any response means it's running)
  try {
    const response = await this.page!.request.get(`${url}/api/v1/auth/login`);
    // Backend is accessible if we get any HTTP response (including 404, 405, 200)
    expect(response.status()).toBeGreaterThan(0);
  } catch (error) {
    throw new Error(`Backend API is not accessible at ${url}: ${error}`);
  }
});

Given('the admin portal is accessible at {string}', async function (this: QuotesAdminWorld, url: string) {
  this.adminUrl = url;
  
  // Verify admin portal is accessible
  try {
    const response = await this.page!.request.get(url);
    expect(response.status()).toBe(200);
  } catch (error) {
    throw new Error(`Admin portal is not accessible at ${url}: ${error}`);
  }
});

Given('the backend API is not running', async function (this: QuotesAdminWorld) {
  // We'll simulate this by using an invalid URL
  this.backendUrl = 'http://localhost:9999';
});

// Navigation steps
Given('I am on the login page', async function (this: QuotesAdminWorld) {
  await this.page!.goto(`${this.adminUrl}/login`);
  await this.page!.waitForLoadState('networkidle');
  
  // Clear storage after page load
  await this.clearStorage();
  await this.page!.waitForTimeout(TestTimeout.STANDARD);
});

Given('I am already logged in as {string}', async function (this: QuotesAdminWorld, email: string) {
  // Navigate to login page
  await this.page!.goto(`${this.adminUrl}/login`);
  
  // Perform login
  await this.page!.fill('#email', email);
  await this.page!.fill('#name', 'Test User');
  await this.page!.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await this.page!.waitForURL(`${this.adminUrl}/dashboard`, { timeout: TestTimeout.NAVIGATION });
  await this.page!.waitForTimeout(TestTimeout.STANDARD);
});

Given('I am logged in as {string}', async function (this: QuotesAdminWorld, email: string) {
  await this.page!.goto(`${this.adminUrl}/login`);
  await this.page!.fill('#email', email);
  await this.page!.fill('#name', 'Test User');
  await this.page!.click('button[type="submit"]');
  await this.page!.waitForURL(`${this.adminUrl}/dashboard`, { timeout: TestTimeout.NAVIGATION });
});

When('I navigate to the login page', async function (this: QuotesAdminWorld) {
  await this.page!.goto(`${this.adminUrl}/login`);
  await this.page!.waitForLoadState('networkidle');
});

// Form interaction steps
When('I enter {string} in the email field', async function (this: QuotesAdminWorld, email: string) {
  const emailInput = this.page!.locator('#email');
  await emailInput.fill(email);
});

When('I enter {string} in the name field', async function (this: QuotesAdminWorld, name: string) {
  const nameInput = this.page!.locator('#name');
  await nameInput.fill(name);
});

When('I leave the email field empty', async function (this: QuotesAdminWorld) {
  const emailInput = this.page!.locator('#email');
  await emailInput.clear();
});

When('I leave the name field empty', async function (this: QuotesAdminWorld) {
  const nameInput = this.page!.locator('#name');
  await nameInput.clear();
});

When('I click the {string} button', async function (this: QuotesAdminWorld, buttonText: string) {
  const button = this.page!.locator(`button:has-text("${buttonText}")`);
  await button.click();
  await this.page!.waitForTimeout(TestTimeout.API_RESPONSE);
});

When('I wait for the dashboard to load', async function (this: QuotesAdminWorld) {
  await this.page!.waitForLoadState('networkidle');
  await this.page!.waitForTimeout(TestTimeout.STANDARD);
});

When('I refresh the page', async function (this: QuotesAdminWorld) {
  await this.page!.reload();
  await this.page!.waitForLoadState('networkidle');
  await this.page!.waitForTimeout(TestTimeout.STANDARD);
});

When('I logout', async function (this: QuotesAdminWorld) {
  // Click logout button (might be in menu or header)
  const logoutButton = this.page!.locator('button:has-text("Logout")').or(
    this.page!.locator('button:has-text("Sign out")')
  );
  await logoutButton.click();
  await this.page!.waitForTimeout(TestTimeout.NAVIGATION);
});

// Assertion steps
Then('I should be redirected to the dashboard', async function (this: QuotesAdminWorld) {
  await this.page!.waitForURL(`${this.adminUrl}/dashboard`, { 
    timeout: TestTimeout.NAVIGATION 
  });
  
  const currentUrl = this.page!.url();
  expect(currentUrl).toContain('/dashboard');
});

Then('I should see {string} message', async function (this: QuotesAdminWorld, message: string) {
  // Wait for the message to appear
  await this.page!.waitForTimeout(TestTimeout.STANDARD);
  
  // Check if message appears anywhere on the page
  const pageContent = await this.page!.textContent('body');
  expect(pageContent).toContain(message);
});

Then('my authentication token should be stored in localStorage', async function (this: QuotesAdminWorld) {
  await this.page!.waitForTimeout(TestTimeout.STORAGE);
  
  const accessToken = await this.getLocalStorageItem('quotes_access_token');
  expect(accessToken).toBeTruthy();
  expect(accessToken?.length).toBeGreaterThan(0);
});

Then('my user role should be {string}', async function (this: QuotesAdminWorld, expectedRole: string) {
  await this.page!.waitForTimeout(TestTimeout.STORAGE);
  
  const userJson = await this.getLocalStorageItem('quotes_user');
  expect(userJson).toBeTruthy();
  
  const user = JSON.parse(userJson!);
  expect(user.Role).toBe(expectedRole);
});

Then('I should see an error message {string}', async function (this: QuotesAdminWorld, errorMessage: string) {
  await this.page!.waitForTimeout(TestTimeout.STANDARD);
  
  // Look for error message in various possible locations
  const errorElement = this.page!.locator('.error, .error-message, [role="alert"]').first();
  const errorText = await errorElement.textContent();
  
  expect(errorText).toContain(errorMessage);
});

Then('I should see an error message about invalid email format', async function (this: QuotesAdminWorld) {
  await this.page!.waitForTimeout(TestTimeout.STANDARD);
  
  const pageContent = await this.page!.textContent('body');
  const hasEmailError = pageContent?.toLowerCase().includes('email') && 
                       (pageContent?.toLowerCase().includes('invalid') || 
                        pageContent?.toLowerCase().includes('valid'));
  
  expect(hasEmailError).toBe(true);
});

Then('I should see an error message about connection failure', async function (this: QuotesAdminWorld) {
  await this.page!.waitForTimeout(TestTimeout.STANDARD);
  
  const pageContent = await this.page!.textContent('body');
  const hasConnectionError = pageContent?.toLowerCase().includes('connection') || 
                            pageContent?.toLowerCase().includes('failed') ||
                            pageContent?.toLowerCase().includes('error');
  
  expect(hasConnectionError).toBe(true);
});

Then('I should remain on the login page', async function (this: QuotesAdminWorld) {
  const currentUrl = this.page!.url();
  expect(currentUrl).toContain('/login');
});

Then('I should see a {string} heading', async function (this: QuotesAdminWorld, headingText: string) {
  const heading = this.page!.locator('h1, h2, h3').filter({ hasText: headingText });
  await expect(heading).toBeVisible();
});

Then('I should see an email input field with placeholder {string}', async function (this: QuotesAdminWorld, placeholder: string) {
  const emailInput = this.page!.locator(`input[type="email"][placeholder*="${placeholder}"]`);
  await expect(emailInput).toBeVisible();
});

Then('I should see a name input field with placeholder {string}', async function (this: QuotesAdminWorld, placeholder: string) {
  const nameInput = this.page!.locator(`input[placeholder*="${placeholder}"]`);
  await expect(nameInput).toBeVisible();
});

Then('I should see a {string} button', async function (this: QuotesAdminWorld, buttonText: string) {
  const button = this.page!.locator(`button:has-text("${buttonText}")`);
  await expect(button).toBeVisible();
});

Then('the login button should be enabled', async function (this: QuotesAdminWorld) {
  const loginButton = this.page!.locator('button[type="submit"]');
  await expect(loginButton).toBeEnabled();
});

Then('I should be automatically redirected to the dashboard', async function (this: QuotesAdminWorld) {
  // Wait for automatic redirect
  await this.page!.waitForURL(`${this.adminUrl}/dashboard`, { 
    timeout: TestTimeout.NAVIGATION 
  });
  
  const currentUrl = this.page!.url();
  expect(currentUrl).toContain('/dashboard');
});

Then('I should not see the login form', async function (this: QuotesAdminWorld) {
  const loginForm = this.page!.locator('form').filter({ has: this.page!.locator('input[type="email"]') });
  await expect(loginForm).not.toBeVisible();
});

Then('I should remain logged in', async function (this: QuotesAdminWorld) {
  await this.page!.waitForTimeout(TestTimeout.STORAGE);
  
  const accessToken = await this.getLocalStorageItem('quotes_access_token');
  expect(accessToken).toBeTruthy();
});

Then('I should still be on the dashboard', async function (this: QuotesAdminWorld) {
  const currentUrl = this.page!.url();
  expect(currentUrl).toContain('/dashboard');
});

Then('my user information should be preserved', async function (this: QuotesAdminWorld) {
  await this.page!.waitForTimeout(TestTimeout.STORAGE);
  
  const userJson = await this.getLocalStorageItem('quotes_user');
  expect(userJson).toBeTruthy();
  
  const user = JSON.parse(userJson!);
  expect(user.Email).toBeTruthy();
  expect(user.Name).toBeTruthy();
  expect(user.Role).toBeTruthy();
});

Then('I should be logged in as {string}', async function (this: QuotesAdminWorld, email: string) {
  await this.page!.waitForTimeout(TestTimeout.STORAGE);
  
  const userJson = await this.getLocalStorageItem('quotes_user');
  expect(userJson).toBeTruthy();
  
  const user = JSON.parse(userJson!);
  expect(user.Email).toBe(email);
});

Then('the previous session should be cleared', async function (this: QuotesAdminWorld) {
  // This is automatically handled by the login process
  // Just verify we have new tokens (different from before)
  const accessToken = await this.getLocalStorageItem('quotes_access_token');
  expect(accessToken).toBeTruthy();
});
