/**
 * Platform Service Factory
 * Automatically selects the correct service implementation based on the platform
 */

import { Platform } from 'react-native';
import { IStorageService, IAudioService } from '@quotes/shared-modules';
import { NativeStorageService } from './storage/NativeStorageService';
import { WindowsStorageService } from './storage/windows/WindowsStorageService';
import { NativeAudioService } from './audio/NativeAudioService';
import { WindowsAudioService } from './audio/windows/WindowsAudioService';

/**
 * Get the appropriate storage service for the current platform
 */
export function getStorageService(): IStorageService {
  if (Platform.OS === 'windows') {
    return new WindowsStorageService();
  }
  // For iOS, Android, and other platforms
  return new NativeStorageService();
}

/**
 * Get the appropriate audio service for the current platform
 */
export function getAudioService(): IAudioService {
  if (Platform.OS === 'windows') {
    return new WindowsAudioService();
  }
  // For iOS, Android, and other platforms
  return new NativeAudioService();
}

/**
 * Platform types for type safety
 */
export type SupportedPlatform = 'ios' | 'android' | 'windows' | 'macos' | 'web';

/**
 * Check if running on desktop platform
 */
export function isDesktop(): boolean {
  return Platform.OS === 'windows' || Platform.OS === 'macos';
}

/**
 * Check if running on mobile platform
 */
export function isMobile(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}
