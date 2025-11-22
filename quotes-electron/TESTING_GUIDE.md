# Testing Guide: Buddhist Quotes Desktop

This guide helps testers verify the Windows packages for the Buddhist Quotes desktop application.

## Quick Start

### Prerequisites
- Windows 10 (64-bit) version 1809 or later, OR Windows 11
- At least 500MB free disk space
- Internet connection (for initial data load)

### Test Artifacts Location
All built packages are in `release/` directory:
- **NSIS Installer**: `Buddhist Quotes Setup 2.0.0.exe` (73.41 MB)
- **Portable**: `Buddhist Quotes 2.0.0.exe` (73.03 MB)

## Testing Scenarios

### Scenario 1: NSIS Installer Test (15 minutes)

**Objective**: Verify the installer works correctly

**Steps**:
1. Navigate to `release/` folder
2. Right-click `Buddhist Quotes Setup 2.0.0.exe` → Properties
3. If file is blocked, click "Unblock" → OK
4. Double-click the installer
5. Follow the installation wizard
6. Note where it installs (default: `C:\Users\[YourName]\AppData\Local\Programs\buddhist-quotes-electron`)
7. After installation, verify:
   - [ ] Start Menu shortcut exists: Start → "Buddhist Quotes"
   - [ ] Desktop shortcut exists (if you selected this option)
   - [ ] Application launches from shortcut
   - [ ] Main window appears (1200x800 default size)
   - [ ] Buddhist quotes display correctly
   - [ ] System tray icon appears (look for 🕉️ icon)

**Uninstall Test**:
1. Open Settings → Apps → Installed apps (or Add/Remove Programs)
2. Find "Buddhist Quotes"
3. Click Uninstall
4. Verify clean removal

### Scenario 2: Portable Executable Test (10 minutes)

**Objective**: Verify portable version runs without installation

**Steps**:
1. Copy `Buddhist Quotes 2.0.0.exe` to a test folder (e.g., Desktop)
2. Right-click → Properties → Unblock (if needed) → OK
3. Double-click to run
4. Verify:
   - [ ] Application launches without installation prompt
   - [ ] Main window appears
   - [ ] Quotes display and rotate
   - [ ] System tray icon appears
   - [ ] Can minimize to tray
   - [ ] Can close from tray menu

**Cleanup**:
1. Right-click tray icon → Quit
2. Delete the portable .exe file
3. (Optional) Clean user data: `%APPDATA%\buddhist-quotes-electron`

### Scenario 3: Core Features Test (10 minutes)

**Objective**: Verify all features work correctly

**Prerequisites**: App must be running (from installer or portable)

**Features to Test**:

1. **Quote Display**
   - [ ] Quotes display in Vietnamese with proper characters (á, à, ả, ã, ạ, etc.)
   - [ ] Author name shown
   - [ ] Quote changes automatically (rotation)

2. **Search**
   - [ ] Click search icon/button
   - [ ] Type a keyword (e.g., "trí tuệ" for wisdom)
   - [ ] Results appear
   - [ ] Click a result to display that quote

3. **Favorites**
   - [ ] Click heart/favorite icon on a quote
   - [ ] Navigate to favorites section
   - [ ] Verify quote was saved
   - [ ] Remove from favorites

4. **System Tray**
   - [ ] Icon appears in system tray (bottom-right)
   - [ ] Left-click icon: toggles window show/hide
   - [ ] Right-click icon: context menu appears
   - [ ] Test menu items:
     - "Show Window" / "Hide Window"
     - "Pause Rotation" / "Resume Rotation"
     - "Next Quote"
     - "Settings" (if available)
     - "Quit"

5. **Quote Overlay** (if enabled)
   - [ ] Press global shortcut (default: Ctrl+Shift+Q) OR
   - [ ] Select from tray menu "Show Overlay"
   - [ ] Overlay window appears with current quote
   - [ ] Overlay auto-dismisses after timeout
   - [ ] Click overlay to dismiss manually

6. **Window Management**
   - [ ] Minimize window → check it goes to tray
   - [ ] Maximize window
   - [ ] Restore window size
   - [ ] Close window → goes to tray (doesn't quit)
   - [ ] Quit from tray menu → app actually closes

### Scenario 4: Multi-Monitor Test (5 minutes, optional)

**Prerequisites**: Two or more monitors connected

**Steps**:
1. Launch application
2. Move window to second monitor
3. Close window (minimize to tray)
4. Open window from tray
5. Verify:
   - [ ] Window reopens on the same monitor
   - [ ] Overlay appears on correct monitor (if triggered)

### Scenario 5: Performance Test (5 minutes)

**Objective**: Verify performance metrics

**Steps**:
1. Launch application and note launch time (should be < 3 seconds)
2. Open Task Manager (Ctrl+Shift+Esc)
3. Find "Buddhist Quotes" processes (will be multiple)
4. Monitor:
   - [ ] Total memory usage: Should be < 400MB
   - [ ] CPU usage at idle: Should be < 5%
   - [ ] CPU during quote rotation: Brief spikes OK
5. Test responsiveness:
   - [ ] Window resizing is smooth
   - [ ] Searching is responsive
   - [ ] Navigation is immediate

### Scenario 6: Restart & Persistence Test (5 minutes)

**Objective**: Verify settings persist across restarts

**Steps**:
1. Launch app
2. Change settings (if settings UI available):
   - Rotation interval
   - Overlay position
   - Favorites
3. Note window size and position
4. Quit app completely (from tray menu)
5. Relaunch app
6. Verify:
   - [ ] Window opens at same size and position
   - [ ] Settings are preserved
   - [ ] Favorites are still there

## Known Issues

None reported yet. Please document any issues you find.

## Reporting Issues

When reporting issues, please include:
1. **Environment**: Windows version (10 or 11), 64-bit
2. **Package Type**: Installer or Portable
3. **Steps to Reproduce**: Detailed steps
4. **Expected Result**: What should happen
5. **Actual Result**: What actually happened
6. **Screenshots**: If applicable
7. **Error Messages**: Copy exact error text
8. **System Info**: RAM, CPU, display resolution

## Success Criteria

All scenarios should pass with no critical issues:
- ✅ Installer installs and uninstalls cleanly
- ✅ Portable runs without installation
- ✅ All core features work
- ✅ System tray integration works
- ✅ Performance is acceptable
- ✅ Settings persist
- ✅ No crashes or data loss

## Next Steps After Testing

1. Document all findings in `WINDOWS_PACKAGING_TEST.md`
2. Report critical bugs immediately
3. Create GitHub issues for any bugs found
4. Proceed to T703 (macOS Packaging) if Windows tests pass

## Contact

For questions about testing, refer to the main project documentation.
