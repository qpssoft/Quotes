# Implementation Plan: Electron Desktop App

**Branch**: `003-electron-desktop` | **Date**: 2025-11-21 | **Spec**: [spec.md](./spec.md)

## Summary

Create a cross-platform desktop application using Electron that packages the existing Angular web app (quotes-platform) with native desktop features: system tray, global shortcuts, quote overlays, auto-launch, and always-on-top mode. Supports Windows, macOS, and Linux from single codebase.

**Why Electron vs React Native Windows**:
- **Simplicity**: Single codebase, no native bridges
- **Proven**: Mature ecosystem (VS Code, Slack, Discord)
- **Code Reuse**: 95%+ shared with existing Angular app
- **Fast Development**: 2-4 weeks vs 8-12 weeks for RN Windows
- **Better DX**: Standard web dev tools, no Visual Studio/MSBuild complexity

## Technical Context

**Language/Version**: 
- TypeScript 5.x (strict mode)
- Electron 28+ (Chromium 120, Node 20)
- Angular 18+ (existing quotes-platform)

**Primary Dependencies**:
- `electron`: ^28.0.0 - Desktop app framework
- `electron-builder`: ^24.0.0 - Packaging and distribution
- `electron-updater`: ^6.0.0 - Auto-update mechanism
- Angular app dependencies (from quotes-platform)

**Architecture**:
```
electron-app/
├── package.json                    # Electron app manifest
├── electron-builder.yml            # Build configuration
├── main/                           # Main process (Node.js)
│   ├── main.ts                    # App entry point, window management
│   ├── tray.ts                    # System tray integration
│   ├── shortcuts.ts               # Global keyboard shortcuts
│   ├── overlay.ts                 # Overlay window manager
│   ├── updater.ts                 # Auto-update logic
│   └── ipc-handlers.ts            # IPC message handlers
├── preload/                        # Preload scripts
│   └── preload.ts                 # Context bridge (expose APIs)
└── renderer/                       # Angular app (renderer process)
    └── (quotes-platform build output)
```

**IPC Communication**:
- **Renderer → Main**: Window controls, tray actions, preferences, overlay triggers
- **Main → Renderer**: System events, shortcut triggers, update notifications
- Type-safe contracts using TypeScript interfaces

**Distribution**:
- Windows: NSIS installer (.exe), portable (.exe), Microsoft Store (future)
- macOS: DMG (.dmg), Mac App Store (future)
- Linux: AppImage (.AppImage), snap, deb

**Testing**:
- Unit: Jest for main process logic
- E2E: Playwright for full app testing
- Manual: Physical Windows/macOS/Linux devices

**Performance Goals**:
- Launch time: <2s
- Memory: <300MB active
- CPU: <5% during transitions
- Package size: <150MB

## Constitution Check

✅ **Shared Static JSON Data Architecture**: Reuses quotes.json from Angular app. Electron bundles it in app package. No changes to data layer.

✅ **Web Platform with Angular**: Angular app (quotes-platform) is the renderer process. 95%+ code reuse. No changes to Angular codebase (just build and package).

✅ **Native Platforms**: Electron provides native desktop features (tray, shortcuts, overlays) via main process APIs. Cross-platform abstraction built-in.

✅ **Buddhist-Inspired UX**: Maintains web app's calming design. Adds desktop-specific enhancements (overlays, tray) that fit mindfulness use case.

✅ **Performance at Scale**: Chromium engine handles 500K+ quotes efficiently. Target <300MB RAM, <2s launch, 60fps animations.

✅ **Simplicity**: Minimal Electron-specific code (~500 lines main process). Leverages existing Angular app. Standard web dev workflow.

✅ **Multi-Platform Architecture**: Single codebase → 3 platforms (Windows, macOS, Linux). Electron handles OS differences.

✅ **Code Sharing Strategy**: 95%+ shared with web app (entire Angular codebase). Only Electron main process is new code.

✅ **BDD Testing**: E2E tests for desktop features. Reuses existing Angular tests.

**No principle violations** - Electron aligns perfectly with web-first philosophy.

## Project Structure

```
Quotes/                                      # Monorepo root
├── quotes-platform/                         # Angular web app (EXISTING)
│   ├── src/
│   ├── public/
│   └── dist/                               # Build output (used by Electron)
│
├── quotes-electron/                         # Electron desktop app (NEW)
│   ├── package.json                        # Electron dependencies
│   ├── tsconfig.json                       # TypeScript config
│   ├── electron-builder.yml                # Build/packaging config
│   ├── main/                               # Main process (Node.js)
│   │   ├── main.ts                        # Entry point, window creation
│   │   ├── tray.ts                        # System tray manager
│   │   │   ├── createTray()              # Create tray icon + menu
│   │   │   ├── updateTrayMenu()          # Update menu state
│   │   │   └── destroyTray()
│   │   ├── shortcuts.ts                   # Global shortcuts
│   │   │   ├── registerShortcuts()       # Register all shortcuts
│   │   │   ├── unregisterShortcuts()
│   │   │   └── shortcutHandlers          # Handler map
│   │   ├── overlay.ts                     # Overlay window
│   │   │   ├── createOverlay()           # Create overlay window
│   │   │   ├── showOverlay(quote, pos)   # Show at position
│   │   │   ├── hideOverlay()
│   │   │   └── updateOverlayContent()
│   │   ├── updater.ts                     # Auto-update
│   │   │   ├── checkForUpdates()
│   │   │   ├── downloadUpdate()
│   │   │   └── installUpdate()
│   │   ├── ipc-handlers.ts                # IPC message handlers
│   │   │   ├── handleWindowControl()     # Min/max/close
│   │   │   ├── handleTrayAction()        # Tray menu clicks
│   │   │   ├── handlePreferences()       # Save/load prefs
│   │   │   └── handleOverlayTrigger()
│   │   ├── menu.ts                        # Application menu
│   │   │   └── createMenu()              # File/Edit/View/Help
│   │   └── store.ts                       # Electron-specific storage
│   │       └── ElectronStore class       # Preferences persistence
│   ├── preload/                           # Preload scripts
│   │   └── preload.ts                    # Context bridge
│   │       └── electronAPI                # Exposed APIs
│   │           ├── window.minimize()
│   │           ├── window.maximize()
│   │           ├── window.close()
│   │           ├── tray.setStatus()
│   │           ├── overlay.show()
│   │           ├── prefs.save()
│   │           └── prefs.load()
│   ├── renderer/                          # Angular app (symlink or copy)
│   │   └── → ../quotes-platform/dist/    # Symlink to Angular build
│   ├── assets/                            # Electron-specific assets
│   │   ├── icon.png                      # App icon (512x512)
│   │   ├── icon.ico                      # Windows icon
│   │   ├── icon.icns                     # macOS icon
│   │   ├── tray-icon.png                 # System tray icon (16x16)
│   │   └── tray-icon@2x.png              # Retina tray icon (32x32)
│   ├── scripts/                           # Build scripts
│   │   ├── build.js                      # Build Electron app
│   │   ├── dev.js                        # Dev mode (hot reload)
│   │   └── package.js                    # Package for distribution
│   └── __tests__/                         # Tests
│       ├── main/                         # Main process tests
│       │   ├── tray.test.ts
│       │   ├── shortcuts.test.ts
│       │   └── overlay.test.ts
│       └── e2e/                          # E2E tests
│           ├── app-launch.spec.ts
│           ├── tray-menu.spec.ts
│           ├── shortcuts.spec.ts
│           └── overlay.spec.ts
│
└── quotes-native/                          # React Native (mobile/watch)
    └── windows/                           # RN Windows (KEEP for reference)
```

**Structure Decision**: Create separate `quotes-electron/` directory for Electron app. Symlink to `quotes-platform/dist/` for renderer. Main process is ~500 lines of TypeScript. Minimal Electron-specific code.

## Implementation Phases

### Phase 0: Setup & Research ⏳ (This Phase)

**Goal**: Setup project structure, research Electron patterns, create plan

**Tasks**:
1. ✅ Create `specs/003-electron-desktop/` directory
2. ✅ Write spec.md (feature specification)
3. ✅ Write plan.md (this file)
4. ⏳ Write research.md (Electron architecture, IPC patterns)
5. ⏳ Write tasks.md (detailed task breakdown)
6. ⏳ Create checklists/ (UX, security, testing)

**Deliverables**:
- ✅ Feature specification complete
- ✅ Implementation plan complete
- ⏳ Research document
- ⏳ Task breakdown
- ⏳ Checklists

---

### Phase 1: Core Electron Setup (Week 1)

**Goal**: Basic Electron app that wraps Angular app

**Duration**: 3-5 days

#### Tasks:

**T101: Initialize Electron Project**
- Create `quotes-electron/` directory
- Initialize package.json with Electron dependencies
- Setup TypeScript (tsconfig.json)
- Install: electron, electron-builder, typescript

**T102: Create Main Process**
- Create `main/main.ts` entry point
- Setup BrowserWindow with Angular app
- Configure window (size, frame, titleBarStyle)
- Load `quotes-platform/dist/index.html`

**T103: Create Preload Script**
- Create `preload/preload.ts`
- Setup context bridge
- Expose window controls (minimize, maximize, close)
- Type-safe API definitions

**T104: Angular App Integration**
- Build quotes-platform: `ng build --configuration production`
- Symlink or copy dist/ to renderer/
- Verify app loads in Electron window
- Test all Angular features work

**T105: Development Setup**
- Create dev mode script (electron + ng serve)
- Setup hot reload for main process
- Configure VS Code launch.json for debugging
- Add npm scripts: `dev`, `build`, `start`

**Outputs**:
- ✅ Electron app launches and shows Angular app
- ✅ Dev mode with hot reload working
- ✅ All Angular features functional in Electron

---

### Phase 2: System Tray Integration (Week 1-2)

**Goal**: Minimize to system tray with menu

**Duration**: 2-3 days

#### Tasks:

**T201: Create Tray Manager**
- Create `main/tray.ts`
- Create system tray icon (16x16, 32x32)
- Initialize tray on app start
- Handle tray icon click (show/hide window)

**T202: Tray Context Menu**
- Add menu items:
  - Show/Hide Window
  - Pause/Resume Rotation
  - Next Quote
  - Settings
  - Quit
- Connect menu actions to IPC handlers
- Update menu state dynamically (pause/resume text)

**T203: Window Hide to Tray**
- Intercept window close event
- Minimize to tray instead of quit
- Add "Show window on close" preference
- System tray notification on first minimize

**T204: Cross-Platform Testing**
- Test on Windows (system tray)
- Test on macOS (menu bar)
- Test on Linux (system tray)
- Handle platform-specific icon sizes

**Outputs**:
- ✅ System tray icon appears on all platforms
- ✅ Tray menu functional (all actions work)
- ✅ Window minimizes to tray correctly
- ✅ Click tray icon shows/hides window

---

### Phase 3: Global Keyboard Shortcuts (Week 2)

**Goal**: Register global shortcuts for quote control

**Duration**: 2-3 days

#### Tasks:

**T301: Shortcuts Manager**
- Create `main/shortcuts.ts`
- Register global shortcuts:
  - `Ctrl+Shift+Q` (Cmd on macOS): Toggle overlay
  - `Ctrl+Shift+N`: Next quote
  - `Ctrl+Shift+P`: Pause/resume rotation
- Handle shortcut conflicts (warn user)

**T302: IPC Communication**
- Add IPC channels for shortcuts:
  - `shortcut:overlay-toggle`
  - `shortcut:next-quote`
  - `shortcut:pause-resume`
- Send events to renderer (Angular app)
- Update Angular app to listen for events

**T303: Configurable Shortcuts**
- Add shortcuts preferences UI (Angular)
- Allow users to customize shortcuts
- Validate shortcuts (no conflicts)
- Persist shortcuts in settings

**T304: Shortcut Testing**
- Test shortcuts work globally (outside app)
- Test shortcut conflicts (multiple apps)
- Test shortcuts on all platforms
- Test custom shortcuts persistence

**Outputs**:
- ✅ Global shortcuts registered and working
- ✅ Shortcuts trigger actions in Angular app
- ✅ Users can customize shortcuts
- ✅ Shortcuts work on all platforms

---

### Phase 4: Quote Overlay Window (Week 2-3)

**Goal**: Floating overlay window for quote notifications

**Duration**: 3-4 days

#### Tasks:

**T401: Overlay Window Manager**
- Create `main/overlay.ts`
- Create frameless overlay window
- Set always-on-top flag
- Set transparent background
- Position at screen coordinates

**T402: Overlay Positioning**
- Implement 9 positions:
  - Top: left, center, right
  - Middle: left, center, right
  - Bottom: left, center, right
- Calculate coordinates based on screen size
- Handle multi-monitor setups
- Save position preference

**T403: Overlay Content**
- Pass quote data via IPC
- Create overlay component (Angular or HTML template)
- Style overlay (semi-transparent, minimal)
- Add auto-dismiss timer (5-30s configurable)
- Add click-to-dismiss

**T404: Overlay Triggers**
- Trigger on rotation timer
- Trigger on global shortcut
- Trigger on tray menu action
- Trigger on next quote button
- Add overlay enable/disable setting

**T405: Overlay Testing**
- Test all 9 positions
- Test multi-monitor positioning
- Test auto-dismiss timer
- Test click-through option
- Test overlay content rendering

**Outputs**:
- ✅ Overlay window appears at configured position
- ✅ All 9 positions working correctly
- ✅ Auto-dismiss timer functional
- ✅ Overlay content displays quotes correctly
- ✅ Multi-monitor support working

---

### Phase 5: Desktop Features (Week 3)

**Goal**: Auto-launch, always-on-top, app menu

**Duration**: 2-3 days

#### Tasks:

**T501: Auto-Launch on Startup**
- Use `electron.app.setLoginItemSettings()`
- Add auto-launch toggle in settings
- Launch minimized to tray on startup
- Test on Windows (registry)
- Test on macOS (Login Items)
- Test on Linux (autostart desktop file)

**T502: Always-on-Top Mode**
- Add window.setAlwaysOnTop() toggle
- Add menu item / toolbar button
- Persist always-on-top preference
- Show visual indicator when enabled

**T503: Application Menu**
- Create `main/menu.ts`
- Define menu structure:
  - File: Preferences, Quit
  - Edit: Copy Quote
  - View: Zoom In/Out/Reset, Toggle Fullscreen
  - Window: Minimize, Always on Top
  - Help: About, Documentation, Check for Updates
- Connect menu actions to IPC
- Platform-specific menus (macOS has app menu)

**T504: Window State Persistence**
- Save window size, position, monitor
- Restore window state on launch
- Handle monitor disconnection gracefully
- Save always-on-top state

**Outputs**:
- ✅ Auto-launch works on all platforms
- ✅ Always-on-top mode toggleable
- ✅ Application menu functional
- ✅ Window state persists across sessions

---

### Phase 6: Settings & Preferences (Week 3-4)

**Goal**: Electron-specific settings in Angular app

**Duration**: 2-3 days

#### Tasks:

**T601: Preferences Storage**
- Create `main/store.ts` (electron-store or JSON file)
- Define preferences schema:
  - System tray: enabled, show on close
  - Shortcuts: custom key bindings
  - Overlay: enabled, position, duration, transparency
  - Auto-launch: enabled, start minimized
  - Always-on-top: enabled
  - Updates: check automatically
- Save/load preferences via IPC

**T602: Settings UI (Angular)**
- Add Electron settings section in Angular app
- Desktop tab in settings screen:
  - System tray options
  - Global shortcuts configuration
  - Overlay positioning preview (9-grid)
  - Auto-launch toggle
  - Always-on-top toggle
  - Update preferences
- Detect Electron environment (window.electronAPI)
- Show/hide desktop settings based on platform

**T603: Preferences IPC**
- Add IPC channels:
  - `prefs:load`
  - `prefs:save`
  - `prefs:reset`
- Validate preferences before saving
- Emit preference change events
- Update main process state on changes

**T604: Settings Testing**
- Test all preference options
- Test persistence across restarts
- Test preference validation
- Test default values

**Outputs**:
- ✅ All preferences save/load correctly
- ✅ Settings UI integrated in Angular app
- ✅ Preferences persist across sessions
- ✅ Defaults and validation working

---

### Phase 7: Packaging & Distribution (Week 4)

**Goal**: Package app for Windows, macOS, Linux

**Duration**: 3-4 days

#### Tasks:

**T701: Electron Builder Configuration**
- Create `electron-builder.yml`
- Configure build targets:
  - Windows: nsis, portable
  - macOS: dmg
  - Linux: AppImage
- Set app metadata (name, version, author, license)
- Configure icon paths
- Set file associations (optional)

**T702: Windows Packaging**
- Build Windows installer (NSIS)
- Create portable executable
- Test installation on Windows 10/11
- Test auto-update mechanism
- Code sign (optional, requires certificate)

**T703: macOS Packaging**
- Build DMG installer
- Test installation on macOS 13+
- Test Apple Silicon (arm64) + Intel (x64)
- Notarize app (optional, requires Apple Developer)
- Test auto-update mechanism

**T704: Linux Packaging**
- Build AppImage
- Test on Ubuntu 20.04+
- Test auto-update mechanism
- Create .deb package (optional)

**T705: Auto-Update Setup**
- Configure electron-updater
- Setup GitHub Releases for updates
- Add update notification UI
- Test update flow (download, install, restart)

**Outputs**:
- ✅ Windows installer (.exe) working
- ✅ macOS installer (.dmg) working
- ✅ Linux package (.AppImage) working
- ✅ Auto-update mechanism functional
- ✅ Packages tested on all platforms

---

### Phase 8: Testing & Polish (Week 4)

**Goal**: Comprehensive testing and bug fixes

**Duration**: 2-3 days

#### Tasks:

**T801: Unit Testing**
- Write tests for main process:
  - tray.test.ts
  - shortcuts.test.ts
  - overlay.test.ts
  - store.test.ts
- Achieve >80% code coverage
- Setup Jest for Electron main process

**T802: E2E Testing**
- Write Playwright tests:
  - App launch and window creation
  - System tray interaction
  - Global shortcuts
  - Overlay window positioning
  - Preferences persistence
- Setup CI for E2E tests

**T803: Manual Testing**
- Test on physical Windows 10/11
- Test on physical macOS 13+
- Test on physical Linux (Ubuntu)
- Test multi-monitor setups
- Test all features on all platforms

**T804: Bug Fixes & Polish**
- Fix any issues found in testing
- Polish UI/UX (animations, transitions)
- Optimize performance (memory, CPU)
- Add error handling and logging

**T805: Documentation**
- Write README.md for electron app
- Document keyboard shortcuts
- Document preferences
- Create user guide (screenshots)
- Document build/development process

**Outputs**:
- ✅ All tests passing
- ✅ No critical bugs
- ✅ App tested on all platforms
- ✅ Documentation complete
- ✅ Ready for release

---

## Rollout Strategy

### Beta Testing (Week 4-5)
- **Target**: 10-15 beta testers (Windows, macOS, Linux)
- **Distribution**: Direct download (GitHub Releases)
- **Feedback**: GitHub Issues + Discord/Slack
- **Duration**: 1-2 weeks
- **Goals**: Find critical bugs, validate features, gather UX feedback

### v1.0.0 Launch (Week 5-6)
- **Distribution**: Direct download from website/GitHub
- **Marketing**: Blog post, social media, Buddhist communities
- **Support**: GitHub Issues, documentation
- **Monitoring**: Error tracking (Sentry optional), analytics (opt-in)

### Post-Launch (Month 2+)
- **Updates**: Patch releases for bug fixes
- **Features**: Minor enhancements based on feedback
- **App Stores**: Submit to Microsoft Store, Mac App Store (optional)
- **Metrics**: Track downloads, crashes, feature usage

## Risk Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Electron package size bloat | Medium | Medium | Use electron-builder optimization, tree-shaking, lazy loading |
| Memory usage too high | Low | Low | Monitor with profiler, optimize if >300MB |
| System tray differences across OS | Low | Medium | Test on all platforms, use Electron abstractions |
| Global shortcuts conflicts | Medium | Medium | Allow customization, detect conflicts, warn users |
| Auto-update failures | Medium | Low | Use proven electron-updater, thorough testing |
| Angular app compatibility | Low | Low | Angular works in Chromium, minimal changes needed |

## Success Criteria

All success criteria from spec.md must be met:

- ✅ SC-001: App launches in <2 seconds
- ✅ SC-002: System tray integration works on all platforms
- ✅ SC-003: Global shortcuts respond in <100ms
- ✅ SC-004: Quote overlay appears within 200ms
- ✅ SC-005: Auto-launch works reliably
- ✅ SC-006: App size <150MB
- ✅ SC-007: Memory usage <300MB
- ✅ SC-008: 100% feature parity with web app
- ✅ SC-009: Users rate 4.5+ stars
- ✅ SC-010: Zero critical bugs after beta testing

## Complexity Tracking

**No principle violations** - Electron aligns with web-first philosophy.

**Complexity drivers**:
- Electron main process (~500 lines TypeScript)
- IPC communication (type-safe contracts)
- Multi-platform packaging (3 installers)
- Auto-update mechanism

**Justification**: Minimal complexity compared to React Native Windows. Electron provides abstractions for cross-platform features. 95%+ code reuse with Angular app. Trade-off: Larger package size (~100-150MB) for drastically simpler development.

## Next Steps

1. ✅ Phase 0 complete (spec, plan created)
2. **Next**: Write research.md (Electron architecture patterns)
3. **Next**: Write tasks.md (detailed task breakdown with time estimates)
4. **Next**: Create checklists/ (ux.md, security.md, testing.md)
5. **Then**: Begin Phase 1 (Core Electron setup)

**Estimated Timeline**: 3-4 weeks to v1.0.0 (vs 8-12 weeks for React Native Windows)
