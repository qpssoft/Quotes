/**
 * System Tray Native Module
 * Provides access to system tray / notification area on desktop platforms
 */

import { NativeModules, Platform } from 'react-native';

interface ISystemTrayModule {
  showTrayIcon(iconPath: string, tooltip: string): void;
  hideTrayIcon(): void;
  showNotification(title: string, message: string): void;
}

const SystemTrayModule: ISystemTrayModule | null =
  Platform.OS === 'windows' && NativeModules.SystemTrayModule
    ? NativeModules.SystemTrayModule
    : null;

/**
 * Show system tray icon
 */
export function showSystemTray(tooltip: string = 'Buddhist Quotes'): void {
  if (!SystemTrayModule) {
    console.warn('System tray not supported on this platform');
    return;
  }

  try {
    // For now, use a default icon path
    // TODO: Provide actual icon path from assets
    SystemTrayModule.showTrayIcon('', tooltip);
  } catch (error) {
    console.error('Failed to show system tray icon:', error);
  }
}

/**
 * Hide system tray icon
 */
export function hideSystemTray(): void {
  if (!SystemTrayModule) {
    return;
  }

  try {
    SystemTrayModule.hideTrayIcon();
  } catch (error) {
    console.error('Failed to hide system tray icon:', error);
  }
}

/**
 * Show a system notification
 */
export function showSystemNotification(title: string, message: string): void {
  if (!SystemTrayModule) {
    console.warn('System notifications not supported on this platform');
    return;
  }

  try {
    SystemTrayModule.showNotification(title, message);
  } catch (error) {
    console.error('Failed to show system notification:', error);
  }
}

/**
 * Check if system tray is supported on this platform
 */
export function isSystemTraySupported(): boolean {
  return SystemTrayModule !== null;
}

export default SystemTrayModule;
