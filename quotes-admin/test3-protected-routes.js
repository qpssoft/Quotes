// Test 3: Protected Route Access Control
const playwright = require('playwright');

(async () => {
  console.log('\n🧪 TEST 3: Protected Route Access\n');
  
  const browser = await playwright.chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Try to access dashboard without login
    console.log('Step 1: Access dashboard without authentication');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);
    
    const url1 = page.url();
    const redirected = url1.includes('/login');
    console.log(`${redirected ? '✅' : '❌'} Redirected to login: ${url1}\n`);

    // Step 2: Login
    console.log('Step 2: Login');
    await page.locator('#email').fill('test3@example.com');
    await page.locator('#name').fill('Test User 3');
    
    await page.evaluate(() => {
      const overlay = document.getElementById('webpack-dev-server-client-overlay');
      if (overlay) overlay.remove();
    });
    
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    console.log('✓ Logged in\n');

    // Step 3: Verify on dashboard
    console.log('Step 3: Verify authenticated access');
    const url2 = page.url();
    const onDashboard = url2.includes('/dashboard');
    console.log(`${onDashboard ? '✅' : '❌'} Successfully on dashboard: ${url2}\n`);

    // Step 4: Clear tokens and try to access dashboard again
    console.log('Step 4: Clear authentication and access protected route');
    await page.evaluate(() => localStorage.clear());
    console.log('✓ Tokens cleared');
    
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);
    
    const url3 = page.url();
    const redirectedAgain = url3.includes('/login');
    console.log(`${redirectedAgain ? '✅' : '❌'} Redirected to login again: ${url3}\n`);

    // Result
    if (redirected && onDashboard && redirectedAgain) {
      console.log('✅ TEST 3 PASSED\n');
      await page.screenshot({ path: 'test-results/test3-success.png' });
    } else {
      console.log('❌ TEST 3 FAILED\n');
      console.log(`  Initial redirect: ${redirected}`);
      console.log(`  Dashboard access: ${onDashboard}`);
      console.log(`  Post-logout redirect: ${redirectedAgain}`);
      await page.screenshot({ path: 'test-results/test3-failed.png' });
    }

  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`);
    await page.screenshot({ path: 'test-results/test3-error.png' }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
