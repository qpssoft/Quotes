// Test 2: Token Persistence After Page Reload
const playwright = require('playwright');

(async () => {
  console.log('\n🧪 TEST 2: Token Storage Persistence\n');
  
  const browser = await playwright.chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Login
    console.log('Step 1: Login');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.locator('#email').fill('test2@example.com');
    await page.locator('#name').fill('Test User 2');
    
    await page.evaluate(() => {
      const overlay = document.getElementById('webpack-dev-server-client-overlay');
      if (overlay) overlay.remove();
    });
    
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    console.log('✓ Logged in\n');

    // Step 2: Get tokens
    console.log('Step 2: Check tokens');
    const tokens1 = await page.evaluate(() => ({
      access: localStorage.getItem('quotes_access_token'),
      refresh: localStorage.getItem('quotes_refresh_token'),
      user: localStorage.getItem('quotes_user')
    }));
    
    console.log(`✓ Access Token: ${tokens1.access ? tokens1.access.substring(0, 30) + '...' : 'MISSING'}`);
    console.log(`✓ Refresh Token: ${tokens1.refresh ? tokens1.refresh.substring(0, 20) + '...' : 'MISSING'}`);
    console.log(`✓ User: ${tokens1.user ? 'Present' : 'MISSING'}\n`);

    // Step 3: Reload - use navigation instead of reload
    console.log('Step 3: Refresh page (navigate to dashboard again)');
    const dashboardUrl = page.url();
    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      console.log('⚠️  Network idle timeout (this is okay)');
    });
    console.log('✓ Page refreshed\n');

    // Step 4: Check URL
    console.log('Step 4: Verify still on dashboard');
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    const stillOnDashboard = currentUrl.includes('/dashboard');
    console.log(`${stillOnDashboard ? '✅' : '❌'} Still on dashboard: ${currentUrl}\n`);

    // Step 5: Check tokens again
    console.log('Step 5: Verify tokens persisted');
    const tokens2 = await page.evaluate(() => ({
      access: localStorage.getItem('quotes_access_token'),
      refresh: localStorage.getItem('quotes_refresh_token'),
      user: localStorage.getItem('quotes_user')
    }));
    
    const tokensPresent = !!tokens2.access && !!tokens2.refresh && !!tokens2.user;
    const tokensMatch = tokens1.access === tokens2.access && tokens1.refresh === tokens2.refresh;
    
    console.log(`${tokensPresent ? '✅' : '❌'} Tokens still present: ${tokensPresent}`);
    console.log(`${tokensMatch ? '✅' : '❌'} Tokens match original: ${tokensMatch}\n`);

    // Result
    if (stillOnDashboard && tokensPresent && tokensMatch) {
      console.log('✅ TEST 2 PASSED\n');
      await page.screenshot({ path: 'test-results/test2-success.png' });
    } else {
      console.log('❌ TEST 2 FAILED\n');
      await page.screenshot({ path: 'test-results/test2-failed.png' });
    }

  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`);
    await page.screenshot({ path: 'test-results/test2-error.png' }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
