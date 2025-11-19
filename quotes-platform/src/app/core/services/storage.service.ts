import { Injectable } from '@angular/core';
import { UserPreferences } from '../models';

/**
 * Service for localStorage operations
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly STORAGE_KEY = 'buddhist-quotes-preferences';

  /**
   * Save user preferences to localStorage
   */
  savePreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  /**
   * Load user preferences from localStorage
   */
  loadPreferences(): UserPreferences | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return null;
    }
  }

  /**
   * Clear all preferences
   */
  clearPreferences(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear preferences:', error);
    }
  }

  /**
   * Check if localStorage is available
   */
  isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}
