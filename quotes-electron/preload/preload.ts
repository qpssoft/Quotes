import { contextBridge, ipcRenderer } from 'electron';

// Define the API surface exposed to renderer
export interface ElectronAPI {
  // Window controls
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
  };
  
  // Tray controls
  tray: {
    setStatus: (status: 'playing' | 'paused') => Promise<void>;
    updateMenu: () => Promise<void>;
  };
  
  // Overlay controls
  overlay: {
    show: (quote: { text: string; author: string }, position: number) => Promise<void>;
    hide: () => Promise<void>;
  };
  
  // Preferences
  prefs: {
    save: (prefs: Record<string, unknown>) => Promise<void>;
    load: () => Promise<Record<string, unknown>>;
  };
  
  // Shortcuts
  shortcuts: {
    register: (shortcut: string, action: string) => Promise<boolean>;
    unregister: (action: string) => Promise<void>;
  };
}

// Expose protected methods to renderer process
const electronAPI: ElectronAPI = {
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  },
  
  tray: {
    setStatus: (status) => ipcRenderer.invoke('tray:set-status', status),
    updateMenu: () => ipcRenderer.invoke('tray:update-menu'),
  },
  
  overlay: {
    show: (quote, position) => ipcRenderer.invoke('overlay:show', quote, position),
    hide: () => ipcRenderer.invoke('overlay:hide'),
  },
  
  prefs: {
    save: (prefs) => ipcRenderer.invoke('prefs:save', prefs),
    load: () => ipcRenderer.invoke('prefs:load'),
  },
  
  shortcuts: {
    register: (shortcut, action) => ipcRenderer.invoke('shortcut:register', shortcut, action),
    unregister: (action) => ipcRenderer.invoke('shortcut:unregister', action),
  },
};

// Expose API to renderer
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Expose development helpers
if (!process.contextIsolated) {
  throw new Error('contextIsolation must be enabled in the BrowserWindow');
}
