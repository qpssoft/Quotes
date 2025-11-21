import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { TrayManager } from './tray';

let mainWindow: BrowserWindow | null = null;
let trayManager: TrayManager | null = null;
let isQuitting = false;

function createWindow(): void {
  console.log('Creating main window...');
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Buddhist Quotes',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js'),
    },
  });

  // Load Angular app
  const rendererPath = path.join(__dirname, '../../renderer/index.html');
  console.log('Loading renderer from:', rendererPath);
  console.log('Renderer exists:', require('fs').existsSync(rendererPath));
  
  mainWindow.loadFile(rendererPath)
    .then(() => console.log('✓ Renderer loaded successfully'))
    .catch((err: Error) => console.error('✗ Failed to load renderer:', err));

  // Open DevTools in development
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    trayManager = null;
  });

  // Handle close button - minimize to tray instead of closing
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
      console.log('Window hidden to tray');
    }
  });

  // Create system tray
  console.log('Creating system tray...');
  trayManager = new TrayManager(mainWindow);
  trayManager.create();
  console.log('✓ System tray created');
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS, recreate window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Before quit, set flag to allow window close
app.on('before-quit', () => {
  isQuitting = true;
});

// Setup IPC handlers for tray menu actions
ipcMain.on('rotation:status', (_event, status: 'playing' | 'paused') => {
  trayManager?.updateStatus(status);
});
