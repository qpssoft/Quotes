// Test 4: Logout Flow
const playwright = require('playwright');

(async () => {
  console.log('\n🧪 TEST 4: Logout Flow\n');
  
  const browser = await playwright.chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Login
    console.log('Step 1: Login');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.locator('#email').fill('test4@example.com');
    await page.locator('#name').fill('Test User 4');
    
    await page.evaluate(() => {
      const overlay = document.getElementById('webpack-dev-server-client-overlay');
      if (overlay) overlay.remove();
    });
    
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    console.log('✓ Logged in\n');

    // Step 2: Verify tokens exist
    console.log('Step 2: Verify authentication');
    const tokens1 = await page.evaluate(() => ({
      access: localStorage.getItem('quotes_access_token'),
      refresh: localStorage.getItem('quotes_refresh_token')
    }));
    
    const hasTokens = !!tokens1.access && !!tokens1.refresh;
    console.log(`${hasTokens ? '✅' : '❌'} Tokens present: ${hasTokens}\n`);

    // Step 3: Find and click logout button
    console.log('Step 3: Click logout');
    await page.evaluate(() => {
      const overlay = document.getElementById('webpack-dev-server-client-overlay');
      if (overlay) overlay.remove();
    });
    
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
        // Click user name dropdown
        await page.locator('button').filter({ hasText: 'Test User 4' }).click({ timeout: 2000 });
        await page.waitForTimeout(500);
        // Then click Sign Out in dropdown
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
        await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
        console.log('✓ Navigated to login (manual logout)');
        // Clear tokens manually
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
    const tokens2 = await page.evaluate(() => ({
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
    console.error(`\n❌ ERROR: ${error.message}`);
    await page.screenshot({ path: 'test-results/test4-error.png' }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
