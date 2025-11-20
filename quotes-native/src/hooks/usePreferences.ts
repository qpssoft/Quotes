/**
 * usePreferences Hook
 * Manages user preferences with AsyncStorage persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { UserPreferences, NotificationPosition, KeyboardShortcut } from '@quotes/shared-modules';
import { getStorageService } from '../services/PlatformServiceFactory';

const storageService = getStorageService();
const PREFERENCES_KEY = 'user_preferences';
const FAVORITES_KEY = 'favorites';
const DEVICE_ID_KEY = 'device_id';

// Generate a device ID for Phase 2 (no cloud sync yet)
let cachedDeviceId: string | null = null;

const getDeviceId = async (): Promise<string> => {
  if (cachedDeviceId) return cachedDeviceId;
  
  try {
    const stored = await storageService.getItem(DEVICE_ID_KEY);
    if (stored) {
      cachedDeviceId = stored;
      return stored;
    }
  } catch (error) {
    console.warn('Failed to load device ID from storage');
  }
  
  const deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  try {
    await storageService.setItem(DEVICE_ID_KEY, deviceId);
  } catch (error) {
    console.warn('Failed to save device ID to storage');
  }
  cachedDeviceId = deviceId;
  return deviceId;
};

// Default preferences factory for mobile
const createDefaultPreferences = async (): Promise<UserPreferences> => ({
  userId: await getDeviceId(),
  timerInterval: 15,
  soundEnabled: true,
  hapticEnabled: true, // Mobile default
  backgroundMode: false,
  favorites: [],
  readingHistory: [],
  notificationPosition: NotificationPosition.BottomRight,
  keyboardShortcuts: {
    showQuote: KeyboardShortcut.ShowQuote_CtrlC,
    nextQuote: KeyboardShortcut.NextQuote_CtrlV,
  },
  syncState: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export interface UsePreferencesResult {
  preferences: UserPreferences;
  loading: boolean;
  updateTimerInterval: (seconds: number) => Promise<void>;
  toggleSound: () => Promise<void>;
  toggleHaptic: () => Promise<void>;
  addFavorite: (quoteId: string) => Promise<void>;
  removeFavorite: (quoteId: string) => Promise<void>;
  isFavorite: (quoteId: string) => boolean;
  resetPreferences: () => Promise<void>;
}

export function usePreferences(): UsePreferencesResult {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async (): Promise<void> => {
    try {
      const data = await storageService.getItem(PREFERENCES_KEY);
      
      if (data) {
        const parsed = JSON.parse(data);
        // Convert date strings back to Date objects
        parsed.createdAt = new Date(parsed.createdAt);
        parsed.updatedAt = new Date(parsed.updatedAt);
        setPreferences(parsed);
      } else {
        // Save default preferences on first launch
        const defaultPrefs = await createDefaultPreferences();
        await storageService.setItem(PREFERENCES_KEY, JSON.stringify(defaultPrefs));
        setPreferences(defaultPrefs);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      const defaultPrefs = await createDefaultPreferences();
      setPreferences(defaultPrefs);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (updated: UserPreferences): Promise<void> => {
    try {
      const withTimestamp = {
        ...updated,
        updatedAt: new Date(),
      };
      
      await storageService.setItem(PREFERENCES_KEY, JSON.stringify(withTimestamp));
      setPreferences(withTimestamp);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      throw error;
    }
  };

  // Update timer interval (5-60 seconds)
  const updateTimerInterval = useCallback(async (seconds: number): Promise<void> => {
    if (!preferences) return;
    const clampedInterval = Math.max(5, Math.min(60, seconds));
    await savePreferences({
      ...preferences,
      timerInterval: clampedInterval,
    });
  }, [preferences]);

  // Toggle sound on/off
  const toggleSound = useCallback(async (): Promise<void> => {
    if (!preferences) return;
    await savePreferences({
      ...preferences,
      soundEnabled: !preferences.soundEnabled,
    });
  }, [preferences]);

  // Toggle haptic feedback on/off
  const toggleHaptic = useCallback(async (): Promise<void> => {
    if (!preferences) return;
    await savePreferences({
      ...preferences,
      hapticEnabled: !preferences.hapticEnabled,
    });
  }, [preferences]);

  // Add quote to favorites
  const addFavorite = useCallback(async (quoteId: string): Promise<void> => {
    if (!preferences || preferences.favorites.includes(quoteId)) return;
    
    const updatedFavorites = [...preferences.favorites, quoteId];
    await savePreferences({
      ...preferences,
      favorites: updatedFavorites,
    });
    
    // Also save favorites separately for quick access
    await storageService.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
  }, [preferences]);

  // Remove quote from favorites
  const removeFavorite = useCallback(async (quoteId: string): Promise<void> => {
    if (!preferences) return;
    const updatedFavorites = preferences.favorites.filter(id => id !== quoteId);
    await savePreferences({
      ...preferences,
      favorites: updatedFavorites,
    });
    
    // Also update separate favorites storage
    await storageService.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
  }, [preferences]);

  // Check if quote is favorited
  const isFavorite = useCallback((quoteId: string): boolean => {
    if (!preferences) return false;
    return preferences.favorites.includes(quoteId);
  }, [preferences]);

  // Reset to default preferences
  const resetPreferences = useCallback(async (): Promise<void> => {
    if (!preferences) return;
    const resetPrefs = await createDefaultPreferences();
    resetPrefs.userId = preferences.userId; // Preserve device ID
    resetPrefs.createdAt = preferences.createdAt; // Preserve creation date
    resetPrefs.updatedAt = new Date();
    
    await storageService.setItem(PREFERENCES_KEY, JSON.stringify(resetPrefs));
    setPreferences(resetPrefs);
  }, [preferences]);

  // Return default values while loading
  if (!preferences) {
    return {
      preferences: {
        userId: '',
        timerInterval: 15,
        soundEnabled: true,
        hapticEnabled: true,
        backgroundMode: false,
        favorites: [],
        readingHistory: [],
        notificationPosition: NotificationPosition.BottomRight,
        keyboardShortcuts: {
          showQuote: KeyboardShortcut.ShowQuote_CtrlC,
          nextQuote: KeyboardShortcut.NextQuote_CtrlV,
        },
        syncState: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      loading,
      updateTimerInterval: async () => {},
      toggleSound: async () => {},
      toggleHaptic: async () => {},
      addFavorite: async () => {},
      removeFavorite: async () => {},
      isFavorite: () => false,
      resetPreferences: async () => {},
    };
  }

  return {
    preferences,
    loading,
    updateTimerInterval,
    toggleSound,
    toggleHaptic,
    addFavorite,
    removeFavorite,
    isFavorite,
    resetPreferences,
  };
}
