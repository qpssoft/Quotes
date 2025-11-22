# Buddhist Quotes - Electron Desktop App

Cross-platform desktop application built with Electron and Angular.

## Features

- **System Tray Integration**: Minimize to tray, quick access menu
- **Global Shortcuts**: Control quotes without switching windows
- **Quote Overlays**: Floating quote notifications
- **Auto-Launch**: Start on system startup (optional)
- **Always-on-Top**: Keep window visible while working
- **Cross-Platform**: Windows, macOS, Linux

## Development

### Prerequisites

- Node.js 20+
- npm 10+

### Setup

```bash
# Install dependencies
npm install

# Copy Angular build to renderer
npm run copy:renderer

# Build TypeScript
npm run build

# Start Electron
npm start
```

### Development Workflow

```bash
# Development mode (auto-restart on changes)
npm run dev

# Build all (TypeScript + copy renderer)
npm run build:all

# Clean build artifacts
npm run clean
```

### Building Packages

```bash
# Build for Windows (NSIS installer + portable)
npm run package:win

# Build for macOS (DMG)
npm run package:mac

# Build for Linux (AppImage)
npm run package:linux

# Build for all platforms
npm run package
```

**Build Outputs** (in `release/` directory):
- **Windows**: 
  - `Buddhist Quotes Setup 2.0.0.exe` (NSIS installer, ~73 MB)
  - `Buddhist Quotes 2.0.0.exe` (portable, ~73 MB)
- **macOS**: `Buddhist Quotes.dmg`
- **Linux**: `Buddhist Quotes.AppImage`

### Testing Packages

See [TESTING_GUIDE.md](TESTING_GUIDE.md) for comprehensive testing instructions.

**Quick test portable version**:
```powershell
# Windows
cd release
.\Buddhist` Quotes` 2.0.0.exe
```

## Current Status

### ✅ Completed Features
- Core Electron setup (Phase 1)
- System tray integration (Phase 2)
- Global shortcuts (Phase 3)
- Quote overlay window (Phase 4)
- Desktop features (auto-launch, always-on-top) (Phase 5)
- Settings & preferences (Phase 6)
- Windows packaging (Phase 7 - T701, T702)

### ⏳ In Progress
- Manual testing on Windows 10/11
- macOS packaging (T703)
- Linux packaging (T704)

### 📋 Documentation
- [Testing Guide](TESTING_GUIDE.md) - How to test the packages
- [Windows Packaging Test Report](WINDOWS_PACKAGING_TEST.md) - Detailed test checklist
- [T702 Summary](T702_SUMMARY.md) - Build completion summary

## Project Structure

```
quotes-electron/
├── main/              # Main process (Node.js)
│   └── main.ts       # Entry point, window management
├── preload/          # Preload scripts
│   └── preload.ts   # Context bridge (IPC API)
├── renderer/         # Angular app (copied from quotes-platform/dist)
├── scripts/          # Build scripts
│   └── dev.js       # Development helper
├── dist/             # Compiled TypeScript
└── release/          # Packaged apps
```

## Architecture

- **Main Process**: Electron main process (Node.js) handles system integration (tray, shortcuts, overlays)
- **Preload Script**: Context bridge exposes IPC API to renderer
- **Renderer Process**: Angular app runs in Chromium with context isolation

## IPC Communication

Channel naming convention: `<domain>:<action>`

**Examples**:
- `window:minimize` - Minimize window
- `overlay:show` - Show quote overlay
- `prefs:save` - Save preferences
- `shortcut:register` - Register global shortcut

## Security

- Context isolation enabled
- Node integration disabled in renderer
- All IPC calls go through preload context bridge
- Content Security Policy enforced

## Performance Targets

- Launch time: <2 seconds
- Memory usage: <300MB active
- Package size: <500MB
- CPU usage: <5% during animations

## Tech Stack

- Electron 28+
- TypeScript 5.x (strict mode)
- electron-builder 24+ (packaging)
- electron-updater 6+ (auto-updates)

## License

MIT
