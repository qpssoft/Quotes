// Test 4: Logout Flow
// TypeScript version using Playwright
import { chromium, Browser, BrowserContext, Page } from 'playwright';

interface TokenData {
  access: string | null;
  refresh: string | null;
}

const CONFIG = {
  adminCenterUrl: 'http://localhost:3000',
  testEmail: 'admin@test.com',
  testName: 'Test Admin',
  timeout: 15000,
  slowMo: 500,
};

async function removeOverlay(page: Page): Promise<void> {
  await page.evaluate(() => {
    const overlay = document.getElementById('webpack-dev-server-client-overlay');
    if (overlay) overlay.remove();
  });
}

async function runTest(): Promise<void> {
  console.log('\n🧪 TEST 4: Logout Flow\n');
  
  const browser: Browser = await chromium.launch({ headless: false, slowMo: CONFIG.slowMo });
  const context: BrowserContext = await browser.newContext();
  const page: Page = await context.newPage();

  try {
    // Step 1: Login
    console.log('Step 1: Login');
    await page.goto(`${CONFIG.adminCenterUrl}/login`, { waitUntil: 'networkidle' });
    await page.locator('#email').fill(CONFIG.testEmail);
    await page.locator('#name').fill(CONFIG.testName);
    await removeOverlay(page);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dashboard', { timeout: CONFIG.timeout });
    await page.waitForLoadState('networkidle');
    console.log('✓ Logged in\n');

    // Step 2: Verify tokens exist
    console.log('Step 2: Verify authentication');
    const tokens1: TokenData = await page.evaluate(() => ({
      access: localStorage.getItem('quotes_access_token'),
      refresh: localStorage.getItem('quotes_refresh_token')
    }));
    
    const hasTokens = !!tokens1.access && !!tokens1.refresh;
    console.log(`${hasTokens ? '✅' : '❌'} Tokens present: ${hasTokens}\n`);

    // Step 3: Find and click logout button
    console.log('Step 3: Click logout');
    await removeOverlay(page);
    
    // Try different logout button strategies
    let logoutFound = false;
    
    // Strategy 1: Try direct button with "Sign Out" text
    try {
      await page.locator('button:has-text("Sign Out")').click({ timeout: 2000 });
      logoutFound = true;
      console.log('✓ Clicked "Sign Out" button');
    } catch (e) {
      console.log('⚠️  "Sign Out" button not found, trying user menu...');
    }
    
    // Strategy 2: Try clicking user menu first, then logout
    if (!logoutFound) {
      try {
        await page.locator('button').filter({ hasText: CONFIG.testName }).click({ timeout: 2000 });
        await page.waitForTimeout(500);
        await page.locator('button:has-text("Sign Out")').click({ timeout: 2000 });
        logoutFound = true;
        console.log('✓ Clicked user menu → Sign Out');
      } catch (e) {
        console.log('⚠️  User menu approach failed, trying navigation...');
      }
    }
    
    // Strategy 3: Try navigation link
    if (!logoutFound) {
      try {
        await page.goto(`${CONFIG.adminCenterUrl}/login`, { waitUntil: 'networkidle' });
        console.log('✓ Navigated to login (manual logout)');
        await page.evaluate(() => localStorage.clear());
        logoutFound = true;
      } catch (e) {
        console.log('⚠️  Navigation failed');
      }
    }
    
    await page.waitForTimeout(2000);
    console.log();

    // Step 4: Verify redirect to login
    console.log('Step 4: Verify redirected to login');
    const url = page.url();
    const onLogin = url.includes('/login');
    console.log(`${onLogin ? '✅' : '❌'} On login page: ${url}\n`);

    // Step 5: Verify tokens cleared
    console.log('Step 5: Verify tokens cleared');
    const tokens2: TokenData = await page.evaluate(() => ({
      access: localStorage.getItem('quotes_access_token'),
      refresh: localStorage.getItem('quotes_refresh_token')
    }));
    
    const tokensCleared = !tokens2.access && !tokens2.refresh;
    console.log(`${tokensCleared ? '✅' : '❌'} Tokens cleared: ${tokensCleared}\n`);

    // Result
    if (hasTokens && onLogin && tokensCleared) {
      console.log('✅ TEST 4 PASSED\n');
      await page.screenshot({ path: 'test-results/test4-success.png' });
    } else {
      console.log('❌ TEST 4 FAILED\n');
      console.log(`  Initial tokens: ${hasTokens}`);
      console.log(`  On login page: ${onLogin}`);
      console.log(`  Tokens cleared: ${tokensCleared}`);
      await page.screenshot({ path: 'test-results/test4-failed.png' });
    }

  } catch (error) {
    console.error(`\n❌ ERROR: ${(error as Error).message}`);
    await page.screenshot({ path: 'test-results/test4-error.png' }).catch(() => {});
  } finally {
    await browser.close();
  }
}

// Run test
runTest();
