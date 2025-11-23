/**
 * Electron Authentication Service
 * Platform-specific implementation using electron-store
 */

import Store from 'electron-store';
import { 
  BaseAuthService,
  FetchHttpClient,
  IStorageService,
  AuthServiceConfig,
} from '@quotes/shared-modules';

/**
 * Electron Store wrapper implementing IStorageService
 */
class ElectronStorageService implements IStorageService {
  private store: Store;

  constructor() {
    this.store = new Store({
      name: 'quotes-auth',
      encryptionKey: 'quotes-secure-key', // Consider using a more secure key in production
    });
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const value = this.store.get(key);
      return value ? String(value) : null;
    } catch (error) {
      console.error(`ElectronStore getItem error for key ${key}:`, error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      this.store.set(key, value);
    } catch (error) {
      console.error(`ElectronStore setItem error for key ${key}:`, error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      this.store.delete(key);
    } catch (error) {
      console.error(`ElectronStore removeItem error for key ${key}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      this.store.clear();
    } catch (error) {
      console.error('ElectronStore clear error:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      // @ts-ignore - electron-store doesn't have proper types for this
      return Object.keys(this.store.store);
    } catch (error) {
      console.error('ElectronStore getAllKeys error:', error);
      return [];
    }
  }
}

/**
 * Electron Auth Service Factory
 */
export function createElectronAuthService(config: AuthServiceConfig): BaseAuthService {
  const httpClient = new FetchHttpClient(config.apiBaseUrl);
  const storage = new ElectronStorageService();
  
  return new BaseAuthService(httpClient, storage, config);
}

/**
 * Singleton instance for Electron
 */
let authServiceInstance: BaseAuthService | null = null;

export function getElectronAuthService(config?: AuthServiceConfig): BaseAuthService {
  if (!authServiceInstance) {
    const defaultConfig: AuthServiceConfig = {
      apiBaseUrl: process.env.VITE_API_URL || 'http://localhost:7071/api/v1',
      useMockAuth: process.env.VITE_MOCK_AUTH === 'true',
      autoRefresh: true,
    };

    authServiceInstance = createElectronAuthService(config || defaultConfig);
  }

  return authServiceInstance;
}

export { BaseAuthService as ElectronAuthService };
