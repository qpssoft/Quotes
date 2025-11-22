# macOS Build Quick Reference

## On macOS System

### One-Time Setup

1. **Create macOS Icon**
```bash
cd build
node ../scripts/create-mac-icon.js  # Follow instructions
# Or manually:
mkdir icon.iconset
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
iconutil -c icns icon.iconset -o icon.icns
rm -rf icon.iconset
cd ..
```

2. **Install Dependencies**
```bash
npm install
cd ../quotes-platform && npm install && cd ../quotes-electron
```

### Build Commands

**Standard Build (Universal Binary)**
```bash
npm run package:mac
# Creates: release/Buddhist Quotes-2.0.0-universal.dmg (~150-200 MB)
```

**Intel Only**
```bash
npx electron-builder --mac --x64
# Creates: release/Buddhist Quotes-2.0.0-x64.dmg (~100 MB)
```

**Apple Silicon Only**
```bash
npx electron-builder --mac --arm64
# Creates: release/Buddhist Quotes-2.0.0-arm64.dmg (~100 MB)
```

**With Code Signing**
```bash
export CSC_NAME="Developer ID Application: Your Name (TEAM_ID)"
npm run package:mac
```

**With Notarization**
```bash
export APPLE_ID="your-apple-id@email.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="YOUR_TEAM_ID"
npm run package:mac
```

### Testing

**Install from DMG**
```bash
open "release/Buddhist Quotes-2.0.0-universal.dmg"
# Drag to Applications
# Launch from Applications folder
```

**Check Architecture**
```bash
file /Applications/Buddhist\ Quotes.app/Contents/MacOS/Buddhist\ Quotes
# Should show: Mach-O universal binary with 2 architectures
```

**Remove Quarantine (Testing Only)**
```bash
xattr -cr /Applications/Buddhist\ Quotes.app
```

### Troubleshooting

**Clear electron-builder cache**
```bash
rm -rf node_modules/.cache
```

**Rebuild from scratch**
```bash
npm run clean
npm run build:all
npm run package:mac
```

**Check notarization status**
```bash
xcrun notarytool history --apple-id your@email.com
```

## On Windows/Linux (This Machine)

You cannot build macOS packages directly, but you can:

1. **Prepare files for macOS build**:
   - Configuration is done ✅
   - entitlements.mac.plist created ✅
   - Build scripts ready ✅

2. **Use CI/CD**:
   - Push to GitHub
   - Let GitHub Actions build on macOS runner
   - See `.github/workflows/release.yml` (to be created)

3. **Use remote macOS**:
   - macOS in the Cloud (MacStadium, AWS EC2 Mac)
   - SSH to remote Mac and build there

## Output Files

After successful build, you'll find in `release/`:

```
Buddhist Quotes-2.0.0-universal.dmg          # Universal installer
Buddhist Quotes-2.0.0-universal-mac.zip      # Universal ZIP
Buddhist Quotes-2.0.0-x64.dmg                # Intel only (if built)
Buddhist Quotes-2.0.0-arm64.dmg              # Apple Silicon only (if built)
builder-effective-config.yaml                # Build configuration
```

## Quick Test Checklist

After installing on macOS:

- [ ] App launches
- [ ] Quotes display
- [ ] Search works
- [ ] System tray icon appears in menu bar
- [ ] Right-click menu on tray
- [ ] Global shortcuts (Cmd+Shift+Q, etc.)
- [ ] Overlay shows
- [ ] Window state persists
- [ ] Auto-launch setting works
- [ ] Can quit properly

## Resources

- Full guide: `MACOS_PACKAGING_GUIDE.md`
- Icon creation: `scripts/create-mac-icon.js`
- electron-builder: https://www.electron.build/configuration/mac
