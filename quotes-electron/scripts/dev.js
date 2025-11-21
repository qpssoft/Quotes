#!/usr/bin/env node

/**
 * Development Helper Script
 * Watches TypeScript files and rebuilds on changes
 */

const { spawn } = require('child_process');
const path = require('path');

let electronProcess = null;

function buildAndStart() {
  console.log('Building TypeScript...');
  
  const build = spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    shell: true,
  });

  build.on('close', (code) => {
    if (code === 0) {
      console.log('Build successful. Starting Electron...');
      startElectron();
    } else {
      console.error('Build failed with code', code);
    }
  });
}

function startElectron() {
  if (electronProcess) {
    electronProcess.kill();
  }

  electronProcess = spawn('electron', ['.'], {
    stdio: 'inherit',
    shell: true,
  });

  electronProcess.on('close', () => {
    electronProcess = null;
  });
}

// Initial build and start
buildAndStart();

// Cleanup on exit
process.on('SIGINT', () => {
  if (electronProcess) {
    electronProcess.kill();
  }
  process.exit();
});
