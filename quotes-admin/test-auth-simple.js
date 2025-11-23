// Simplified Authentication Test Suite (Tests 2-4)
// Running tests sequentially with better error handling
const playwright = require('playwright');

const CONFIG = {
  adminCenterUrl: 'http://localhost:3000',
  testEmail: 'testuser@example.com',
  testName: 'Test User',
  slowMo: 500,
  timeout: 30000
};

// Helper: Remove webpack overlay
async function removeOverlay(page) {
  await page.evaluate(() => {
    const overlay = document.getElementById('webpack-dev-server-client-overlay');
    if (overlay) overlay.remove();
  });
}

// Helper: Login
async function login(page, email, name) {
  console.log(`  → Navigating to login page...`);
  await page.goto(`${CONFIG.adminCenterUrl}/login`, { waitUntil: 'networkidle', timeout: CONFIG.timeout });
  
  console.log(`  → Filling email: ${email}`);
  await page.locator('#email').fill(email);
  
  console.log(`  → Filling name: ${name}`);
  await page.locator('#name').fill(name);
  
  console.log(`  → Removing overlay and clicking submit...`);
  await removeOverlay(page);
  await page.locator('button[type="submit"]').click();
  
  console.log(`  → Waiting for dashboard...`);
  await page.waitForURL('**/dashboard', { timeout: CONFIG.timeout });
  await page.waitForLoadState('networkidle');
  console.log(`  ✓ Login successful\n`);
}

// Helper: Get tokens
async function getTokens(page) {
  return await page.evaluate(() => ({
    accessToken: localStorage.getItem('quotes_access_token'),
    refreshToken: localStorage.getItem('quotes_refresh_token'),
    user: localStorage.getItem('quotes_user')
  }));
}

// Helper: Clear tokens
async function clearTokens(page) {
  await page.evaluate(() => localStorage.clear());
}

// TEST 2: Token Persistence
async function runTest2(browser) {
  console.log('\n' + '═'.repeat(60));
  console.log('TEST 2: Token Storage Persistence');
  console.log('═'.repeat(60) + '\n');

  const context = await browser.newContext();
  const page = await context.newPage();
  let passed = false;

  try {
    // Step 1: Login
    console.log('Step 1: Login');
    await login(page, CONFIG.testEmail, CONFIG.testName);

    // Step 2: Check tokens
    console.log('Step 2: Verify tokens stored');
    const tokens1 = await getTokens(page);
    console.log(`  ✓ Access Token: ${tokens1.accessToken ? 'Present' : 'Missing'}`);
    console.log(`  ✓ Refresh Token: ${tokens1.refreshToken ? 'Present' : 'Missing'}`);
    console.log(`  ✓ User Data: ${tokens1.user ? 'Present' : 'Missing'}\n`);

    // Step 3: Reload page
    console.log('Step 3: Reload page');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log(`  ✓ Page reloaded\n`);

    // Step 4: Verify still on dashboard
    console.log('Step 4: Verify still authenticated');
    const url = page.url();
    const onDashboard = url.includes('/dashboard');
    console.log(`  ${onDashboard ? '✅' : '❌'} Still on dashboard: ${url}\n`);

    // Step 5: Verify tokens persist
    console.log('Step 5: Verify tokens persisted');
    const tokens2 = await getTokens(page);
    const tokensMatch = tokens1.accessToken === tokens2.accessToken && 
                        tokens1.refreshToken === tokens2.refreshToken;
    console.log(`  ${tokensMatch ? '✅' : '❌'} Tokens match: ${tokensMatch}\n`);

    passed = onDashboard && tokensMatch;
    console.log(passed ? '✅ TEST 2 PASSED' : '❌ TEST 2 FAILED');

  } catch (error) {
    console.error(`\n❌ TEST 2 ERROR: ${error.message}`);
    await page.screenshot({ path: 'test-results/test2-error.png' }).catch(() => {});
  } finally {
    await context.close();
  }

  return passed;
}

// TEST 3: Protected Routes
async function runTest3(browser) {
  console.log('\n' + '═'.repeat(60));
  console.log('TEST 3: Protected Route Access');
  console.log('═'.repeat(60) + '\n');

  const context = await browser.newContext();
  const page = await context.newPage();
  let passed = false;

  try {
    // Step 1: Try to access dashboard without login
    console.log('Step 1: Access dashboard without authentication');
    await page.goto(`${CONFIG.adminCenterUrl}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const url1 = page.url();
    const redirected1 = url1.includes('/login');
    console.log(`  ${redirected1 ? '✅' : '❌'} Redirected to login: ${url1}\n`);

    // Step 2: Login
    console.log('Step 2: Login');
    await login(page, CONFIG.testEmail, CONFIG.testName);

    // Step 3: Verify on dashboard
    console.log('Step 3: Verify on dashboard');
    const url2 = page.url();
    const onDashboard = url2.includes('/dashboard');
    console.log(`  ${onDashboard ? '✅' : '❌'} On dashboard: ${url2}\n`);

    // Step 4: Clear tokens and try dashboard
    console.log('Step 4: Clear tokens and access dashboard');
    await clearTokens(page);
    await page.goto(`${CONFIG.adminCenterUrl}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const url3 = page.url();
    const redirected2 = url3.includes('/login');
    console.log(`  ${redirected2 ? '✅' : '❌'} Redirected back to login: ${url3}\n`);

    passed = redirected1 && onDashboard && redirected2;
    console.log(passed ? '✅ TEST 3 PASSED' : '❌ TEST 3 FAILED');

  } catch (error) {
    console.error(`\n❌ TEST 3 ERROR: ${error.message}`);
    await page.screenshot({ path: 'test-results/test3-error.png' }).catch(() => {});
  } finally {
    await context.close();
  }

  return passed;
}

// TEST 4: Logout Flow
async function runTest4(browser) {
  console.log('\n' + '═'.repeat(60));
  console.log('TEST 4: Logout Flow');
  console.log('═'.repeat(60) + '\n');

  const context = await browser.newContext();
  const page = await context.newPage();
  let passed = false;

  try {
    // Step 1: Login
    console.log('Step 1: Login');
    await login(page, CONFIG.testEmail, CONFIG.testName);

    // Step 2: Verify tokens
    console.log('Step 2: Verify logged in');
    const tokens1 = await getTokens(page);
    const hasTokens = !!tokens1.accessToken;
    console.log(`  ${hasTokens ? '✅' : '❌'} Has tokens: ${hasTokens}\n`);

    // Step 3: Click logout
    console.log('Step 3: Click logout');
    await removeOverlay(page);
    
    // Try multiple logout button selectors
    const logoutClicked = await page.evaluate(() => {
      const selectors = [
        'button:has-text("Sign Out")',
        'button:has-text("Logout")',
        'button:has-text("Log Out")',
        '[data-testid="logout-button"]',
        'a[href*="logout"]'
      ];
      
      for (const sel of selectors) {
        const btn = document.querySelector(sel);
        if (btn) {
          btn.click();
          return true;
        }
      }
      return false;
    });
    
    if (!logoutClicked) {
      console.log('  ⚠️  Logout button not found, trying navigation menu...');
      // Try clicking user menu first
      await page.locator('button:has-text("Test User")').click().catch(() => {});
      await page.waitForTimeout(500);
      await page.locator('button:has-text("Sign Out")').click().catch(() => {});
    }
    
    await page.waitForTimeout(2000);
    console.log(`  ✓ Logout clicked\n`);

    // Step 4: Verify redirect to login
    console.log('Step 4: Verify redirected to login');
    const url = page.url();
    const onLogin = url.includes('/login');
    console.log(`  ${onLogin ? '✅' : '❌'} On login page: ${url}\n`);

    // Step 5: Verify tokens cleared
    console.log('Step 5: Verify tokens cleared');
    const tokens2 = await getTokens(page);
    const tokensCleared = !tokens2.accessToken && !tokens2.refreshToken;
    console.log(`  ${tokensCleared ? '✅' : '❌'} Tokens cleared: ${tokensCleared}\n`);

    passed = hasTokens && onLogin && tokensCleared;
    console.log(passed ? '✅ TEST 4 PASSED' : '❌ TEST 4 FAILED');

  } catch (error) {
    console.error(`\n❌ TEST 4 ERROR: ${error.message}`);
    await page.screenshot({ path: 'test-results/test4-error.png' }).catch(() => {});
  } finally {
    await context.close();
  }

  return passed;
}

// Main runner
(async () => {
  console.log('\n╔' + '═'.repeat(58) + '╗');
  console.log('║  🧪 AUTHENTICATION TEST SUITE (Tests 2-4)' + ' '.repeat(17) + '║');
  console.log('╚' + '═'.repeat(58) + '╝');
  console.log(`\n📅 ${new Date().toLocaleString()}`);
  console.log(`🌐 ${CONFIG.adminCenterUrl}`);
  console.log(`🎭 Chromium (slowMo: ${CONFIG.slowMo}ms)\n`);

  const browser = await playwright.chromium.launch({ 
    headless: false,
    slowMo: CONFIG.slowMo 
  });

  const results = {};

  try {
    results.test2 = await runTest2(browser);
    await new Promise(r => setTimeout(r, 3000));

    results.test3 = await runTest3(browser);
    await new Promise(r => setTimeout(r, 3000));

    results.test4 = await runTest4(browser);

  } catch (error) {
    console.error(`\n❌ SUITE ERROR: ${error.message}`);
  } finally {
    await browser.close();
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Test 2 (Token Persistence): ${results.test2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 3 (Protected Routes):  ${results.test3 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 4 (Logout Flow):       ${results.test4 ? '✅ PASS' : '❌ FAIL'}`);
  
  const passCount = Object.values(results).filter(r => r).length;
  console.log(`\n${passCount}/3 tests passed\n`);

  process.exit(passCount === 3 ? 0 : 1);
})();
