# Feature Specification: Electron Desktop App

**Feature ID**: `003-electron-desktop` | **Priority**: P1 (High) | **Status**: Planning  
**Created**: 2025-11-21 | **Target Release**: v2.0.0

## Overview

Create a cross-platform desktop application using Electron that provides the same quote display, rotation, and search features as the Angular web app, but with native desktop integration features like system tray, global shortcuts, auto-launch, and customizable quote overlays.

This replaces the React Native Windows implementation (Phase 4 of 002-react-native-expansion) which encountered significant complexity with PropertySheets, monorepo structure, and build configuration. Electron provides a simpler, proven path for desktop applications.

## Motivation

**Problem**: 
- Users want a native desktop app that can run in background with system tray
- React Native Windows has proven too complex (build issues, PropertySheet conflicts, monorepo path resolution)
- Need desktop-specific features: global shortcuts, auto-launch, notification overlays

**Solution**: 
- Use Electron to package the existing Angular/TypeScript app as a native desktop application
- Add desktop-specific features via Electron APIs
- Maintain code reuse with the web app
- Support Windows, macOS, and Linux with single codebase

**Benefits**:
- **Simplicity**: Single codebase for all desktop platforms
- **Proven Technology**: Electron is mature and widely used (VS Code, Slack, Discord)
- **Code Reuse**: Leverage existing Angular app (quotes-platform)
- **Native Features**: System tray, shortcuts, overlays without complex native bridges
- **Fast Development**: Much simpler than React Native Windows

## User Stories

### US-001: System Tray Integration
**As a** desktop user  
**I want** the app to minimize to system tray  
**So that** it doesn't clutter my taskbar but stays accessible

**Acceptance Criteria**:
- Given the app is running
- When I close the main window
- Then the app minimizes to system tray with quote icon
- And I can right-click the tray icon to see menu (Show, Pause/Resume, Next Quote, Settings, Quit)
- And I can left-click to show/hide the main window

### US-002: Global Keyboard Shortcuts
**As a** desktop user  
**I want** global keyboard shortcuts  
**So that** I can control quotes without switching to the app

**Acceptance Criteria**:
- Given the app is running (even in background)
- When I press `Ctrl+Shift+Q` (or `Cmd+Shift+Q` on macOS)
- Then a quote overlay appears on top of all windows
- And pressing again dismisses it
- And `Ctrl+Shift+N` shows next quote
- And `Ctrl+Shift+P` pauses/resumes rotation

### US-003: Quote Notification Overlay
**As a** desktop user  
**I want** quotes to appear as overlays on my screen  
**So that** I see quotes without switching windows

**Acceptance Criteria**:
- Given rotation is enabled
- When timer triggers a new quote
- Then an overlay window appears at configured position (9 positions: corners, edges, center)
- And the overlay auto-dismisses after configured duration (5-30 seconds)
- And the overlay is semi-transparent (default 80% opacity)
- And I can click the overlay to dismiss it immediately

### US-004: Auto-Launch on Startup
**As a** desktop user  
**I want** the app to auto-launch when I log in  
**So that** quotes are available immediately

**Acceptance Criteria**:
- Given I enable auto-launch in settings
- When my computer starts/I log in
- Then the app launches minimized to system tray
- And rotation starts automatically (if previously enabled)
- And I can disable auto-launch in settings

### US-005: Always-on-Top Mode
**As a** desktop user  
**I want** the main window to stay on top  
**So that** I always see quotes while working

**Acceptance Criteria**:
- Given I enable always-on-top in settings
- When other windows are opened
- Then the quote window stays on top
- And I can toggle this setting on/off
- And setting persists across sessions

## Functional Requirements

### FR-001: Core Quote Features (From Web App)
- Display quotes with rotation (5-300 seconds configurable)
- Search quotes (full-text, author, category, tags)
- Grid view with filtering
- Favorites management
- Category browsing
- Audio notification on transitions
- User preferences persistence

### FR-002: Electron Desktop Features
- Package Angular app with Electron
- System tray integration with menu
- Global keyboard shortcuts (configurable):
  - Warn user on registration failure (conflict detection)
  - Keep previous working shortcut if new one conflicts
  - Display actionable error message with alternative suggestions
- Quote notification overlay:
  - 9 position options (corners, edges, center)
  - Auto-dismiss after configurable duration (5-30s)
  - Click to dismiss immediately (no other action)
  - Display quote text + author
  - Opacity: Preset buttons (50%, 70%, 80%, 90%, 100%), default 80%
- Auto-launch on system startup
- Always-on-top window mode
- Native window frame or frameless design
- Multi-monitor support

### FR-003: Window Management
- Main window: Full Angular app (separate BrowserWindow)
- Overlay window: Minimal HTML + IPC for quote display (separate BrowserWindow)
- State sharing: Main process tracks current quote, overlay requests via IPC
- Window state persistence (size, position, monitor)
- Not a shared Angular instance (separate renderer processes)

### FR-004: Cross-Platform Support
- Windows 10+ (x64)
- macOS 10.14+ (Intel + Apple Silicon)
- Linux (Ubuntu 20.04+, x64)
- Auto-update via Electron updater

## Technical Requirements

### TR-001: Technology Stack
- **Electron**: 28+ (Chromium 120+, Node 20+)
- **Angular**: 18+ (existing quotes-platform app)
- **TypeScript**: 5.x (strict mode)
- **Electron Builder**: For packaging and distribution

### TR-002: Architecture
```
electron-app/
├── main/              # Electron main process (Node.js)
│   ├── main.ts       # Entry point
│   ├── tray.ts       # System tray
│   ├── shortcuts.ts  # Global shortcuts
│   ├── overlay.ts    # Overlay window
│   └── updater.ts    # Auto-update
├── preload/          # Preload scripts (context bridge)
│   └── preload.ts   # Expose Electron APIs to renderer
└── renderer/         # Angular app (from quotes-platform)
    └── (copy of quotes-platform/dist/)
```

### TR-003: IPC Communication
- Main → Renderer: Quote rotation events, overlay triggers
- Renderer → Main: Window control, tray menu actions, preferences
- Use Electron IPC with type-safe contracts
- **Channel Naming Convention**: `<domain>:<action>` pattern
  - Examples: `window:minimize`, `tray:update-menu`, `overlay:show`, `prefs:load`, `shortcut:register`
- **Communication Patterns**:
  - `invoke/handle`: Request-response (async, returns result) - Use for queries/commands needing response
  - `send/on`: Fire-and-forget (one-way notification) - Use for events/notifications
- **Timeout**: 5 seconds for `invoke` calls (reject promise on timeout)
- **Error Handling**: No automatic retry (caller decides retry strategy)

### TR-004: Package Size
- Target: <500MB installed (all platforms)
- Optimize: Tree-shaking, compression, lazy loading

### TR-005: Performance
- App launch: <2 seconds
- Quote transitions: 60fps smooth animations
- Memory: <150MB RAM idle, <300MB active
- CPU: <1% idle, <5% during transitions

## Non-Functional Requirements

### NFR-001: Security
- Enable `contextIsolation` and `nodeIntegration: false`
- Use preload scripts with context bridge
- Validate all IPC messages
- Content Security Policy enabled

### NFR-002: Accessibility
- Keyboard navigation for all features
- Screen reader support
- High contrast mode
- Keyboard shortcuts configurable

### NFR-003: Reliability
- Graceful error handling:
  - Fallback to default values on corrupted preferences
  - Use built-in quotes if quotes.json missing/corrupted
  - Display dismissible error notifications to user
  - Continue app functionality with degraded state
  - Log errors for debugging
- Crash recovery (restore window state on restart)
- Settings backup/restore
- Automatic error reporting (opt-in)
- Offline-first (all features work without internet)

### NFR-004: Maintainability
- Shared codebase with web app (quotes-platform)
- TypeScript strict mode
- ESLint + Prettier
- Unit tests (Jest) + E2E tests (Playwright)

## Success Criteria

- SC-001: App launches in <2 seconds on Windows/macOS/Linux
- SC-002: System tray integration works on all platforms
- SC-003: Global shortcuts respond in <100ms
- SC-004: Quote overlay appears within 200ms
- SC-005: Auto-launch works reliably on all platforms
- SC-006: App size <500MB (all platforms)
- SC-007: Memory usage <300MB during active use
- SC-008: 100% feature parity with web app (quotes, search, rotation)
- SC-009: Users rate desktop experience 4.5+ stars
- SC-010: Zero critical bugs after 1 month beta testing

## Out of Scope (Future Enhancements)

- Mobile app integration (handled by 002-react-native-expansion)
- Cloud sync (future feature)
- Custom themes beyond light/dark
- Widget/Dashboard integration
- Multiple quote windows simultaneously
- Web app → Desktop deep linking

## Dependencies

- Existing Angular web app (quotes-platform) must be functional
- Quote dataset (quotes.json) available
- Build environment: Node.js 20+, npm/yarn
- Windows/macOS/Linux for testing

## Constraints

- Must maintain code reuse with web app (single Angular codebase)
- Package size must be reasonable (<500MB)
- No backend server (offline-first)
- Must comply with app store guidelines if distributed via Microsoft Store / Mac App Store

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Electron learning curve | Medium | Low | Well-documented, similar to web dev |
| Package size bloat | Medium | Medium | Optimize with Electron Builder, tree-shaking |
| System tray differences (OS-specific) | Low | Medium | Use Electron's cross-platform abstraction |
| Auto-update complexity | Medium | Low | Use electron-updater library (proven) |
| Memory usage in Chromium | Low | Low | Monitor and optimize, acceptable for desktop |

## Open Questions

1. **Icon Design**: Do we need a separate desktop icon or reuse web app icon?
   - **Decision**: Create a simple system tray icon (16x16, 32x32)

2. **Distribution**: Package via app stores or direct download?
   - **Decision**: Start with direct download (.exe, .dmg, .AppImage), app stores later

3. **Frameless vs Native Frame**: Which window style for main window?
   - **Decision**: Native frame for now (simpler), custom frameless in future

4. **Quote Overlay Positioning**: Fixed or draggable?
   - **Decision**: Fixed to 9 positions (configurable), not draggable

5. **Update Mechanism**: Auto-update or manual?
   - **Decision**: Auto-update with user prompt (electron-updater)

## Clarifications

### Session 2025-11-21

- Q: When a quote notification overlay appears on screen, how should it respond to user interaction? → A: Dismissible with click (clicking the overlay closes it immediately), and auto-dismiss after configured interval time
- Q: When the quote overlay appears, what information should be displayed? → A: Quote text + author (essential information, compact)
- Q: When the app encounters errors (e.g., corrupted preferences, missing quote data, IPC communication failures), how should it handle them? → A: Graceful degradation (fallback to defaults, notify user with dismissible message)
- Q: When a user-configured keyboard shortcut conflicts with another application or system shortcut, how should the app handle it? → A: Warn on registration failure (show message, keep previous working shortcut)
- Q: What should be the default transparency level for the quote overlay window? → A: 80% opacity

## Approval

- [ ] Product Owner Review
- [ ] Technical Lead Review
- [ ] Architecture Review
- [ ] Security Review

## Related Documents

- [Plan](./plan.md) - Implementation plan and timeline
- [Tasks](./tasks.md) - Detailed task breakdown
- [Research](./research.md) - Electron architecture research
- Parent Spec: [002-react-native-expansion](../002-react-native-expansion/spec.md)
