# T703 Implementation Guide: macOS Packaging

**Date**: November 22, 2025  
**Task**: T703 - macOS Packaging  
**Status**: ⏳ Configuration Complete - Build Requires macOS System

## Overview

This guide documents the macOS packaging configuration and build process for the Buddhist Quotes desktop application.

## Prerequisites

### Required
- **macOS System**: Building macOS packages requires macOS 10.13+ (High Sierra or later)
- **Xcode Command Line Tools**: `xcode-select --install`
- **Node.js**: 20+ installed on macOS
- **npm**: Latest version

### Optional (For Distribution)
- **Apple Developer Account**: $99/year for code signing and notarization
- **Developer ID Certificate**: For code signing
- **Apple ID**: For notarization

## Configuration Status

### ✅ Completed
1. **electron-builder.yml** - macOS build configuration
   - Target: DMG (disk image)
   - Architectures: x64 (Intel) + arm64 (Apple Silicon)
   - Category: Lifestyle
   - Universal binary support

2. **entitlements.mac.plist** - macOS entitlements
   - Network client access enabled
   - JIT and unsigned memory allowed (for Electron)
   - All sensitive permissions disabled (camera, location, etc.)

3. **Package.json** - Build scripts
   - `npm run package:mac` - Build macOS packages

### ⏸️ Pending
1. **icon.icns** - macOS icon file (needs creation)
2. **Code signing** - Requires Apple Developer certificate
3. **Notarization** - Requires Apple ID and app-specific password

## Files Created

### 1. Entitlements File
**Location**: `build/entitlements.mac.plist`

This file defines the security capabilities and permissions for the macOS app:
- ✅ Network client access (for loading data)
- ✅ JIT compilation (required by Electron/Chromium)
- ❌ Camera, microphone, location access (not needed)
- ❌ File system access (not needed)

### 2. Icon Generation Script
**Location**: `scripts/create-mac-icon.js`

Helper script that provides instructions for creating the .icns icon file from the PNG source.

## Building macOS Packages

### Step 1: Create macOS Icon (One-time setup)

#### On macOS (Recommended):
```bash
cd build
mkdir icon.iconset

# Generate all required icon sizes
sips -z 16 16 icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32 icon.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32 icon.png --out icon.iconset/icon_32x32.png
sips -z 64 64 icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128 icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256 icon.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256 icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512 icon.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512 icon.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png

# Convert to .icns
iconutil -c icns icon.iconset -o icon.icns

# Cleanup
rm -rf icon.iconset
cd ..
```

#### Alternative Methods:
1. **Online Converter**: https://cloudconvert.com/png-to-icns
2. **npm package**: `npm install -g png2icons && png2icons build/icon.png build -icns`
3. **Let electron-builder convert**: It will auto-convert PNG (not optimal but works)

### Step 2: Build DMG Package

On a macOS machine:

```bash
# Navigate to project
cd quotes-electron

# Install dependencies (if not already installed)
npm install

# Build TypeScript and copy renderer
npm run build:all

# Build macOS package
npm run package:mac
```

This will create:
- `release/Buddhist Quotes-2.0.0-universal.dmg` - Universal binary (Intel + Apple Silicon)
- `release/Buddhist Quotes-2.0.0-arm64-mac.zip` - Apple Silicon only (optional)
- `release/Buddhist Quotes-2.0.0-x64-mac.zip` - Intel only (optional)

### Expected Package Size
- **DMG**: ~150-200 MB (universal binary includes both architectures)
- **ZIP**: ~100-120 MB (single architecture)

## Testing on macOS

### Test Scenarios

#### 1. Installation Test
```bash
# Mount the DMG
open "release/Buddhist Quotes-2.0.0-universal.dmg"

# Drag to Applications folder
# Launch from Applications

# Verify:
# - App launches successfully
# - Icon appears in Dock
# - Menu bar shows "Buddhist Quotes"
```

#### 2. Intel Mac Test (x64)
- Run on Mac with Intel processor
- Verify all features work
- Check performance
- Test system tray integration
- Test global shortcuts

#### 3. Apple Silicon Test (arm64)
- Run on Mac with M1/M2/M3 chip
- Verify native ARM performance
- Ensure no Rosetta 2 required
- Test all features

#### 4. macOS Versions
- Test on macOS 13 (Ventura)
- Test on macOS 14 (Sonoma)
- Test on macOS 15 (Sequoia) if available

### Feature Verification Checklist
- [ ] App launches successfully
- [ ] Quotes display with Vietnamese text
- [ ] Search functionality works
- [ ] Favorites can be added/removed
- [ ] Menu bar icon appears (system tray)
- [ ] Right-click menu works on tray icon
- [ ] Global shortcuts function (Cmd+Shift+Q, etc.)
- [ ] Quote overlay displays correctly
- [ ] Always-on-top mode works
- [ ] Window state persists across restarts
- [ ] Auto-launch preference works (System Settings > Login Items)
- [ ] Multi-monitor support functions
- [ ] App can be quit properly

## Code Signing (Optional - For Distribution)

Code signing is required to distribute outside the App Store and avoid Gatekeeper warnings.

### Setup

1. **Enroll in Apple Developer Program**
   - Visit: https://developer.apple.com/programs/
   - Cost: $99/year
   - Wait for approval (1-2 days)

2. **Create Developer ID Certificate**
   - Open Xcode
   - Go to Xcode > Preferences > Accounts
   - Add Apple ID
   - Manage Certificates > + > Developer ID Application
   - Download certificate

3. **Configure electron-builder**

Update `electron-builder.yml`:
```yaml
mac:
  identity: "Developer ID Application: Your Name (TEAM_ID)"
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist
```

4. **Build with Signing**
```bash
# Set certificate identity
export CSC_NAME="Developer ID Application: Your Name (TEAM_ID)"

# Build
npm run package:mac
```

## Notarization (Optional - For Distribution)

Notarization is required for macOS 10.15+ to avoid Gatekeeper warnings.

### Setup

1. **Generate App-Specific Password**
   - Visit: https://appleid.apple.com
   - Sign in with Apple ID
   - Generate app-specific password for "electron-builder"
   - Save password securely

2. **Configure Environment Variables**
```bash
export APPLE_ID="your-apple-id@email.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="YOUR_TEAM_ID"
```

3. **Update electron-builder.yml**
```yaml
mac:
  notarize: {
    teamId: "YOUR_TEAM_ID"
  }
```

4. **Build with Notarization**
```bash
npm run package:mac
```

electron-builder will automatically:
- Upload to Apple for notarization
- Wait for approval (5-10 minutes)
- Staple the notarization ticket to the DMG

## Troubleshooting

### Issue: "App is damaged and can't be opened"
**Solution**: App needs to be code signed
```bash
# Temporary workaround for testing (not for distribution):
xattr -cr /Applications/Buddhist\ Quotes.app
```

### Issue: "App can't be opened because it is from an unidentified developer"
**Solution**: 
1. Right-click app → Open → Confirm
2. Or: System Settings → Privacy & Security → Allow anyway
3. Or: Code sign the app

### Issue: Build fails with "Cannot find module 'dmg-builder'"
**Solution**:
```bash
npm install --save-dev dmg-builder
```

### Issue: Icon not appearing correctly
**Solution**: Ensure icon.icns is properly formatted with all required sizes

### Issue: Build takes very long time
**Cause**: Building universal binary (Intel + ARM)
**Solution**: Build for specific architecture only:
```bash
# Intel only
npx electron-builder --mac --x64

# Apple Silicon only
npx electron-builder --mac --arm64
```

## CI/CD Setup

For automated builds, use GitHub Actions with macOS runners:

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release-mac:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
      
      - name: Install dependencies
        run: |
          cd quotes-electron
          npm install
      
      - name: Build Angular app
        run: |
          cd quotes-platform
          npm install
          npm run build -- --base-href "./"
      
      - name: Build Electron app
        run: |
          cd quotes-electron
          npm run build:all
          npm run package:mac
        env:
          CSC_NAME: ${{ secrets.MAC_CERT_NAME }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: macos-dmg
          path: quotes-electron/release/*.dmg
```

## Distribution

### App Store
- Requires different bundle ID and entitlements
- Use `mac-store` target in electron-builder
- Submit via Xcode or Transporter app

### Direct Download
- Upload DMG to website
- Provide SHA256 checksum
- Include installation instructions

### Auto-Update
- Configure electron-updater
- Host releases on GitHub Releases or custom server
- See T705 for auto-update setup

## Documentation for Users

### Installation Instructions
```markdown
## Installing Buddhist Quotes on macOS

1. Download `Buddhist-Quotes-2.0.0-universal.dmg`
2. Double-click the DMG file to mount it
3. Drag "Buddhist Quotes" to your Applications folder
4. Eject the DMG
5. Open "Buddhist Quotes" from Applications

### First Launch
If you see "App can't be opened" warning:
1. Right-click the app in Applications
2. Select "Open"
3. Click "Open" in the confirmation dialog
```

## Next Steps

1. ✅ Configuration complete (entitlements, build config)
2. ⏳ Create icon.icns on macOS system
3. ⏳ Build DMG on macOS machine
4. ⏳ Test on Intel and Apple Silicon Macs
5. ⏳ Test on multiple macOS versions
6. ⏸️ Optional: Setup code signing
7. ⏸️ Optional: Setup notarization
8. ⏸️ Optional: Submit to App Store

## Status

**Configuration**: ✅ Complete  
**Icon Creation**: ⏸️ Requires macOS  
**Build**: ⏸️ Requires macOS  
**Testing**: ⏸️ Requires macOS hardware  
**Code Signing**: ⏸️ Optional - Requires Apple Developer account  
**Notarization**: ⏸️ Optional - Requires Apple Developer account  

## Estimated Timeline

- Icon creation: 15 minutes (on macOS)
- First build: 10-15 minutes
- Testing: 1-2 hours (Intel + Apple Silicon)
- Code signing setup: 1-2 hours (if needed)
- Notarization setup: 30 minutes (if needed)

**Total**: 2-4 hours on macOS system

## Resources

- [electron-builder macOS docs](https://www.electron.build/configuration/mac)
- [Apple Developer Program](https://developer.apple.com/programs/)
- [Code Signing Guide](https://www.electron.build/code-signing)
- [Notarization Guide](https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/)

---

**Created**: November 22, 2025  
**Author**: GitHub Copilot  
**Next**: Build and test on macOS system
