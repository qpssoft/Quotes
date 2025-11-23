// Automated Test 1: Email Login Flow
const playwright = require('playwright');

(async () => {
  console.log('🧪 Starting Test 1: Email Login Flow\n');
  
  // Launch browser
  const browser = await playwright.chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down actions for visibility
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to console messages
  page.on('console', msg => console.log(`   [Browser Console] ${msg.type()}: ${msg.text()}`));
  
  // Listen to page errors
  page.on('pageerror', error => console.error(`   [Browser Error] ${error.message}`));

  try {
    // Step 1: Navigate to login page
    console.log('📍 Step 1: Navigating to http://localhost:3000/login');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Wait for React to render
    console.log('✅ Page loaded\n');

    // Take screenshot of login page
    await page.screenshot({ path: 'test-results/01-login-page.png', fullPage: true });
    console.log('📸 Screenshot saved: 01-login-page.png\n');

    // Debug: Check what's on the page
    const pageContent = await page.content();
    const hasEmailInput = pageContent.includes('id="email"');
    const hasLoginForm = pageContent.includes('login-form');
    console.log('🔍 Page Debug:');
    console.log(`   - Has #email input: ${hasEmailInput}`);
    console.log(`   - Has login-form class: ${hasLoginForm}`);
    console.log(`   - Page title: ${await page.title()}\n`);

    // Step 2: Fill in login form
    console.log('📍 Step 2: Filling in login credentials');
    const emailInput = await page.locator('#email');
    await emailInput.fill('admin@example.com');
    console.log('   ✓ Email: admin@example.com');

    const nameInput = await page.locator('#name');
    await nameInput.fill('Admin User');
    console.log('   ✓ Name: Admin User\n');

    // Step 3: Click sign in button
    console.log('📍 Step 3: Clicking "Sign in with Email" button');
    
    // Close any webpack overlay that might be blocking
    try {
      const overlay = await page.locator('iframe#webpack-dev-server-client-overlay');
      if (await overlay.count() > 0) {
        await page.evaluate(() => {
          const iframe = document.getElementById('webpack-dev-server-client-overlay');
          if (iframe) iframe.remove();
        });
        console.log('   ℹ️  Removed webpack overlay');
      }
    } catch (e) {
      // Ignore if overlay doesn't exist
    }
    
    const signInButton = await page.locator('button[type="submit"]');
    await signInButton.click();
    console.log('   ✓ Button clicked\n');

    // Step 4: Wait for navigation to dashboard
    console.log('📍 Step 4: Waiting for redirect to dashboard...');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✅ Redirected to dashboard\n');

    // Wait for dashboard content to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Take screenshot of dashboard
    await page.screenshot({ path: 'test-results/02-dashboard.png' });
    console.log('📸 Screenshot saved: 02-dashboard.png\n');

    // Step 5: Verify dashboard content
    console.log('📍 Step 5: Verifying dashboard content');
    
    // Check for user profile elements
    const hasEmail = await page.locator('text=/admin@example.com/i').count() > 0;
    const hasName = await page.locator('text=/Admin User/i').count() > 0;
    const hasUserId = await page.locator('text=/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i').count() > 0;
    
    console.log(`   ${hasEmail ? '✅' : '❌'} Email displayed: admin@example.com`);
    console.log(`   ${hasName ? '✅' : '❌'} Name displayed: Admin User`);
    console.log(`   ${hasUserId ? '✅' : '❌'} User ID displayed (UUID format)`);

    // Step 6: Check localStorage tokens
    console.log('\n📍 Step 6: Checking localStorage tokens');
    const tokens = await page.evaluate(() => {
      return {
        accessToken: localStorage.getItem('quotes_access_token'),
        refreshToken: localStorage.getItem('quotes_refresh_token'),
        user: localStorage.getItem('quotes_user')
      };
    });

    const hasAccessToken = !!tokens.accessToken && tokens.accessToken.startsWith('eyJ');
    const hasRefreshToken = !!tokens.refreshToken;
    const hasUser = !!tokens.user;

    console.log(`   ${hasAccessToken ? '✅' : '❌'} Access Token: ${hasAccessToken ? tokens.accessToken.substring(0, 50) + '...' : 'NOT FOUND'}`);
    console.log(`   ${hasRefreshToken ? '✅' : '❌'} Refresh Token: ${hasRefreshToken ? tokens.refreshToken.substring(0, 30) + '...' : 'NOT FOUND'}`);
    console.log(`   ${hasUser ? '✅' : '❌'} User Data: ${hasUser ? 'STORED' : 'NOT FOUND'}`);

    if (hasUser) {
      const userData = JSON.parse(tokens.user);
      console.log('\n   📋 User Profile:');
      console.log(`      - ID: ${userData.id || userData.Id}`);
      console.log(`      - Email: ${userData.email || userData.Email}`);
      console.log(`      - Name: ${userData.name || userData.Name}`);
      console.log(`      - Role: ${userData.role || userData.Role}`);
      console.log(`      - Provider: ${userData.provider || userData.Provider}`);
    }

    // Final result
    console.log('\n' + '='.repeat(60));
    const allTestsPassed = hasEmail && hasName && hasUserId && hasAccessToken && hasRefreshToken && hasUser;
    if (allTestsPassed) {
      console.log('🎉 TEST 1 PASSED: Email Login Flow Successful!');
      console.log('✅ All checks completed successfully');
    } else {
      console.log('⚠️  TEST 1 PARTIAL: Some checks failed');
      console.log('   Check the output above for details');
    }
    console.log('='.repeat(60) + '\n');

    console.log('🔍 Browser will stay open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('\n❌ TEST 1 FAILED:');
    console.error(error.message);
    
    // Take error screenshot
    try {
      await page.screenshot({ path: 'test-results/error-screenshot.png' });
      console.log('\n📸 Error screenshot saved: error-screenshot.png');
    } catch (e) {}
  } finally {
    await browser.close();
    console.log('\n✅ Browser closed. Test complete.');
  }
})();
