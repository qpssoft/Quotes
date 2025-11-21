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
# Build for Windows
npm run package:win

# Build for macOS
npm run package:mac

# Build for Linux
npm run package:linux

# Build for all platforms
npm run package
```

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
