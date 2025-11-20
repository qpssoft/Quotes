# Phase 4 Desktop Implementation Guide

## Current State

Phase 4 implementation established the **foundation for Windows desktop support**. The React Native Windows project builds successfully with platform-specific services, native module structure, and desktop-optimized UI components.

### What Works Now
- ✅ Windows application builds and runs
- ✅ Storage and audio services (platform-specific)
- ✅ Desktop settings UI (notification position, keyboard shortcuts)
- ✅ Quote notification overlay component (9 positions)
- ✅ Platform detection and service selection

### What Needs Work
- ⏸️ Native module implementations (system tray, global shortcuts)
- ⏸️ macOS support (blocked by hardware)
- ⏸️ Manual testing and bug fixes
- ⏸️ Keyboard navigation and native menus

## Build Instructions

### Windows Desktop Build

**Prerequisites:**
- Windows 10/11
- Visual Studio 2019/2022 with C++ and UWP workloads
- Node.js 18+
- React Native Windows dependencies

**Build Steps:**
```powershell
cd D:\Projects\Quotes\quotes-native

# Install dependencies (if not already done)
npm install --legacy-peer-deps

# Build Windows app
npx @react-native-community/cli run-windows

# Or build without launching
npx @react-native-community/cli run-windows --no-launch
```

**Troubleshooting:**
- If build fails, ensure Visual Studio has UWP and C++ workloads installed
- Check that Windows SDK 10.0.19041.0 or newer is installed
- Run `npm install --legacy-peer-deps` if peer dependency errors occur

### Android Build (Post-Ejection)

```powershell
cd D:\Projects\Quotes\quotes-native

# Build Android app
npx @react-native-community/cli run-android

# Or using Gradle directly
cd android
.\gradlew assembleDebug
```

### iOS Build (Requires macOS)

```bash
cd /path/to/quotes-native

# Install pods
cd ios && pod install && cd ..

# Build iOS app
npx react-native run-ios
```

## Testing Guide

### Manual Testing Checklist (Windows)

#### T138: Windows 10/11 Basic Functionality
- [ ] App launches successfully
- [ ] No crash on startup
- [ ] UI renders correctly
- [ ] Settings screen opens
- [ ] Desktop settings section visible

#### T140: Multi-Display Support
- [ ] Connect second monitor
- [ ] Open app on primary display
- [ ] Open app on secondary display
- [ ] Verify notification positioning works on both displays
- [ ] Test all 9 notification positions on each display

#### T141: Notification Position Testing
Test all 9 positions with quote overlay:
- [ ] Top Left - Quote appears in top-left corner with 20px padding
- [ ] Top Center - Quote centered horizontally at top
- [ ] Top Right - Quote in top-right corner
- [ ] Middle Left - Quote centered vertically on left
- [ ] Center - Quote centered on screen
- [ ] Middle Right - Quote centered vertically on right
- [ ] Bottom Left - Quote in bottom-left corner
- [ ] Bottom Center - Quote centered horizontally at bottom
- [ ] Bottom Right - Quote in bottom-right corner

#### T142: Keyboard Shortcut Customization
- [ ] Open Settings > Desktop Settings
- [ ] Change "Show Quote" from Ctrl+C to Ctrl+X
- [ ] Verify preference saved
- [ ] Restart app
- [ ] Verify Ctrl+X still selected
- [ ] Change "Next Quote" from Ctrl+V to Ctrl+N
- [ ] Verify preference saved and persists

#### T143: Bug Fixes and Polish
- [ ] Test all interactive elements
- [ ] Verify animations smooth (60fps)
- [ ] Check text rendering (no truncation)
- [ ] Test settings persistence
- [ ] Verify color consistency (Buddhist theme)
- [ ] Check responsive layout on window resize

### Known Issues

1. **Native Modules Non-Functional**
   - System tray icon does not appear
   - Global shortcuts (Ctrl+C/V) do not register
   - Workaround: Use in-app controls for now

2. **Auto-Launch Not Implemented**
   - Toggle in settings has no effect
   - TODO: Implement registry or startup folder configuration

3. **Quote Overlay Position**
   - Position calculation works in theory
   - Needs manual testing to verify accuracy
   - May need adjustment for taskbar height

## Development Roadmap

### Phase 4A: Complete Windows Implementation

**Priority 1: Native Modules**
1. Implement SystemTrayModule functionality
   ```csharp
   // In SystemTrayModule.cs
   using Windows.UI.Notifications;
   using NotifyIconWpf; // or equivalent
   
   // Show system tray icon with context menu
   // Handle click events
   // Show toast notifications
   ```

2. Implement GlobalShortcutsModule functionality
   ```csharp
   // In GlobalShortcutsModule.cs
   using System.Runtime.InteropServices;
   
   [DllImport("user32.dll")]
   private static extern bool RegisterHotKey(IntPtr hWnd, int id, uint fsModifiers, uint vk);
   
   // Register global hotkeys
   // Handle WM_HOTKEY messages
   ```

3. Implement auto-launch
   ```csharp
   // Add registry key to HKCU\Software\Microsoft\Windows\CurrentVersion\Run
   // Or add shortcut to shell:startup folder
   ```

**Priority 2: UI Polish**
1. Keyboard Navigation (T136)
   - Add `onKeyPress` handlers
   - Implement Tab focus management
   - Add Enter key for selection
   - Arrow keys for navigation

2. Native Menus (T137)
   - File menu (Open, Exit)
   - Edit menu (Preferences)
   - View menu (Always on Top, Minimize to Tray)
   - Help menu (About, Documentation)

**Priority 3: Testing**
- Complete manual testing checklist
- Fix identified bugs
- Performance profiling
- Memory leak detection

### Phase 4B: macOS Implementation (Requires macOS)

**When macOS Available:**
1. Initialize React Native macOS
   ```bash
   npx react-native-macos-init --overwrite
   cd macos && pod install
   ```

2. Create macOS services
   ```typescript
   // MacStorageService.ts - Use UserDefaults
   // MacAudioService.ts - Use AVFoundation
   ```

3. Implement menu bar app
   ```swift
   // In Swift native module
   let statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
   statusItem.button?.image = NSImage(named: "MenuBarIcon")
   ```

4. Implement global shortcuts
   ```swift
   // Use MASShortcut or similar framework
   // Register Cmd+C, Cmd+V shortcuts
   ```

## Architecture Overview

### Platform Service Selection

```typescript
// PlatformServiceFactory.ts
export function getStorageService(): IStorageService {
  if (Platform.OS === 'windows') {
    return new WindowsStorageService();
  } else if (Platform.OS === 'macos') {
    return new MacStorageService(); // TODO: Create when macOS available
  }
  return new NativeStorageService(); // iOS/Android
}
```

### Component Platform Checks

```typescript
// In SettingsScreen.tsx
{(Platform.OS === 'windows' || Platform.OS === 'macos') && (
  <DesktopSettings
    notificationPosition={preferences.notificationPosition}
    keyboardShortcuts={preferences.keyboardShortcuts}
    // ...
  />
)}
```

### Native Module Pattern

```typescript
// Native module TypeScript wrapper
const SystemTrayModule: ISystemTrayModule | null =
  Platform.OS === 'windows' && NativeModules.SystemTrayModule
    ? NativeModules.SystemTrayModule
    : null;

export function showSystemTray(tooltip: string): void {
  if (!SystemTrayModule) {
    console.warn('System tray not supported on this platform');
    return;
  }
  SystemTrayModule.showTrayIcon('', tooltip);
}
```

## Code Quality Checklist

Before marking Phase 4 complete:

- [ ] Remove all TypeScript warnings (`'X' is declared but never used`)
- [ ] Add error handling to all async functions
- [ ] Write unit tests for WindowsStorageService
- [ ] Write unit tests for WindowsAudioService
- [ ] Test PlatformServiceFactory selection logic
- [ ] Document all public APIs with JSDoc
- [ ] Add PropTypes or TypeScript interfaces to all components
- [ ] Verify no memory leaks in long-running app
- [ ] Profile performance (CPU, memory, startup time)
- [ ] Test on various Windows versions (10, 11)

## Resources

**React Native Windows Documentation:**
- Getting Started: https://microsoft.github.io/react-native-windows/docs/getting-started
- Native Modules: https://microsoft.github.io/react-native-windows/docs/native-modules
- Native UI Components: https://microsoft.github.io/react-native-windows/docs/view-managers

**React Native macOS Documentation:**
- Getting Started: https://microsoft.github.io/react-native-windows/docs/rnm-getting-started
- API Reference: https://microsoft.github.io/react-native-windows/docs/rnm-api

**Windows API References:**
- System Tray: https://learn.microsoft.com/en-us/windows/apps/design/shell/tiles-and-notifications/
- Global Hotkeys: https://learn.microsoft.com/en-us/windows/win32/inputdev/keyboard-input

## Support

For issues or questions:
1. Check React Native Windows issues: https://github.com/microsoft/react-native-windows/issues
2. Review implementation report: `specs/002-react-native-expansion/PHASE4_IMPLEMENTATION_REPORT.md`
3. Consult plan.md: `specs/002-react-native-expansion/plan.md`

---

**Implementation Date**: 2025-11-20  
**Status**: Foundation Complete (41%)  
**Next Action**: Complete native module implementations or proceed to testing
