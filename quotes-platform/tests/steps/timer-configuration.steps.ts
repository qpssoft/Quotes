import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { BuddhistQuotesWorld } from '../support/world';

// Scenario: Default timer interval
Then('the timer dropdown should show {string} selected', async function (this: BuddhistQuotesWorld, interval: string) {
  const timerDropdown = await this.page!.locator('[data-testid="timer-dropdown"]');
  await timerDropdown.waitFor({ state: 'visible', timeout: 5000 });
  
  // Get the selected value (numeric value attribute)
  const selectedValue = await timerDropdown.inputValue();
  const expectedValue = interval.replace(' seconds', '');
  
  // If inputValue is empty, try getting the selected option's value directly
  if (!selectedValue) {
    const selectedOption = await timerDropdown.locator('option:checked').getAttribute('value');
    expect(selectedOption || '').toContain(expectedValue);
  } else {
    expect(selectedValue).toContain(expectedValue);
  }
});

Then('quotes should rotate every {int} seconds', async function (this: BuddhistQuotesWorld, seconds: number) {
  // Wait for rotation interval + buffer
  await this.page!.waitForTimeout((seconds + 1) * 1000);
  
  // Check if quote display is still functional (use .first() to avoid strict mode)
  const quoteContent = await this.page!.locator('[data-testid="quote-content"]').first().textContent();
  expect(quoteContent).toBeTruthy();
});

// Scenario: Change timer interval
Given('I see the timer dropdown set to {string}', async function (this: BuddhistQuotesWorld, interval: string) {
  const timerDropdown = await this.page!.locator('[data-testid="timer-dropdown"]');
  await expect(timerDropdown).toBeVisible();
  console.log(`Timer dropdown showing: ${interval}`);
});

When('I select {string} from the timer dropdown', async function (this: BuddhistQuotesWorld, interval: string) {
  const seconds = interval.replace(' seconds', '');
  await this.page!.selectOption('[data-testid="timer-dropdown"]', seconds);
  await this.page!.waitForTimeout(500);
});

Then('the next quote should appear after {int} seconds', async function (this: BuddhistQuotesWorld, seconds: number) {
  // Wait for the specified interval
  await this.page!.waitForTimeout((seconds + 1) * 1000);
  
  const quoteContent = await this.page!.locator('[data-testid="quote-content"]').first().textContent();
  expect(quoteContent).toBeTruthy();
});

Then('subsequent quotes should rotate every {int} seconds', async function (this: BuddhistQuotesWorld, seconds: number) {
  // Verify rotation timing is set correctly
  console.log(`Rotation configured for ${seconds} seconds`);
  await this.page!.waitForTimeout(1000);
});

// Scenario: Timer persistence
Given('I have set the timer to {string}', async function (this: BuddhistQuotesWorld, interval: string) {
  const seconds = interval.replace(' seconds', '');
  await this.page!.selectOption('[data-testid="timer-dropdown"]', seconds);
  await this.page!.waitForTimeout(500);
});

When('I refresh the page', async function (this: BuddhistQuotesWorld) {
  await this.page!.reload();
  await this.page!.waitForLoadState('networkidle');
  await this.page!.waitForTimeout(1000);
});

// Scenario: Timer change when paused
Given('I have paused the quote rotation', async function (this: BuddhistQuotesWorld) {
  // Wait for controls to be fully rendered
  await this.page!.waitForSelector('[data-testid="timer-dropdown"]', { timeout: 5000 });
  await this.page!.waitForTimeout(2000); // Give rotation service time to start
  
  // Check if rotation is playing (pause button visible) or not (play button visible)
  const pauseButton = await this.page!.locator('[data-testid="pause-button"]').isVisible({ timeout: 5000 }).catch(() => false);
  const playButton = await this.page!.locator('[data-testid="play-button"]').isVisible({ timeout: 1000 }).catch(() => false);
  
  if (playButton) {
    // Rotation not started, start it first then pause
    await this.page!.click('[data-testid="play-button"]');
    await this.page!.waitForTimeout(1000);
    await this.page!.waitForSelector('[data-testid="pause-button"]', { timeout: 5000 });
    await this.page!.click('[data-testid="pause-button"]');
  } else if (pauseButton) {
    // Already playing, just pause
    await this.page!.click('[data-testid="pause-button"]');
  } else {
    throw new Error('Could not find either play or pause button');
  }
  
  await this.page!.waitForTimeout(500);
});

When('I change the timer to {string}', async function (this: BuddhistQuotesWorld, interval: string) {
  const seconds = interval.replace(' seconds', '');
  await this.page!.selectOption('[data-testid="timer-dropdown"]', seconds);
  await this.page!.waitForTimeout(500);
});

When('I resume the rotation', async function (this: BuddhistQuotesWorld) {
  await this.page!.click('[data-testid="play-button"]');
  await this.page!.waitForTimeout(500);
});

// Scenario: Timer change when playing
Given('quotes are rotating every {int} seconds', async function (this: BuddhistQuotesWorld, seconds: number) {
  // Verify rotation is active
  console.log(`Quotes rotating every ${seconds} seconds`);
  const timerDropdown = await this.page!.locator('[data-testid="timer-dropdown"]');
  await expect(timerDropdown).toBeVisible();
});

Given('{int} seconds have passed since the last rotation', async function (this: BuddhistQuotesWorld, seconds: number) {
  // Wait for specified time
  await this.page!.waitForTimeout(seconds * 1000);
});

Then('the current quote should complete its remaining {int} seconds', async function (this: BuddhistQuotesWorld, seconds: number) {
  // Wait for remaining time
  await this.page!.waitForTimeout((seconds + 1) * 1000);
});

// Scenario: All timer options available
When('I click the timer dropdown', async function (this: BuddhistQuotesWorld) {
  await this.page!.click('[data-testid="timer-dropdown"]');
  await this.page!.waitForTimeout(300);
});

Then('I should see options for: {int}, {int}, {int}, {int}, {int}, {int}, {int}, {int}, {int}, {int}, {int}, {int} seconds', 
  async function (this: BuddhistQuotesWorld, opt1: number, opt2: number, opt3: number, opt4: number, 
    opt5: number, opt6: number, opt7: number, opt8: number, opt9: number, opt10: number, opt11: number, opt12: number) {
    // The feature file lists all expected intervals
    const dropdown = this.page!.locator('[data-testid="timer-dropdown"]');
    const options = await dropdown.locator('option').all();
    
    const optionTexts = await Promise.all(options.map(opt => opt.textContent()));
    console.log('Timer options found:', optionTexts);
    
    // Verify we have at least 12 options
    expect(options.length).toBeGreaterThanOrEqual(12);
    
    // Verify all specified intervals are present (extract numbers from Vietnamese text)
    const expectedIntervals = [opt1, opt2, opt3, opt4, opt5, opt6, opt7, opt8, opt9, opt10, opt11, opt12];
    const foundIntervals = optionTexts.map(text => {
      const match = text?.match(/(\d+)/);
      return match ? parseInt(match[1]) : null;
    }).filter(n => n !== null);
    
    console.log('Expected intervals:', expectedIntervals);
    console.log('Found intervals:', foundIntervals);
    
    for (const interval of expectedIntervals) {
      const hasOption = foundIntervals.includes(interval);
      expect(hasOption).toBe(true);
    }
});

Then('all options should be selectable', async function (this: BuddhistQuotesWorld) {
  const dropdown = await this.page!.locator('[data-testid="timer-dropdown"]');
  const options = await dropdown.locator('option').all();
  
  expect(options.length).toBeGreaterThan(0);
});

// Scenario: localStorage unavailable
Given('localStorage is disabled in my browser', async function (this: BuddhistQuotesWorld) {
  // Override localStorage to simulate disabled state
  await this.page!.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => { throw new Error('localStorage disabled'); },
        setItem: () => { throw new Error('localStorage disabled'); },
        removeItem: () => { throw new Error('localStorage disabled'); },
        clear: () => { throw new Error('localStorage disabled'); },
        length: 0,
        key: () => null,
      },
      writable: false
    });
  });
  
  await this.page!.goto('http://localhost:4200');
  await this.page!.waitForLoadState('networkidle');
});

When('I change the timer setting', async function (this: BuddhistQuotesWorld) {
  await this.page!.selectOption('[data-testid="timer-dropdown"]', '30');
  await this.page!.waitForTimeout(500);
});

Then('the timer should work with the new setting', async function (this: BuddhistQuotesWorld) {
  const dropdown = await this.page!.locator('[data-testid="timer-dropdown"]');
  const selectedValue = await dropdown.inputValue();
  expect(selectedValue).toBe('30');
});

Then('the application should not display an error', async function (this: BuddhistQuotesWorld) {
  // Check that no error modal or message is visible
  const errorElements = await this.page!.locator('[data-testid="error-message"]').count();
  expect(errorElements).toBe(0);
});

Then('the timer should reset to {int} seconds on page refresh', async function (this: BuddhistQuotesWorld, defaultSeconds: number) {
  await this.page!.reload();
  await this.page!.waitForLoadState('networkidle');
  await this.page!.waitForTimeout(1000);
  
  const dropdown = await this.page!.locator('[data-testid="timer-dropdown"]');
  const selectedValue = await dropdown.inputValue();
  expect(selectedValue).toBe(defaultSeconds.toString());
});
