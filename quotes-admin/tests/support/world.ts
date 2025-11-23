import { chromium, Browser, Page, BrowserContext } from '@playwright/test';
import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';

export class QuotesAdminWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  backendUrl: string = 'http://localhost:7071';
  adminUrl: string = 'http://localhost:3000';

  constructor(options: IWorldOptions) {
    super(options);
  }

  async init() {
    this.browser = await chromium.launch({
      headless: process.env['HEADLESS'] !== 'false',
      slowMo: process.env['SLOWMO'] ? parseInt(process.env['SLOWMO']) : 0,
    });
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      locale: 'en-US',
    });
    this.page = await this.context.newPage();

    // Enable console logging for debugging
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log('❌ Browser Console Error:', msg.text());
      }
    });
  }

  async cleanup() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }

  /**
   * Clear localStorage and sessionStorage
   */
  async clearStorage() {
    if (this.page) {
      await this.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    }
  }

  /**
   * Get value from localStorage
   */
  async getLocalStorageItem(key: string): Promise<string | null> {
    if (!this.page) return null;
    return await this.page.evaluate((k) => localStorage.getItem(k), key);
  }

  /**
   * Set value in localStorage
   */
  async setLocalStorageItem(key: string, value: string): Promise<void> {
    if (this.page) {
      await this.page.evaluate(
        ({ k, v }) => localStorage.setItem(k, v),
        { k: key, v: value }
      );
    }
  }
}

setWorldConstructor(QuotesAdminWorld);
