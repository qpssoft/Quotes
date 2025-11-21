# React Native Windows Development Scripts

This directory contains helper scripts for building and running the React Native Windows app.

## Available Scripts

### build-windows.ps1

Build and optionally launch the React Native Windows application.

**Usage:**
```powershell
# Build Debug (default)
.\scripts\build-windows.ps1

# Build and launch Debug
.\scripts\build-windows.ps1 -Launch

# Build Release
.\scripts\build-windows.ps1 -Release

# Build and launch Release
.\scripts\build-windows.ps1 -Release -Launch
```

**Parameters:**
- `-Release`: Build in Release configuration (optimized, no debugging)
- `-Launch`: Automatically launch the app after building

**Examples:**
```powershell
# Quick development build (Debug, no launch)
.\scripts\build-windows.ps1

# Build and test immediately
.\scripts\build-windows.ps1 -Launch

# Production build
.\scripts\build-windows.ps1 -Release -Launch
```

### fix-paths.js

Post-build script that fixes HTML paths for GitHub Pages deployment with subpath `/Quotes/App/`.

**Usage:**
```bash
# Automatically runs after build:web
npm run build:web

# Or manually
node scripts/fix-paths.js
```

## Build Output Locations

- **Debug Build**: `windows\x64\Debug\QuotesNative\QuotesNative.exe`
- **Release Build**: `windows\x64\Release\QuotesNative\QuotesNative.exe`
- **Web Build**: `dist/` directory

## First Build Notes

The first Windows build will take 5-15 minutes as it compiles:
- React Native Windows core libraries
- C++ WinRT components
- Microsoft.ReactNative framework
- All native modules (AsyncStorage, Screens, etc.)

Subsequent builds are much faster (30 seconds to 2 minutes).

## Troubleshooting

### Build fails with "Windows SDK not found"
Make sure Windows SDK 11 (10.0.22621.0) is installed via Visual Studio Installer.

### Build fails with NuGet errors
Run from quotes-native directory:
```powershell
cd windows
dotnet restore QuotesNative.sln
cd ..
npx @react-native-community/cli run-windows --no-launch --arch x64
```

### App doesn't launch
Manually launch from:
```powershell
cd windows\x64\Debug\QuotesNative
.\QuotesNative.exe
```

### Clean build
```powershell
Remove-Item -Recurse -Force windows\x64
.\scripts\build-windows.ps1
```
