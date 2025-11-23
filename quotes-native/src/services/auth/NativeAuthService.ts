/**
 * React Native Authentication Service
 * Platform-specific implementation using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  BaseAuthService,
  FetchHttpClient,
  IStorageService,
  AuthServiceConfig,
} from '@quotes/shared-modules';

/**
 * AsyncStorage wrapper implementing IStorageService
 */
class AsyncStorageService implements IStorageService {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`AsyncStorage getItem error for key ${key}:`, error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`AsyncStorage setItem error for key ${key}:`, error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`AsyncStorage removeItem error for key ${key}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('AsyncStorage clear error:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys];
    } catch (error) {
      console.error('AsyncStorage getAllKeys error:', error);
      return [];
    }
  }
}

/**
 * React Native Auth Service Factory
 */
export function createNativeAuthService(config: AuthServiceConfig): BaseAuthService {
  const httpClient = new FetchHttpClient(config.apiBaseUrl);
  const storage = new AsyncStorageService();
  
  return new BaseAuthService(httpClient, storage, config);
}

/**
 * Singleton instance for React Native
 */
let authServiceInstance: BaseAuthService | null = null;

export function getNativeAuthService(config?: AuthServiceConfig): BaseAuthService {
  if (!authServiceInstance) {
    const defaultConfig: AuthServiceConfig = {
      apiBaseUrl: process.env.REACT_APP_API_URL || 'http://localhost:7071/api/v1',
      useMockAuth: process.env.REACT_APP_MOCK_AUTH === 'true',
      autoRefresh: true,
    };

    authServiceInstance = createNativeAuthService(config || defaultConfig);
  }

  return authServiceInstance;
}

export { BaseAuthService as NativeAuthService };
