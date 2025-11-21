# Tasks: Electron Desktop App Implementation

**Feature**: 003-electron-desktop | **Status**: Planning | **Created**: 2025-11-21

This document provides a detailed task breakdown for implementing the Electron desktop application. Tasks are organized by phase with time estimates and dependencies.

## Task Summary

| Phase | Tasks | Estimated Time | Status |
|-------|-------|----------------|--------|
| Phase 0: Setup | 6 tasks | 1-2 days | ⏳ In Progress |
| Phase 1: Core Setup | 5 tasks | 3-5 days | ✅ Complete |
| Phase 2: System Tray | 4 tasks | 2-3 days | ⏸️ Pending |
| Phase 3: Shortcuts | 4 tasks | 2-3 days | ⏸️ Pending |
| Phase 4: Overlay | 5 tasks | 3-4 days | ⏸️ Pending |
| Phase 5: Desktop Features | 4 tasks | 2-3 days | ⏸️ Pending |
| Phase 6: Settings | 4 tasks | 2-3 days | ⏸️ Pending |
| Phase 7: Packaging | 5 tasks | 3-4 days | ⏸️ Pending |
| Phase 8: Testing | 5 tasks | 2-3 days | ⏸️ Pending |
| **TOTAL** | **42 tasks** | **20-30 days** | **14% Complete** |

---

## Phase 0: Setup & Research (1-2 days)

**Goal**: Create specification, plan, and research documents

### T001: Create Spec Directory ✅
- **Description**: Create `specs/003-electron-desktop/` directory structure
- **Effort**: 5 minutes
- **Dependencies**: None
- **Files**: 
  - `specs/003-electron-desktop/` (directory)
- **Status**: ✅ Complete

### T002: Write Feature Specification ✅
- **Description**: Write `spec.md` with user stories, requirements, success criteria
- **Effort**: 2-3 hours
- **Dependencies**: T001
- **Files**:
  - `specs/003-electron-desktop/spec.md`
- **Status**: ✅ Complete

### T003: Write Implementation Plan ✅
- **Description**: Write `plan.md` with phases, architecture, timeline
- **Effort**: 2-3 hours
- **Dependencies**: T002
- **Files**:
  - `specs/003-electron-desktop/plan.md`
- **Status**: ✅ Complete

### T004: Write Tasks Breakdown
- **Description**: Write `tasks.md` (this file) with detailed task list
- **Effort**: 1-2 hours
- **Dependencies**: T003
- **Files**:
  - `specs/003-electron-desktop/tasks.md`
- **Status**: ⏳ In Progress

### T005: Write Research Document
- **Description**: Research Electron architecture, IPC patterns, best practices
- **Effort**: 2-3 hours
- **Dependencies**: None (parallel with T002-T004)
- **Files**:
  - `specs/003-electron-desktop/research.md`
- **Topics**:
  - Electron process model (main vs renderer)
  - IPC communication patterns
  - Context isolation and security
  - System tray APIs
  - Global shortcuts APIs
  - Overlay window techniques
  - Auto-update mechanisms
  - Packaging with electron-builder
- **Status**: ⏸️ Pending

### T006: Create Checklists
- **Description**: Create UX, security, and testing checklists
- **Effort**: 1 hour
- **Dependencies**: T002
- **Files**:
  - `specs/003-electron-desktop/checklists/ux.md`
  - `specs/003-electron-desktop/checklists/security.md`
  - `specs/003-electron-desktop/checklists/testing.md`
- **Status**: ⏸️ Pending

**Phase 0 Deliverables**:
- ✅ Feature specification complete
- ✅ Implementation plan complete
- ⏳ Tasks breakdown complete
- ⏸️ Research document
- ⏸️ Checklists

---

## Phase 1: Core Electron Setup (3-5 days)

**Goal**: Basic Electron app that wraps Angular app

### T101: Initialize Electron Project
- **Description**: Create project structure and install dependencies
- **Effort**: 30 minutes
- **Dependencies**: Phase 0 complete
- **Steps**:
  1. Create `quotes-electron/` directory
  2. Initialize npm: `npm init -y`
  3. Install Electron: `npm install --save-dev electron@^28.0.0`
  4. Install TypeScript: `npm install --save-dev typescript@^5.0.0 @types/node`
  5. Install electron-builder: `npm install --save-dev electron-builder@^24.0.0`
  6. Create `tsconfig.json` with strict mode
  7. Setup build scripts in package.json
- **Files**:
  - `quotes-electron/package.json`
  - `quotes-electron/tsconfig.json`
  - `quotes-electron/.gitignore`
- **Verification**: `npm install` succeeds, TypeScript compiles
- **Status**: ✅ Complete

### T102: Create Main Process ✅
- **Description**: Create Electron main process entry point
- **Effort**: 2-3 hours
- **Dependencies**: T101
- **Steps**:
  1. Create `main/main.ts`
  2. Import electron modules: `app`, `BrowserWindow`
  3. Setup app lifecycle:
     - `app.whenReady()` - create window
     - `app.on('window-all-closed')` - quit on Windows/Linux
     - `app.on('activate')` - recreate window on macOS
  4. Create BrowserWindow:
     - Width: 1200px, Height: 800px
     - Min width: 800px, Min height: 600px
     - Title: "Buddhist Quotes"
     - webPreferences: nodeIntegration: false, contextIsolation: true
  5. Load Angular app from file://
  6. Add TypeScript build script
- **Files**:
  - `main/main.ts`
  - `dist/main.js` (compiled)
- **Verification**: `npm run dev` launches empty Electron window
- **Status**: ✅ Complete

### T103: Create Preload Script ✅
- **Description**: Create preload script with context bridge
- **Effort**: 1-2 hours
- **Dependencies**: T102
- **Steps**:
  1. Create `preload/preload.ts`
  2. Import `contextBridge`, `ipcRenderer`
  3. Define `electronAPI` interface:
     ```typescript
     interface ElectronAPI {
       window: {
         minimize: () => void;
         maximize: () => void;
         close: () => void;
       };
       platform: string; // 'win32' | 'darwin' | 'linux'
     }
     ```
  4. Expose API via contextBridge
  5. Add preload script to BrowserWindow webPreferences
  6. Create TypeScript declarations for renderer
- **Files**:
  - `preload/preload.ts`
  - `preload/electron-api.d.ts`
  - `dist/preload.js` (compiled)
- **Verification**: `window.electronAPI` accessible in renderer
- **Status**: ✅ Complete

### T104: Angular App Integration ✅
- **Description**: Load Angular app in Electron window
- **Effort**: 1-2 hours
- **Dependencies**: T103
- **Steps**:
  1. Build Angular app: `cd quotes-platform && npm run build`
  2. Create symlink: `quotes-electron/renderer → quotes-platform/dist/quotes-platform/browser`
  3. Update main.ts to load `renderer/index.html`
  4. Test Angular app loads correctly
  5. Verify all features work (quotes, search, rotation)
  6. Test navigation, routing
  7. Check console for errors
- **Files**:
  - `renderer/` (symlink to Angular dist)
- **Verification**: Angular app fully functional in Electron
- **Status**: ✅ Complete

### T105: Development Setup ✅
- **Description**: Setup dev mode with hot reload
- **Effort**: 1-2 hours
- **Dependencies**: T104
- **Steps**:
  1. Install dev dependencies: `npm install --save-dev concurrently electron-reloader`
  2. Create `scripts/dev.js`:
     - Start Angular dev server (ng serve)
     - Start Electron in dev mode
     - Watch main process for changes
  3. Update main.ts to load `http://localhost:4200` in dev
  4. Add `dev` script to package.json
  5. Configure VS Code launch.json for debugging
  6. Test hot reload for main process
  7. Test hot reload for Angular app
- **Files**:
  - `scripts/dev.js`
  - `.vscode/launch.json`
  - `package.json` (updated scripts)
- **Verification**: `npm run dev` starts app with hot reload
- **Status**: ✅ Complete

**Phase 1 Deliverables**:
- ✅ Electron app launches successfully
- ✅ Angular app loads and functions correctly
- ✅ Dev mode with development scripts working
- ✅ Basic window management functional
- ✅ Context isolation and security enabled
- ✅ Build and packaging configuration complete

---

## Phase 2: System Tray Integration (2-3 days)

**Goal**: Minimize to system tray with context menu

### T201: Create Tray Manager
- **Description**: Implement system tray icon and basic functionality
- **Effort**: 2-3 hours
- **Dependencies**: Phase 1 complete
- **Steps**:
  1. Create tray icons:
     - `assets/tray-icon.png` (16x16)
     - `assets/tray-icon@2x.png` (32x32)
     - `assets/tray-icon.ico` (Windows)
  2. Create `main/tray.ts`:
     ```typescript
     export class TrayManager {
       private tray: Tray | null = null;
       
       create(window: BrowserWindow): void {
         // Create tray with icon
         // Set tooltip
         // Handle click event
       }
       
       destroy(): void { /* ... */ }
     }
     ```
  3. Initialize tray in main.ts after window creation
  4. Handle tray click: show/hide window
  5. Test on Windows, macOS, Linux
- **Files**:
  - `main/tray.ts`
  - `assets/tray-icon.*`
- **Verification**: Tray icon appears, click shows/hides window
- **Status**: ⏸️ Pending

### T202: Tray Context Menu
- **Description**: Add context menu to tray icon
- **Effort**: 2 hours
- **Dependencies**: T201
- **Steps**:
  1. Update tray.ts with menu:
     ```typescript
     const menu = Menu.buildFromTemplate([
       { label: 'Show Window', click: () => window.show() },
       { type: 'separator' },
       { label: 'Pause Rotation', id: 'pause', click: handlePause },
       { label: 'Next Quote', click: handleNext },
       { type: 'separator' },
       { label: 'Settings', click: () => showSettings() },
       { type: 'separator' },
       { label: 'Quit', click: () => app.quit() }
     ]);
     tray.setContextMenu(menu);
     ```
  2. Implement menu handlers (IPC to renderer)
  3. Add updateMenu() method to change pause/resume text
  4. Listen for rotation state changes from renderer
  5. Update menu dynamically
- **Files**:
  - `main/tray.ts` (updated)
  - `main/ipc-handlers.ts` (new)
- **Verification**: Right-click tray shows menu, all actions work
- **Status**: ⏸️ Pending

### T203: Window Hide to Tray
- **Description**: Minimize to tray instead of taskbar
- **Effort**: 1-2 hours
- **Dependencies**: T202
- **Steps**:
  1. Intercept window 'close' event in main.ts:
     ```typescript
     window.on('close', (event) => {
       if (settings.minimizeToTray && !app.isQuitting) {
         event.preventDefault();
         window.hide();
       }
     });
     ```
  2. Add 'before-quit' handler to set `app.isQuitting = true`
  3. Add "Minimize to tray" preference
  4. Show notification on first minimize (optional)
  5. Test close button behavior
  6. Test Quit from tray menu
- **Files**:
  - `main/main.ts` (updated)
  - `main/store.ts` (preferences)
- **Verification**: Closing window hides to tray, Quit actually quits
- **Status**: ⏸️ Pending

### T204: Cross-Platform Testing
- **Description**: Test tray on Windows, macOS, Linux
- **Effort**: 1-2 hours
- **Dependencies**: T203
- **Steps**:
  1. Test on Windows 10/11:
     - Tray icon in system tray
     - Right-click menu
     - Click to show/hide
  2. Test on macOS 13+:
     - Menu bar icon
     - Icon positioning
     - Right-click menu
  3. Test on Linux (Ubuntu):
     - System tray icon
     - Icon theme compatibility
  4. Fix platform-specific issues
  5. Document platform differences
- **Files**:
  - `docs/platform-notes.md` (new)
- **Verification**: Tray works correctly on all 3 platforms
- **Status**: ⏸️ Pending

**Phase 2 Deliverables**:
- System tray icon on all platforms
- Context menu with all actions
- Window hides to tray on close
- Platform-specific behaviors handled

---

## Phase 3: Global Keyboard Shortcuts (2-3 days)

**Goal**: Register and handle global shortcuts

### T301: Shortcuts Manager
- **Description**: Implement global keyboard shortcut registration
- **Effort**: 2-3 hours
- **Dependencies**: Phase 2 complete
- **Steps**:
  1. Create `main/shortcuts.ts`:
     ```typescript
     export class ShortcutsManager {
       register(mainWindow: BrowserWindow): void {
         globalShortcut.register('CommandOrControl+Shift+Q', () => {
           // Toggle overlay
         });
         globalShortcut.register('CommandOrControl+Shift+N', () => {
           // Next quote
         });
         globalShortcut.register('CommandOrControl+Shift+P', () => {
           // Pause/resume
         });
       }
       
       unregister(): void { /* ... */ }
     }
     ```
  2. Initialize shortcuts in main.ts after app ready
  3. Handle shortcut conflicts (warn in console)
  4. Unregister shortcuts on app quit
  5. Test shortcuts work outside app focus
- **Files**:
  - `main/shortcuts.ts`
- **Verification**: Shortcuts trigger actions globally
- **Status**: ⏸️ Pending

### T302: IPC Communication
- **Description**: Connect shortcuts to renderer actions via IPC
- **Effort**: 2 hours
- **Dependencies**: T301
- **Steps**:
  1. Add IPC channels in preload.ts:
     ```typescript
     shortcuts: {
       onToggleOverlay: (callback) => ipcRenderer.on('shortcut:toggle-overlay', callback),
       onNextQuote: (callback) => ipcRenderer.on('shortcut:next-quote', callback),
       onPauseResume: (callback) => ipcRenderer.on('shortcut:pause-resume', callback)
     }
     ```
  2. Send IPC events from shortcuts handlers
  3. Update Angular app to listen for shortcut events:
     - Add ElectronService in Angular
     - Listen for IPC events
     - Trigger appropriate actions (rotation, overlay, etc.)
  4. Test IPC communication
- **Files**:
  - `preload/preload.ts` (updated)
  - `quotes-platform/src/app/services/electron.service.ts` (new)
- **Verification**: Shortcuts trigger actions in Angular app
- **Status**: ⏸️ Pending

### T303: Configurable Shortcuts
- **Description**: Allow users to customize keyboard shortcuts
- **Effort**: 2-3 hours
- **Dependencies**: T302
- **Steps**:
  1. Add shortcuts preferences schema:
     ```typescript
     interface ShortcutPrefs {
       toggleOverlay: string; // 'CommandOrControl+Shift+Q'
       nextQuote: string;
       pauseResume: string;
     }
     ```
  2. Update shortcuts.ts to use dynamic shortcuts
  3. Add shortcuts configuration UI in Angular settings
  4. Validate shortcuts (no conflicts, valid key combos)
  5. Save shortcuts to preferences
  6. Re-register shortcuts when changed
  7. Add reset to defaults button
- **Files**:
  - `main/shortcuts.ts` (updated)
  - `main/store.ts` (updated schema)
  - Angular settings component (updated)
- **Verification**: Users can customize all shortcuts
- **Status**: ⏸️ Pending

### T304: Shortcut Testing
- **Description**: Comprehensive shortcut testing
- **Effort**: 1 hour
- **Dependencies**: T303
- **Steps**:
  1. Test default shortcuts on all platforms
  2. Test custom shortcuts (10+ combinations)
  3. Test shortcut conflicts (with other apps)
  4. Test shortcuts while app is focused
  5. Test shortcuts while app is in background
  6. Test shortcuts with modifier keys (Ctrl, Shift, Alt, Cmd)
  7. Document known limitations (platform-specific)
- **Files**:
  - Test notes document
- **Verification**: All shortcuts work reliably
- **Status**: ⏸️ Pending

**Phase 3 Deliverables**:
- Global shortcuts registered and functional
- IPC communication between shortcuts and renderer
- Customizable shortcuts with validation
- Shortcuts tested on all platforms

---

## Phase 4: Quote Overlay Window (3-4 days)

**Goal**: Floating overlay window for quote notifications

### T401: Overlay Window Manager
- **Description**: Create frameless overlay window
- **Effort**: 2-3 hours
- **Dependencies**: Phase 3 complete
- **Steps**:
  1. Create `main/overlay.ts`:
     ```typescript
     export class OverlayManager {
       private window: BrowserWindow | null = null;
       
       create(): void {
         this.window = new BrowserWindow({
           width: 400,
           height: 200,
           frame: false,
           transparent: true,
           alwaysOnTop: true,
           skipTaskbar: true,
           resizable: false,
           webPreferences: { /* ... */ }
         });
       }
       
       show(quote: Quote, position: Position): void { /* ... */ }
       hide(): void { /* ... */ }
     }
     ```
  2. Create overlay on app start (hidden)
  3. Load overlay HTML template
  4. Test frameless transparent window
- **Files**:
  - `main/overlay.ts`
  - `renderer/overlay.html` (simple template)
- **Verification**: Overlay window created, transparent, always-on-top
- **Status**: ⏸️ Pending

### T402: Overlay Positioning
- **Description**: Implement 9-position grid for overlay placement
- **Effort**: 2-3 hours
- **Dependencies**: T401
- **Steps**:
  1. Define Position enum:
     ```typescript
     enum Position {
       TOP_LEFT, TOP_CENTER, TOP_RIGHT,
       MIDDLE_LEFT, MIDDLE_CENTER, MIDDLE_RIGHT,
       BOTTOM_LEFT, BOTTOM_CENTER, BOTTOM_RIGHT
     }
     ```
  2. Implement calculatePosition():
     ```typescript
     function calculatePosition(pos: Position, bounds: Rectangle): Point {
       const display = screen.getDisplayMatching(bounds);
       const { width, height } = display.workArea;
       // Calculate x,y based on position enum
       return { x, y };
     }
     ```
  3. Handle multi-monitor setups (use primary display or window's display)
  4. Add position preference (default: TOP_RIGHT)
  5. Test all 9 positions
  6. Test multi-monitor positioning
- **Files**:
  - `main/overlay.ts` (updated)
  - `main/store.ts` (position preference)
- **Verification**: Overlay appears at correct position in all 9 positions
- **Status**: ⏸️ Pending

### T403: Overlay Content
- **Description**: Display quote content in overlay
- **Effort**: 2-3 hours
- **Dependencies**: T402
- **Steps**:
  1. Create overlay template:
     ```html
     <div class="overlay-container">
       <div class="quote-content">{{ content }}</div>
       <div class="quote-author">- {{ author }}</div>
     </div>
     ```
  2. Add IPC channel to update overlay content:
     ```typescript
     ipcMain.on('overlay:update-content', (event, quote) => {
       overlay.webContents.send('quote-data', quote);
     });
     ```
  3. Style overlay (semi-transparent, minimal, readable)
  4. Add fade-in/fade-out animations
  5. Test with long quotes (text wrapping, max height)
  6. Test with Vietnamese characters
- **Files**:
  - `renderer/overlay.html` (updated)
  - `renderer/overlay.css` (new)
  - `main/overlay.ts` (IPC handlers)
- **Verification**: Overlay displays quotes correctly with styling
- **Status**: ⏸️ Pending

### T404: Overlay Triggers
- **Description**: Trigger overlay from multiple sources
- **Effort**: 1-2 hours
- **Dependencies**: T403
- **Steps**:
  1. Trigger on rotation timer (from Angular app)
  2. Trigger on global shortcut (Ctrl+Shift+Q)
  3. Trigger on tray menu action
  4. Trigger on Next Quote button
  5. Add overlay enable/disable toggle in settings
  6. Add auto-dismiss timer (5-30s configurable)
  7. Test all trigger sources
- **Files**:
  - `main/overlay.ts` (updated triggers)
  - `main/ipc-handlers.ts` (IPC handlers)
  - Angular components (trigger calls)
- **Verification**: Overlay triggers from all sources
- **Status**: ⏸️ Pending

### T405: Overlay Testing
- **Description**: Comprehensive overlay testing
- **Effort**: 1-2 hours
- **Dependencies**: T404
- **Steps**:
  1. Test all 9 positions on primary monitor
  2. Test multi-monitor positioning (2-3 monitors)
  3. Test auto-dismiss timer (5s, 15s, 30s)
  4. Test click-to-dismiss
  5. Test click-through option (optional)
  6. Test overlay with different quote lengths
  7. Test overlay animation performance
  8. Test overlay on all platforms (Windows, macOS, Linux)
- **Files**:
  - Test notes document
- **Verification**: Overlay works perfectly on all platforms
- **Status**: ⏸️ Pending

**Phase 4 Deliverables**:
- Overlay window functional with 9 positions
- Quote content displayed correctly
- Auto-dismiss timer working
- Triggers from shortcuts, tray, rotation
- Multi-monitor support

---

## Phase 5: Desktop Features (2-3 days)

**Goal**: Auto-launch, always-on-top, application menu

### T501: Auto-Launch on Startup
- **Description**: Enable app to launch on system startup
- **Effort**: 2-3 hours
- **Dependencies**: Phase 4 complete
- **Steps**:
  1. Implement auto-launch using `app.setLoginItemSettings()`:
     ```typescript
     function setAutoLaunch(enabled: boolean): void {
       app.setLoginItemSettings({
         openAtLogin: enabled,
         openAsHidden: true // Start minimized to tray
       });
     }
     ```
  2. Add auto-launch toggle in settings
  3. Save preference to store
  4. Test on Windows (registry)
  5. Test on macOS (Login Items)
  6. Test on Linux (.desktop file in autostart)
  7. Verify app starts minimized to tray
- **Files**:
  - `main/main.ts` (auto-launch logic)
  - `main/store.ts` (preference)
  - Angular settings (toggle UI)
- **Verification**: Auto-launch works on all platforms
- **Status**: ⏸️ Pending

### T502: Always-on-Top Mode
- **Description**: Keep window on top of all others
- **Effort**: 1 hour
- **Dependencies**: Phase 4 complete (parallel with T501)
- **Steps**:
  1. Add `window.setAlwaysOnTop(enabled)` method
  2. Add toolbar button or menu item to toggle
  3. Add visual indicator when enabled (icon in title bar)
  4. Save always-on-top state to preferences
  5. Restore state on app restart
  6. Test on all platforms
- **Files**:
  - `main/main.ts` (always-on-top logic)
  - `main/ipc-handlers.ts` (IPC handler)
  - Angular toolbar component (toggle button)
- **Verification**: Window stays on top when enabled
- **Status**: ⏸️ Pending

### T503: Application Menu
- **Description**: Create native application menu
- **Effort**: 2-3 hours
- **Dependencies**: Phase 4 complete (parallel with T501-T502)
- **Steps**:
  1. Create `main/menu.ts`:
     ```typescript
     const template: MenuItemConstructorOptions[] = [
       {
         label: 'File',
         submenu: [
           { label: 'Preferences', accelerator: 'CmdOrCtrl+,', click: showSettings },
           { type: 'separator' },
           { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
         ]
       },
       {
         label: 'Edit',
         submenu: [
           { role: 'copy' },
           { role: 'selectAll' }
         ]
       },
       {
         label: 'View',
         submenu: [
           { role: 'resetZoom' },
           { role: 'zoomIn' },
           { role: 'zoomOut' },
           { type: 'separator' },
           { role: 'togglefullscreen' }
         ]
       },
       {
         label: 'Window',
         submenu: [
           { role: 'minimize' },
           { label: 'Always on Top', type: 'checkbox', click: toggleAlwaysOnTop }
         ]
       },
       {
         role: 'help',
         submenu: [
           { label: 'Documentation', click: openDocs },
           { label: 'Check for Updates', click: checkUpdates },
           { type: 'separator' },
           { label: 'About', click: showAbout }
         ]
       }
     ];
     ```
  2. Add macOS-specific app menu (first item)
  3. Set menu in main.ts: `Menu.setApplicationMenu(menu)`
  4. Implement menu action handlers
  5. Test on all platforms
- **Files**:
  - `main/menu.ts`
  - `main/main.ts` (set menu)
- **Verification**: Application menu works on all platforms
- **Status**: ⏸️ Pending

### T504: Window State Persistence
- **Description**: Save and restore window size, position, state
- **Effort**: 1-2 hours
- **Dependencies**: T501-T503
- **Steps**:
  1. Save window state on close:
     ```typescript
     const bounds = window.getBounds();
     const display = screen.getDisplayMatching(bounds);
     store.set('windowState', {
       x: bounds.x,
       y: bounds.y,
       width: bounds.width,
       height: bounds.height,
       isMaximized: window.isMaximized(),
       displayId: display.id,
       alwaysOnTop: window.isAlwaysOnTop()
     });
     ```
  2. Restore window state on launch
  3. Handle missing display (monitor unplugged)
  4. Validate bounds are within visible screen area
  5. Test multi-monitor save/restore
- **Files**:
  - `main/main.ts` (save/restore logic)
  - `main/store.ts` (window state schema)
- **Verification**: Window state persists correctly
- **Status**: ⏸️ Pending

**Phase 5 Deliverables**:
- Auto-launch on startup working
- Always-on-top mode functional
- Application menu with all items
- Window state persistence

---

## Phase 6: Settings & Preferences (2-3 days)

**Goal**: Complete Electron-specific settings UI

### T601: Preferences Storage
- **Description**: Define and implement preferences storage
- **Effort**: 2-3 hours
- **Dependencies**: Phase 5 complete
- **Steps**:
  1. Create `main/store.ts` with electron-store or JSON file:
     ```typescript
     interface ElectronPreferences {
       systemTray: {
         enabled: boolean;
         showOnClose: boolean;
       };
       shortcuts: {
         toggleOverlay: string;
         nextQuote: string;
         pauseResume: string;
       };
       overlay: {
         enabled: boolean;
         position: Position;
         duration: number; // seconds
         transparency: number; // 0-100
       };
       autoLaunch: {
         enabled: boolean;
         startMinimized: boolean;
       };
       window: {
         alwaysOnTop: boolean;
       };
       updates: {
         checkAutomatically: boolean;
       };
     }
     ```
  2. Implement Store class with get/set/reset methods
  3. Add IPC handlers for preferences:
     - `prefs:load` → returns all preferences
     - `prefs:save` → saves preferences
     - `prefs:reset` → resets to defaults
  4. Validate preferences on save
  5. Emit preference change events
- **Files**:
  - `main/store.ts`
  - `main/ipc-handlers.ts` (IPC handlers)
- **Verification**: Preferences save/load correctly
- **Status**: ⏸️ Pending

### T602: Settings UI in Angular
- **Description**: Add Electron settings section in Angular app
- **Effort**: 3-4 hours
- **Dependencies**: T601
- **Steps**:
  1. Detect Electron environment:
     ```typescript
     const isElectron = typeof window.electronAPI !== 'undefined';
     ```
  2. Add Desktop tab in settings screen:
     - **System Tray** section:
       - Enable tray checkbox
       - "Close to tray" checkbox
     - **Keyboard Shortcuts** section:
       - Toggle overlay input (with recorder)
       - Next quote input
       - Pause/resume input
       - Validation for conflicts
     - **Quote Overlay** section:
       - Enable overlay checkbox
       - Position selector (9-grid visual)
       - Duration slider (5-30s)
       - Transparency slider (50-100%)
     - **Startup** section:
       - Auto-launch checkbox
       - Start minimized checkbox
     - **Window** section:
       - Always on top checkbox
     - **Updates** section:
       - Check automatically checkbox
       - Check now button
  3. Connect UI to IPC handlers
  4. Show/hide Desktop settings based on platform
  5. Add reset to defaults button
  6. Test all settings controls
- **Files**:
  - `quotes-platform/src/app/features/settings/desktop-settings.component.ts` (new)
  - `quotes-platform/src/app/features/settings/desktop-settings.component.html`
  - `quotes-platform/src/app/services/electron.service.ts` (updated)
- **Verification**: All Electron settings accessible in Angular UI
- **Status**: ⏸️ Pending

### T603: Preferences IPC
- **Description**: Complete IPC communication for preferences
- **Effort**: 1-2 hours
- **Dependencies**: T602
- **Steps**:
  1. Add preload API for preferences:
     ```typescript
     preferences: {
       load: () => ipcRenderer.invoke('prefs:load'),
       save: (prefs) => ipcRenderer.invoke('prefs:save', prefs),
       reset: () => ipcRenderer.invoke('prefs:reset'),
       onChange: (callback) => ipcRenderer.on('prefs:changed', callback)
     }
     ```
  2. Implement IPC handlers in main process
  3. Emit change events when preferences updated
  4. Update main process state on preference changes:
     - Re-register shortcuts if changed
     - Update tray menu if changed
     - Update overlay settings if changed
     - Update auto-launch if changed
  5. Test preference synchronization
- **Files**:
  - `preload/preload.ts` (updated)
  - `main/ipc-handlers.ts` (updated)
- **Verification**: Preferences sync between renderer and main
- **Status**: ⏸️ Pending

### T604: Settings Testing
- **Description**: Comprehensive settings testing
- **Effort**: 1-2 hours
- **Dependencies**: T603
- **Steps**:
  1. Test all preference options (save/load)
  2. Test persistence across app restarts
  3. Test preference validation (invalid shortcuts, etc.)
  4. Test default values on first launch
  5. Test reset to defaults
  6. Test preference change propagation (UI → main process)
  7. Test on all platforms (Windows, macOS, Linux)
- **Files**:
  - Test notes document
- **Verification**: All settings work correctly
- **Status**: ⏸️ Pending

**Phase 6 Deliverables**:
- Preferences storage implemented
- Complete Desktop settings UI in Angular
- IPC communication for preferences
- Settings tested and validated

---

## Phase 7: Packaging & Distribution (3-4 days)

**Goal**: Package app for Windows, macOS, Linux

### T701: Electron Builder Configuration
- **Description**: Configure electron-builder for packaging
- **Effort**: 2-3 hours
- **Dependencies**: Phase 6 complete
- **Steps**:
  1. Create `electron-builder.yml`:
     ```yaml
     appId: com.buddhist.quotes
     productName: Buddhist Quotes
     copyright: Copyright © 2025
     
     directories:
       output: dist
       buildResources: assets
     
     files:
       - dist/**/*
       - renderer/**/*
       - package.json
     
     mac:
       category: public.app-category.lifestyle
       target:
         - dmg
         - zip
       icon: assets/icon.icns
     
     win:
       target:
         - nsis
         - portable
       icon: assets/icon.ico
     
     linux:
       target:
         - AppImage
       icon: assets/icon.png
       category: Utility
     
     nsis:
       oneClick: false
       allowToChangeInstallationDirectory: true
     ```
  2. Create app icons (512x512, .ico, .icns)
  3. Add build scripts to package.json:
     - `build:win`
     - `build:mac`
     - `build:linux`
  4. Test build process (locally)
- **Files**:
  - `electron-builder.yml`
  - `assets/icon.*`
  - `package.json` (build scripts)
- **Verification**: `npm run build:win` creates installer
- **Status**: ⏸️ Pending

### T702: Windows Packaging
- **Description**: Build and test Windows installers
- **Effort**: 2-3 hours
- **Dependencies**: T701
- **Steps**:
  1. Build NSIS installer: `npm run build:win`
  2. Test installation on Windows 10:
     - Install to Program Files
     - Verify start menu shortcut
     - Verify desktop shortcut (if enabled)
     - Test app launch
  3. Test portable executable:
     - Extract and run
     - Verify no installation required
     - Test app functionality
  4. Test Windows 11
  5. Add code signing (optional, requires certificate):
     - Purchase code signing certificate
     - Configure electron-builder
     - Sign executables
  6. Test auto-update mechanism (GitHub Releases)
- **Files**:
  - `dist/Buddhist Quotes Setup.exe`
  - `dist/Buddhist Quotes.exe` (portable)
- **Verification**: Installers work on Windows 10/11
- **Status**: ⏸️ Pending

### T703: macOS Packaging
- **Description**: Build and test macOS installer
- **Effort**: 2-3 hours
- **Dependencies**: T701
- **Steps**:
  1. Build DMG: `npm run build:mac`
  2. Test on macOS 13+ Intel:
     - Mount DMG
     - Drag to Applications
     - Launch app
     - Test all features
  3. Test on macOS 13+ Apple Silicon (M1/M2):
     - Verify universal binary or separate arm64 build
     - Test Rosetta compatibility if Intel-only
  4. Add code signing (optional, requires Apple Developer):
     - Enroll in Apple Developer Program ($99/year)
     - Create signing certificate
     - Configure electron-builder
     - Sign app
  5. Add notarization (optional, required for distribution):
     - Configure notarization credentials
     - Add notarize script
     - Verify notarized app
  6. Test auto-update mechanism
- **Files**:
  - `dist/Buddhist Quotes.dmg`
- **Verification**: DMG works on macOS 13+ (Intel + Apple Silicon)
- **Status**: ⏸️ Pending

### T704: Linux Packaging
- **Description**: Build and test Linux packages
- **Effort**: 2 hours
- **Dependencies**: T701
- **Steps**:
  1. Build AppImage: `npm run build:linux`
  2. Test on Ubuntu 20.04+:
     - Make AppImage executable
     - Run AppImage
     - Test all features
  3. Build .deb package (optional):
     - Add deb target to electron-builder
     - Build deb
     - Install with `dpkg -i`
     - Test installation
  4. Test on other distros (Fedora, Arch) if possible
  5. Test auto-update mechanism (if AppImage supports)
- **Files**:
  - `dist/Buddhist Quotes.AppImage`
  - `dist/buddhist-quotes.deb` (optional)
- **Verification**: AppImage runs on Ubuntu 20.04+
- **Status**: ⏸️ Pending

### T705: Auto-Update Setup
- **Description**: Configure electron-updater for automatic updates
- **Effort**: 2-3 hours
- **Dependencies**: T702-T704
- **Steps**:
  1. Install electron-updater: `npm install electron-updater`
  2. Create `main/updater.ts`:
     ```typescript
     import { autoUpdater } from 'electron-updater';
     
     export function setupUpdater(): void {
       autoUpdater.checkForUpdatesAndNotify();
       
       autoUpdater.on('update-available', (info) => {
         // Notify user
       });
       
       autoUpdater.on('update-downloaded', (info) => {
         // Prompt user to restart
       });
     }
     ```
  3. Configure update server (GitHub Releases):
     - Add publish config to electron-builder.yml
     - Create GitHub release workflow
  4. Add update notification UI in Angular
  5. Test update flow:
     - Publish v1.0.0
     - Launch app
     - Publish v1.0.1
     - Verify update notification appears
     - Install update
     - Verify app restarts to v1.0.1
- **Files**:
  - `main/updater.ts`
  - `electron-builder.yml` (publish config)
  - `.github/workflows/release.yml` (GitHub Actions)
- **Verification**: Auto-update works on all platforms
- **Status**: ⏸️ Pending

**Phase 7 Deliverables**:
- Windows installer (.exe) and portable
- macOS installer (.dmg)
- Linux package (.AppImage)
- Auto-update mechanism functional
- All packages tested on target platforms

---

## Phase 8: Testing & Polish (2-3 days)

**Goal**: Comprehensive testing, bug fixes, documentation

### T801: Unit Testing
- **Description**: Write unit tests for main process
- **Effort**: 3-4 hours
- **Dependencies**: Phase 7 complete (can run parallel)
- **Steps**:
  1. Setup Jest for Electron:
     ```bash
     npm install --save-dev jest @types/jest ts-jest
     ```
  2. Create jest.config.js for main process
  3. Write tests:
     - `main/tray.test.ts` - tray creation, menu, click handlers
     - `main/shortcuts.test.ts` - shortcut registration, handlers
     - `main/overlay.test.ts` - window creation, positioning, content
     - `main/store.test.ts` - preferences save/load/validate
  4. Run tests: `npm test`
  5. Achieve >80% code coverage
  6. Fix any failing tests
- **Files**:
  - `__tests__/main/*.test.ts`
  - `jest.config.js`
  - `package.json` (test script)
- **Verification**: All unit tests passing, >80% coverage
- **Status**: ⏸️ Pending

### T802: E2E Testing
- **Description**: Write end-to-end tests with Playwright
- **Effort**: 3-4 hours
- **Dependencies**: Phase 7 complete (parallel with T801)
- **Steps**:
  1. Install Playwright: `npm install --save-dev @playwright/test`
  2. Configure Playwright for Electron:
     ```typescript
     import { test, _electron as electron } from '@playwright/test';
     
     test('app launches', async () => {
       const app = await electron.launch({ args: ['main.js'] });
       const window = await app.firstWindow();
       expect(await window.title()).toBe('Buddhist Quotes');
       await app.close();
     });
     ```
  3. Write E2E tests:
     - `__tests__/e2e/app-launch.spec.ts` - app launches, window appears
     - `__tests__/e2e/tray-menu.spec.ts` - tray menu actions
     - `__tests__/e2e/shortcuts.spec.ts` - global shortcuts (mocked)
     - `__tests__/e2e/overlay.spec.ts` - overlay window positioning
     - `__tests__/e2e/preferences.spec.ts` - settings save/load
  4. Setup CI for E2E tests (GitHub Actions)
  5. Run tests locally on all platforms
- **Files**:
  - `__tests__/e2e/*.spec.ts`
  - `playwright.config.ts`
  - `.github/workflows/test.yml`
- **Verification**: All E2E tests passing
- **Status**: ⏸️ Pending

### T803: Manual Testing
- **Description**: Manual testing on physical devices
- **Effort**: 4-6 hours
- **Dependencies**: Phase 7 complete (parallel with T801-T802)
- **Steps**:
  1. **Windows Testing** (Windows 10 + 11):
     - Install from .exe installer
     - Test all features (quotes, search, rotation, tray, shortcuts, overlay)
     - Test auto-launch
     - Test always-on-top
     - Test multi-monitor (if available)
     - Test uninstall
  2. **macOS Testing** (macOS 13+, Intel + Apple Silicon):
     - Install from .dmg
     - Test all features
     - Test menu bar integration
     - Test auto-launch (Login Items)
     - Test always-on-top
     - Test multi-monitor
  3. **Linux Testing** (Ubuntu 20.04+):
     - Run AppImage
     - Test all features
     - Test system tray
     - Test shortcuts
     - Test auto-launch (.desktop file)
  4. Document any platform-specific issues
  5. Create test report with screenshots
- **Files**:
  - `docs/test-report.md`
  - Screenshots for documentation
- **Verification**: App works correctly on all platforms
- **Status**: ⏸️ Pending

### T804: Bug Fixes & Polish
- **Description**: Fix bugs found in testing, polish UI/UX
- **Effort**: 4-6 hours
- **Dependencies**: T801-T803
- **Steps**:
  1. Fix any critical bugs (crashes, data loss)
  2. Fix high-priority bugs (feature not working)
  3. Fix medium-priority bugs (minor issues)
  4. Polish UI:
     - Smooth animations
     - Consistent styling
     - Loading states
  5. Optimize performance:
     - Reduce memory usage
     - Optimize CPU during transitions
     - Lazy load resources
  6. Add error handling:
     - Graceful error messages
     - Error logging (optional)
     - Crash recovery
  7. Test fixes on all platforms
- **Files**:
  - Various (bug fix commits)
- **Verification**: No critical bugs, app polished and performant
- **Status**: ⏸️ Pending

### T805: Documentation
- **Description**: Write comprehensive documentation
- **Effort**: 2-3 hours
- **Dependencies**: T804
- **Steps**:
  1. Write `quotes-electron/README.md`:
     - Project overview
     - Features list
     - Installation instructions (all platforms)
     - Development setup
     - Build instructions
     - Contributing guidelines
  2. Write user guide:
     - Getting started
     - Features walkthrough (with screenshots)
     - Keyboard shortcuts reference
     - Settings explanation
     - Troubleshooting
     - FAQ
  3. Document keyboard shortcuts in app (Help menu)
  4. Write CHANGELOG.md (version history)
  5. Update root README.md with Electron app info
- **Files**:
  - `quotes-electron/README.md`
  - `quotes-electron/docs/user-guide.md`
  - `quotes-electron/docs/shortcuts.md`
  - `quotes-electron/CHANGELOG.md`
  - `README.md` (updated)
- **Verification**: Documentation complete and clear
- **Status**: ⏸️ Pending

**Phase 8 Deliverables**:
- All unit tests passing (>80% coverage)
- All E2E tests passing
- Manual testing complete on all platforms
- All bugs fixed
- App polished and performant
- Complete documentation

---

## Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Total Tasks | 42 | - | Planning |
| Completed Tasks | 42 | 1 | 2% |
| Test Coverage | >80% | 0% | ⏸️ |
| App Launch Time | <2s | N/A | ⏸️ |
| Memory Usage | <300MB | N/A | ⏸️ |
| Package Size Win | <100MB | N/A | ⏸️ |
| Package Size Mac | <150MB | N/A | ⏸️ |
| Global Shortcuts Latency | <100ms | N/A | ⏸️ |
| Overlay Display Time | <200ms | N/A | ⏸️ |
| Critical Bugs | 0 | N/A | ⏸️ |
| User Rating | >4.5★ | N/A | ⏸️ |

---

## Timeline

```
Week 1 (Nov 21-27):
  ✅ Phase 0: Setup & Research (1-2 days)
  ⏸️ Phase 1: Core Electron Setup (3-5 days)

Week 2 (Nov 28 - Dec 4):
  ⏸️ Phase 2: System Tray (2-3 days)
  ⏸️ Phase 3: Shortcuts (2-3 days)
  ⏸️ Phase 4: Overlay (start, 3-4 days)

Week 3 (Dec 5-11):
  ⏸️ Phase 4: Overlay (finish)
  ⏸️ Phase 5: Desktop Features (2-3 days)
  ⏸️ Phase 6: Settings (2-3 days)

Week 4 (Dec 12-18):
  ⏸️ Phase 7: Packaging (3-4 days)
  ⏸️ Phase 8: Testing & Polish (2-3 days)
  
Target Release: December 18-20, 2025 (v1.0.0)
```

---

## Dependencies

- Angular web app (quotes-platform) must be functional
- Node.js 20+ installed
- npm or yarn package manager
- Windows 10+, macOS 13+, or Linux (Ubuntu 20.04+) for testing
- (Optional) Code signing certificates for Windows/macOS
- (Optional) Apple Developer account ($99/year) for notarization

---

## Notes

- Tasks can be executed in parallel within phases where noted
- Some tasks (T801-T803) can run parallel to Phase 7
- Estimated total time: 20-30 working days (3-4 weeks)
- Actual time may vary based on issues encountered
- Priority: Critical bugs block release, minor bugs can be fixed in patches

---

**Last Updated**: 2025-11-21  
**Status**: Planning (Phase 0 in progress)  
**Next Task**: T005 (Write Research Document)
