/**
 * Windows Storage Service Implementation
 * Uses Windows.Storage.ApplicationData.LocalSettings API for data persistence
 */

import { IStorageService, StorageError } from '@quotes/shared-modules';

export class WindowsStorageService implements IStorageService {
  private readonly storageKey = 'QuotesNative_';

  /**
   * Get LocalSettings from Windows.Storage
   * In React Native Windows, we use a polyfill approach with AsyncStorage
   * For now, using a simple in-memory Map with localStorage backup
   */
  private storage: Map<string, string> = new Map();

  constructor() {
    // Initialize from localStorage if available (Windows UWP has localStorage support)
    if (typeof global !== 'undefined' && typeof (global as any).localStorage !== 'undefined') {
      try {
        const localStorage = (global as any).localStorage;
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(this.storageKey)) {
            const value = localStorage.getItem(key);
            if (value !== null) {
              this.storage.set(key, value);
            }
          }
        });
      } catch (error) {
        console.warn('Failed to initialize from localStorage:', error);
      }
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const fullKey = this.storageKey + key;
      const value = this.storage.get(fullKey);
      return value !== undefined ? value : null;
    } catch (error) {
      throw new StorageError(
        `Failed to get item from Windows storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        key,
        'get'
      );
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      const fullKey = this.storageKey + key;
      this.storage.set(fullKey, value);
      
      // Persist to localStorage if available
      if (typeof global !== 'undefined' && typeof (global as any).localStorage !== 'undefined') {
        (global as any).localStorage.setItem(fullKey, value);
      }
    } catch (error) {
      throw new StorageError(
        `Failed to set item in Windows storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        key,
        'set'
      );
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const fullKey = this.storageKey + key;
      this.storage.delete(fullKey);
      
      // Remove from localStorage if available
      if (typeof global !== 'undefined' && typeof (global as any).localStorage !== 'undefined') {
        (global as any).localStorage.removeItem(fullKey);
      }
    } catch (error) {
      throw new StorageError(
        `Failed to remove item from Windows storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        key,
        'remove'
      );
    }
  }

  async clear(): Promise<void> {
    try {
      // Clear all keys with our prefix
      const keysToDelete = Array.from(this.storage.keys());
      keysToDelete.forEach(key => this.storage.delete(key));
      
      // Clear from localStorage if available
      if (typeof global !== 'undefined' && typeof (global as any).localStorage !== 'undefined') {
        const localStorage = (global as any).localStorage;
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(this.storageKey)) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      throw new StorageError(
        `Failed to clear Windows storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        'clear'
      );
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      // Return keys without the prefix
      return Array.from(this.storage.keys()).map(key => key.replace(this.storageKey, ''));
    } catch (error) {
      throw new StorageError(
        `Failed to get keys from Windows storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        'keys'
      );
    }
  }
}
