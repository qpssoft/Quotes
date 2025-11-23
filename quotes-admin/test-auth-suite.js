// Automated Test Suite: Phase 4 Authentication (Tests 2-4)
const playwright = require('playwright');

// Test configuration
const CONFIG = {
  adminCenterUrl: 'http://localhost:3000',
  testEmail: 'test-user@example.com',
  testName: 'Test User',
  slowMo: 300,
  screenshotDir: 'test-results'
};

// Helper: Login function
async function login(page, email, name) {
  await page.goto(`${CONFIG.adminCenterUrl}/login`);
  await page.waitForLoadState('networkidle');
  
  await page.locator('#email').fill(email);
  await page.locator('#name').fill(name);
  
  // Remove webpack overlay if present
  await page.evaluate(() => {
    const overlay = document.getElementById('webpack-dev-server-client-overlay');
    if (overlay) overlay.remove();
  });
  
  await page.locator('button[type="submit"]').click();
  
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

// Helper: Get localStorage tokens
async function getTokens(page) {
  return await page.evaluate(() => {
    return {
      accessToken: localStorage.getItem('quotes_access_token'),
      refreshToken: localStorage.getItem('quotes_refresh_token'),
      user: localStorage.getItem('quotes_user')
    };
  });
}

// Helper: Clear localStorage
async function clearTokens(page) {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

// Test 2: Token Storage Persistence
async function test2_TokenPersistence(browser) {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TEST 2: Token Storage Persistence');
  console.log('='.repeat(80) + '\n');

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Login
    console.log('📍 Step 1: Login with test credentials');
    await login(page, CONFIG.testEmail, CONFIG.testName);
    console.log('   ✓ Login successful\n');

    // Step 2: Verify tokens stored
    console.log('📍 Step 2: Verify tokens in localStorage');
    const tokens1 = await getTokens(page);
    
    const hasAccessToken = !!tokens1.accessToken && tokens1.accessToken.startsWith('eyJ');
    const hasRefreshToken = !!tokens1.refreshToken;
    const hasUser = !!tokens1.user;

    console.log(`   ${hasAccessToken ? '✅' : '❌'} Access Token: ${hasAccessToken ? tokens1.accessToken.substring(0, 30) + '...' : 'NOT FOUND'}`);
    console.log(`   ${hasRefreshToken ? '✅' : '❌'} Refresh Token: ${hasRefreshToken ? tokens1.refreshToken.substring(0, 20) + '...' : 'NOT FOUND'}`);
    console.log(`   ${hasUser ? '✅' : '❌'} User Data: ${hasUser ? 'STORED' : 'NOT FOUND'}\n`);

    // Step 3: Refresh page
    console.log('📍 Step 3: Refresh the page (F5)');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log('   ✓ Page refreshed\n');

    // Step 4: Verify still on dashboard
    console.log('📍 Step 4: Verify still authenticated');
    const currentUrl = page.url();
    const stillOnDashboard = currentUrl.includes('/dashboard');
    console.log(`   ${stillOnDashboard ? '✅' : '❌'} Still on dashboard: ${currentUrl}`);

    // Step 5: Verify tokens persist
    console.log('\n📍 Step 5: Verify tokens persist after refresh');
    const tokens2 = await getTokens(page);
    
    const tokensMatch = tokens1.accessToken === tokens2.accessToken 
                     && tokens1.refreshToken === tokens2.refreshToken
                     && tokens1.user === tokens2.user;
    
    console.log(`   ${tokensMatch ? '✅' : '❌'} Tokens unchanged: ${tokensMatch ? 'YES' : 'NO'}`);
    console.log(`   ${tokens2.accessToken ? '✅' : '❌'} Access Token: ${tokens2.accessToken ? 'PRESENT' : 'MISSING'}`);
    console.log(`   ${tokens2.refreshToken ? '✅' : '❌'} Refresh Token: ${tokens2.refreshToken ? 'PRESENT' : 'MISSING'}`);
    console.log(`   ${tokens2.user ? '✅' : '❌'} User Data: ${tokens2.user ? 'PRESENT' : 'MISSING'}`);

    // Step 6: Take screenshot
    await page.screenshot({ path: `${CONFIG.screenshotDir}/test2-dashboard-after-refresh.png`, fullPage: true });
    console.log('\n📸 Screenshot saved: test2-dashboard-after-refresh.png');

    // Result
    const allPassed = hasAccessToken && hasRefreshToken && hasUser && stillOnDashboard && tokensMatch;
    
    console.log('\n' + '='.repeat(80));
    if (allPassed) {
      console.log('🎉 TEST 2 PASSED: Token Storage Persistence Successful!');
      console.log('✅ Tokens persist after page refresh');
      console.log('✅ User stays authenticated');
    } else {
      console.log('⚠️  TEST 2 FAILED: Some checks did not pass');
    }
    console.log('='.repeat(80) + '\n');

    return allPassed;

  } catch (error) {
    console.error('\n❌ TEST 2 FAILED:');
    console.error(error.message);
    await page.screenshot({ path: `${CONFIG.screenshotDir}/test2-error.png` });
    return false;
  } finally {
    await context.close();
  }
}

// Test 3: Protected Routes
async function test3_ProtectedRoutes(browser) {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TEST 3: Protected Routes');
  console.log('='.repeat(80) + '\n');

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Navigate to dashboard without login
    console.log('📍 Step 1: Navigate to /dashboard without authentication');
    await page.goto(`${CONFIG.adminCenterUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const url1 = page.url();
    const redirectedToLogin1 = url1.includes('/login');
    console.log(`   ${redirectedToLogin1 ? '✅' : '❌'} Redirected to login: ${url1}`);

    // Step 2: Take screenshot of login page
    await page.screenshot({ path: `${CONFIG.screenshotDir}/test3-redirect-to-login.png`, fullPage: true });
    console.log('   📸 Screenshot: test3-redirect-to-login.png\n');

    // Step 3: Login
    console.log('📍 Step 2: Login successfully');
    await login(page, 'protected-route-test@example.com', 'Protected Route Tester');
    console.log('   ✓ Login successful\n');

    // Step 4: Verify on dashboard
    console.log('📍 Step 3: Verify access to dashboard after login');
    const url2 = page.url();
    const onDashboard = url2.includes('/dashboard');
    console.log(`   ${onDashboard ? '✅' : '❌'} On dashboard: ${url2}\n`);

    // Step 5: Clear localStorage (logout without using logout button)
    console.log('📍 Step 4: Clear localStorage (simulate session loss)');
    await clearTokens(page);
    const tokensAfterClear = await getTokens(page);
    const tokensCleared = !tokensAfterClear.accessToken && !tokensAfterClear.refreshToken && !tokensAfterClear.user;
    console.log(`   ${tokensCleared ? '✅' : '❌'} Tokens cleared: ${tokensCleared ? 'YES' : 'NO'}\n`);

    // Step 6: Try to navigate to dashboard again
    console.log('📍 Step 5: Try to access /dashboard after clearing tokens');
    await page.goto(`${CONFIG.adminCenterUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const url3 = page.url();
    const redirectedToLogin2 = url3.includes('/login');
    console.log(`   ${redirectedToLogin2 ? '✅' : '❌'} Redirected to login: ${url3}\n`);

    // Step 7: Test root path redirect
    console.log('📍 Step 6: Test root path (/) without authentication');
    await page.goto(CONFIG.adminCenterUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const url4 = page.url();
    const redirectedToLogin3 = url4.includes('/login');
    console.log(`   ${redirectedToLogin3 ? '✅' : '❌'} Root redirects to login: ${url4}`);

    // Result
    const allPassed = redirectedToLogin1 && onDashboard && tokensCleared && redirectedToLogin2 && redirectedToLogin3;
    
    console.log('\n' + '='.repeat(80));
    if (allPassed) {
      console.log('🎉 TEST 3 PASSED: Protected Routes Working Correctly!');
      console.log('✅ Unauthenticated users redirected to login');
      console.log('✅ Authenticated users can access dashboard');
      console.log('✅ Session loss redirects to login');
    } else {
      console.log('⚠️  TEST 3 FAILED: Some checks did not pass');
    }
    console.log('='.repeat(80) + '\n');

    return allPassed;

  } catch (error) {
    console.error('\n❌ TEST 3 FAILED:');
    console.error(error.message);
    await page.screenshot({ path: `${CONFIG.screenshotDir}/test3-error.png` });
    return false;
  } finally {
    await context.close();
  }
}

// Test 4: Logout Flow
async function test4_LogoutFlow(browser) {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TEST 4: Logout Flow');
  console.log('='.repeat(80) + '\n');

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Login
    console.log('📍 Step 1: Login with test credentials');
    await login(page, 'logout-test@example.com', 'Logout Tester');
    console.log('   ✓ Login successful\n');

    // Step 2: Verify tokens present
    console.log('📍 Step 2: Verify tokens present before logout');
    const tokensBefore = await getTokens(page);
    const hasTokensBefore = !!tokensBefore.accessToken && !!tokensBefore.refreshToken && !!tokensBefore.user;
    console.log(`   ${hasTokensBefore ? '✅' : '❌'} Tokens present: ${hasTokensBefore ? 'YES' : 'NO'}\n`);

    // Step 3: Take screenshot of dashboard
    await page.screenshot({ path: `${CONFIG.screenshotDir}/test4-before-logout.png`, fullPage: true });
    console.log('📸 Screenshot: test4-before-logout.png\n');

    // Step 4: Click logout button
    console.log('📍 Step 3: Click Logout button');
    const logoutButton = await page.locator('button:has-text("Logout"), button:has-text("Log Out"), button:has-text("Sign Out")').first();
    
    // Set up dialog handler for confirmation
    page.on('dialog', async dialog => {
      console.log(`   ℹ️  Dialog appeared: "${dialog.message()}"`);
      await dialog.accept();
      console.log('   ✓ Confirmed logout');
    });
    
    await logoutButton.click();
    console.log('   ✓ Logout button clicked\n');

    // Step 5: Wait for redirect to login
    console.log('📍 Step 4: Wait for redirect to login page');
    await page.waitForURL('**/login', { timeout: 5000 });
    await page.waitForLoadState('networkidle');
    
    const urlAfterLogout = page.url();
    const redirectedToLogin = urlAfterLogout.includes('/login');
    console.log(`   ${redirectedToLogin ? '✅' : '❌'} Redirected to login: ${urlAfterLogout}\n`);

    // Step 6: Verify tokens cleared
    console.log('📍 Step 5: Verify tokens cleared from localStorage');
    const tokensAfter = await getTokens(page);
    const tokensCleared = !tokensAfter.accessToken && !tokensAfter.refreshToken && !tokensAfter.user;
    console.log(`   ${tokensCleared ? '✅' : '❌'} Access Token cleared: ${!tokensAfter.accessToken ? 'YES' : 'NO'}`);
    console.log(`   ${tokensCleared ? '✅' : '❌'} Refresh Token cleared: ${!tokensAfter.refreshToken ? 'YES' : 'NO'}`);
    console.log(`   ${tokensCleared ? '✅' : '❌'} User Data cleared: ${!tokensAfter.user ? 'YES' : 'NO'}\n`);

    // Step 7: Try to access dashboard
    console.log('📍 Step 6: Try to access dashboard after logout');
    await page.goto(`${CONFIG.adminCenterUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const finalUrl = page.url();
    const stillRedirectedToLogin = finalUrl.includes('/login');
    console.log(`   ${stillRedirectedToLogin ? '✅' : '❌'} Redirected to login: ${stillRedirectedToLogin ? 'YES' : 'NO'}\n`);

    // Step 8: Take screenshot after logout
    await page.screenshot({ path: `${CONFIG.screenshotDir}/test4-after-logout.png`, fullPage: true });
    console.log('📸 Screenshot: test4-after-logout.png');

    // Result
    const allPassed = hasTokensBefore && redirectedToLogin && tokensCleared && stillRedirectedToLogin;
    
    console.log('\n' + '='.repeat(80));
    if (allPassed) {
      console.log('🎉 TEST 4 PASSED: Logout Flow Working Correctly!');
      console.log('✅ Logout button triggers logout');
      console.log('✅ Redirects to login page');
      console.log('✅ All tokens cleared from localStorage');
      console.log('✅ Cannot access dashboard after logout');
    } else {
      console.log('⚠️  TEST 4 FAILED: Some checks did not pass');
    }
    console.log('='.repeat(80) + '\n');

    return allPassed;

  } catch (error) {
    console.error('\n❌ TEST 4 FAILED:');
    console.error(error.message);
    await page.screenshot({ path: `${CONFIG.screenshotDir}/test4-error.png` });
    return false;
  } finally {
    await context.close();
  }
}

// Main test runner
(async () => {
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(15) + '🧪 AUTHENTICATION TEST SUITE (Tests 2-4)' + ' '.repeat(22) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');
  console.log('\n📅 Date: ' + new Date().toISOString());
  console.log('🌐 Admin Center: ' + CONFIG.adminCenterUrl);
  console.log('🎭 Browser: Chromium (headed, slowMo: ' + CONFIG.slowMo + 'ms)');
  console.log('\n⏳ Starting tests...\n');

  const browser = await playwright.chromium.launch({ 
    headless: false,
    slowMo: CONFIG.slowMo
  });

  const results = {
    test2: false,
    test3: false,
    test4: false
  };

  try {
    // Run Test 2
    results.test2 = await test2_TokenPersistence(browser);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Run Test 3
    results.test3 = await test3_ProtectedRoutes(browser);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Run Test 4
    results.test4 = await test4_LogoutFlow(browser);

  } catch (error) {
    console.error('\n❌ TEST SUITE ERROR:');
    console.error(error.message);
  } finally {
    await browser.close();
  }

  // Final Summary
  console.log('\n' + '╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(28) + '📊 FINAL SUMMARY' + ' '.repeat(34) + '║');
  console.log('╠' + '═'.repeat(78) + '╣');
  
  const totalTests = 3;
  const passedTests = Object.values(results).filter(r => r).length;
  const failedTests = totalTests - passedTests;
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);

  console.log('║  Test 2: Token Storage Persistence    ' + (results.test2 ? '✅ PASSED' : '❌ FAILED') + ' '.repeat(24) + '║');
  console.log('║  Test 3: Protected Routes              ' + (results.test3 ? '✅ PASSED' : '❌ FAILED') + ' '.repeat(24) + '║');
  console.log('║  Test 4: Logout Flow                   ' + (results.test4 ? '✅ PASSED' : '❌ FAILED') + ' '.repeat(24) + '║');
  console.log('╠' + '═'.repeat(78) + '╣');
  console.log('║  Total Tests: ' + totalTests + ' '.repeat(62) + '║');
  console.log('║  Passed: ' + passedTests + ' '.repeat(67) + '║');
  console.log('║  Failed: ' + failedTests + ' '.repeat(67) + '║');
  console.log('║  Pass Rate: ' + passRate + '%' + ' '.repeat(63) + '║');
  console.log('╚' + '═'.repeat(78) + '╝\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Phase 4 authentication is working perfectly!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please review the output above.\n');
    process.exit(1);
  }
})();
