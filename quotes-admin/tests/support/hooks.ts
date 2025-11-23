import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { QuotesAdminWorld } from './world';

// Set default timeout to 60 seconds for all steps
setDefaultTimeout(60000);

BeforeAll(async function () {
  console.log('🧪 Starting Quotes Admin E2E Tests (BDD)...');
  console.log('📝 Testing Authentication Feature');
});

Before(async function (this: QuotesAdminWorld, { pickle }) {
  console.log(`\n🎬 Starting scenario: ${pickle.name}`);
  await this.init();
  // Don't clear storage before navigation - will clear after first page load
});

After(async function (this: QuotesAdminWorld, { result, pickle }) {
  if (result?.status === Status.FAILED) {
    console.log(`❌ Scenario failed: ${pickle.name}`);
    
    // Take screenshot on failure
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = `test-results/screenshots/${pickle.name}-${timestamp}.png`;
    
    try {
      const screenshot = await this.page?.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      if (screenshot) {
        this.attach(screenshot, 'image/png');
        console.log(`📸 Screenshot saved: ${screenshotPath}`);
      }
    } catch (error) {
      console.error('Failed to take screenshot:', error);
    }
  } else if (result?.status === Status.PASSED) {
    console.log(`✅ Scenario passed: ${pickle.name}`);
  }
  
  await this.cleanup();
});

AfterAll(async function () {
  console.log('\n✨ Quotes Admin E2E Tests Complete!');
});
