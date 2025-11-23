// Quick Debug Test
const playwright = require('playwright');

(async () => {
  console.log('Starting debug test...\n');
  
  const browser = await playwright.chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('[Browser]', msg.text()));
  page.on('pageerror', err => console.error('[Error]', err.message));

  try {
    console.log('1. Navigating to login...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('✓ Page loaded\n');

    console.log('2. Filling form...');
    await page.locator('#email').fill('debug@example.com', { timeout: 10000 });
    await page.locator('#name').fill('Debug User', { timeout: 10000 });
    console.log('✓ Form filled\n');

    console.log('3. Clicking submit...');
    // Remove webpack overlay if present
    await page.evaluate(() => {
      const overlay = document.getElementById('webpack-dev-server-client-overlay');
      if (overlay) overlay.remove();
    });
    await page.locator('button[type="submit"]').click({ timeout: 10000 });
    console.log('✓ Button clicked\n');

    console.log('4. Waiting for dashboard...');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('✓ Redirected to dashboard\n');

    const tokens = await page.evaluate(() => ({
      access: !!localStorage.getItem('quotes_access_token'),
      refresh: !!localStorage.getItem('quotes_refresh_token'),
      user: !!localStorage.getItem('quotes_user')
    }));

    console.log('Tokens:', tokens);
    console.log('\n✅ Debug test passed!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'debug-error.png' });
  } finally {
    await browser.close();
  }
})();
