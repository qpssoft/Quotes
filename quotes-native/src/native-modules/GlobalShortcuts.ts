/**
 * Global Shortcuts Native Module
 * Provides access to system-wide keyboard shortcuts on desktop platforms
 */

import { NativeModules, Platform } from 'react-native';

interface IGlobalShortcutsModule {
  registerShortcut(
    shortcutId: string,
    vKey: number,
    ctrl: boolean,
    shift: boolean,
    alt: boolean
  ): void;
  unregisterShortcut(shortcutId: string): void;
}

const GlobalShortcutsModule: IGlobalShortcutsModule | null =
  Platform.OS === 'windows' && NativeModules.GlobalShortcutsModule
    ? NativeModules.GlobalShortcutsModule
    : null;

export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  cmd?: boolean; // macOS
}

/**
 * Register a global keyboard shortcut
 */
export function registerGlobalShortcut(
  id: string,
  config: ShortcutConfig,
  callback: () => void
): () => void {
  if (!GlobalShortcutsModule) {
    console.warn('Global shortcuts not supported on this platform');
    return () => {};
  }

  // Convert key to virtual key code (simplified, should use proper mapping)
  const vKey = config.key.toUpperCase().charCodeAt(0);

  try {
    GlobalShortcutsModule.registerShortcut(
      id,
      vKey,
      config.ctrl || false,
      config.shift || false,
      config.alt || false
    );
  } catch (error) {
    console.error('Failed to register global shortcut:', error);
  }

  // Return cleanup function
  return () => {
    try {
      GlobalShortcutsModule.unregisterShortcut(id);
    } catch (error) {
      console.error('Failed to unregister global shortcut:', error);
    }
  };
}

/**
 * Check if global shortcuts are supported on this platform
 */
export function isGlobalShortcutsSupported(): boolean {
  return GlobalShortcutsModule !== null;
}

export default GlobalShortcutsModule;
