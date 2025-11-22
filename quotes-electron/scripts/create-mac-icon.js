#!/usr/bin/env node

/**
 * Generate macOS .icns icon from PNG
 * This script creates a macOS icon file from the source PNG
 * 
 * Note: On macOS, you can use the native iconutil tool
 * On Windows/Linux, you need to install iconutil via npm or use online converters
 */

const fs = require('fs');
const path = require('path');

console.log('macOS Icon Generation Guide');
console.log('============================\n');

const iconPng = path.join(__dirname, '../build/icon.png');
const iconIcns = path.join(__dirname, '../build/icon.icns');

if (!fs.existsSync(iconPng)) {
  console.error('❌ Error: build/icon.png not found!');
  console.error('Please ensure you have a 1024x1024 PNG icon at build/icon.png');
  process.exit(1);
}

console.log('📋 Options to create icon.icns:');
console.log('');
console.log('Option 1 - On macOS (Recommended):');
console.log('----------------------------------');
console.log('1. Create an iconset directory:');
console.log('   mkdir icon.iconset');
console.log('');
console.log('2. Generate all required sizes from icon.png:');
console.log('   sips -z 16 16     icon.png --out icon.iconset/icon_16x16.png');
console.log('   sips -z 32 32     icon.png --out icon.iconset/icon_16x16@2x.png');
console.log('   sips -z 32 32     icon.png --out icon.iconset/icon_32x32.png');
console.log('   sips -z 64 64     icon.png --out icon.iconset/icon_32x32@2x.png');
console.log('   sips -z 128 128   icon.png --out icon.iconset/icon_128x128.png');
console.log('   sips -z 256 256   icon.png --out icon.iconset/icon_128x128@2x.png');
console.log('   sips -z 256 256   icon.png --out icon.iconset/icon_256x256.png');
console.log('   sips -z 512 512   icon.png --out icon.iconset/icon_256x256@2x.png');
console.log('   sips -z 512 512   icon.png --out icon.iconset/icon_512x512.png');
console.log('   sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png');
console.log('');
console.log('3. Convert to .icns:');
console.log('   iconutil -c icns icon.iconset -o build/icon.icns');
console.log('');
console.log('Option 2 - Online Converter:');
console.log('----------------------------');
console.log('Visit: https://cloudconvert.com/png-to-icns');
console.log('Upload: build/icon.png');
console.log('Convert and download as: icon.icns');
console.log('Place in: build/icon.icns');
console.log('');
console.log('Option 3 - Use png2icons npm package:');
console.log('-------------------------------------');
console.log('npm install -g png2icons');
console.log('png2icons build/icon.png build -icns');
console.log('');
console.log('Option 4 - Skip for now:');
console.log('------------------------');
console.log('electron-builder will use the PNG and convert it automatically');
console.log('(Results may not be optimal, but will work)');
console.log('');

// Check if we're on macOS and can use iconutil
if (process.platform === 'darwin') {
  console.log('✓ You are on macOS! Use Option 1 for best results.');
  console.log('');
  console.log('Quick script to run all commands:');
  console.log('');
  console.log('cd build');
  console.log('mkdir -p icon.iconset');
  console.log('sips -z 16 16 icon.png --out icon.iconset/icon_16x16.png');
  console.log('sips -z 32 32 icon.png --out icon.iconset/icon_16x16@2x.png');
  console.log('sips -z 32 32 icon.png --out icon.iconset/icon_32x32.png');
  console.log('sips -z 64 64 icon.png --out icon.iconset/icon_32x32@2x.png');
  console.log('sips -z 128 128 icon.png --out icon.iconset/icon_128x128.png');
  console.log('sips -z 256 256 icon.png --out icon.iconset/icon_128x128@2x.png');
  console.log('sips -z 256 256 icon.png --out icon.iconset/icon_256x256.png');
  console.log('sips -z 512 512 icon.png --out icon.iconset/icon_256x256@2x.png');
  console.log('sips -z 512 512 icon.png --out icon.iconset/icon_512x512.png');
  console.log('sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png');
  console.log('iconutil -c icns icon.iconset -o icon.icns');
  console.log('rm -rf icon.iconset');
} else {
  console.log('ℹ️  You are on ' + process.platform + '. Use Option 2 or 3.');
}

console.log('');
console.log('After creating icon.icns, you can build macOS packages with:');
console.log('npm run package:mac');
