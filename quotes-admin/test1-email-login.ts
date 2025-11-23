// Test 1: Email Login Flow
// TypeScript version using Playwright
import { chromium, Browser, BrowserContext, Page } from 'playwright';

interface TokenData {
  access: boolean;
  refresh: boolean;
  user: boolean;
}

const CONFIG = {
  adminCenterUrl: 'http://localhost:3000',
  testEmail: 'admin@test.com',
  testName: 'Test Admin',
  timeout: 30000,
  slowMo: 500,
};

async function removeOverlay(page: Page): Promise<void> {
  await page.evaluate(() => {
    const overlay = document.getElementById('webpack-dev-server-client-overlay');
    if (overlay) overlay.remove();
  });
}

async function runTest(): Promise<void> {
  console.log('\n🧪 TEST 1: Email Login Flow\n');
  
  const browser: Browser = await chromium.launch({ headless: false, slowMo: CONFIG.slowMo });
  const context: BrowserContext = await browser.newContext();
  const page: Page = await context.newPage();

  page.on('console', (msg) => console.log('[Browser]', msg.text()));
  page.on('pageerror', (err) => console.error('[Error]', err.message));

  try {
    // Step 1: Navigate to login
    console.log('Step 1: Navigate to login page');
    await page.goto(`${CONFIG.adminCenterUrl}/login`, { 
      waitUntil: 'networkidle', 
      timeout: CONFIG.timeout 
    });
    console.log('✓ Page loaded\n');

    // Step 2: Fill form
    console.log('Step 2: Fill login form');
    await page.locator('#email').fill(CONFIG.testEmail, { timeout: 10000 });
    await page.locator('#name').fill(CONFIG.testName, { timeout: 10000 });
    console.log(`✓ Email: ${CONFIG.testEmail}`);
    console.log(`✓ Name: ${CONFIG.testName}\n`);

    // Step 3: Submit
    console.log('Step 3: Submit login form');
    await removeOverlay(page);
    await page.locator('button[type="submit"]').click({ timeout: 10000 });
    console.log('✓ Form submitted\n');

    // Step 4: Wait for dashboard
    console.log('Step 4: Wait for dashboard redirect');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('✓ Redirected to dashboard\n');

    // Step 5: Verify tokens
    console.log('Step 5: Verify tokens stored');
    const tokens: TokenData = await page.evaluate(() => ({
      access: !!localStorage.getItem('quotes_access_token'),
      refresh: !!localStorage.getItem('quotes_refresh_token'),
      user: !!localStorage.getItem('quotes_user')
    }));

    console.log(`${tokens.access ? '✅' : '❌'} Access Token: ${tokens.access ? 'Present' : 'Missing'}`);
    console.log(`${tokens.refresh ? '✅' : '❌'} Refresh Token: ${tokens.refresh ? 'Present' : 'Missing'}`);
    console.log(`${tokens.user ? '✅' : '❌'} User Data: ${tokens.user ? 'Present' : 'Missing'}\n`);

    // Step 6: Screenshot
    await page.screenshot({ path: 'test-results/test1-success.png' });

    // Result
    if (tokens.access && tokens.refresh && tokens.user) {
      console.log('✅ TEST 1 PASSED\n');
    } else {
      console.log('❌ TEST 1 FAILED\n');
    }

  } catch (error) {
    console.error(`\n❌ ERROR: ${(error as Error).message}`);
    await page.screenshot({ path: 'test-results/test1-error.png' }).catch(() => {});
  } finally {
    await browser.close();
  }
}

// Run test
runTest();
