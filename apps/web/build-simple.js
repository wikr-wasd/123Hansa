#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Simple Build Script ===');
console.log('Current directory:', process.cwd());

try {
  // Create workspace structure
  console.log('Creating workspace structure...');
  fs.mkdirSync('packages/shared/src', { recursive: true });
  fs.mkdirSync('packages/ui/src', { recursive: true });
  fs.writeFileSync('packages/shared/src/index.ts', 'export {};');
  fs.writeFileSync('packages/ui/src/index.ts', 'export {};');
  fs.writeFileSync('packages/shared/package.json', JSON.stringify({
    name: '@gohansa/shared',
    version: '1.0.0',
    main: 'src/index.ts'
  }));
  fs.writeFileSync('packages/ui/package.json', JSON.stringify({
    name: '@gohansa/ui',
    version: '1.0.0',
    main: 'src/index.ts'
  }));

  // Already in web directory, go to root first
  console.log('Going to root directory...');
  process.chdir('../..');

  // Install dependencies
  console.log('Installing dependencies...');
  execSync('npm install --include=dev', { stdio: 'inherit' });

  // Build the project
  console.log('Building project...');
  execSync('npm run build', { stdio: 'inherit' });

  // Go back to root
  console.log('Returning to root directory...');
  process.chdir('../..');

  // Copy dist directory
  console.log('Copying dist directory...');
  if (fs.existsSync('apps/web/dist')) {
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true });
    }
    fs.cpSync('apps/web/dist', 'dist', { recursive: true });
    console.log('✅ Build completed successfully!');
  } else {
    console.error('❌ Build failed - no dist directory found');
    process.exit(1);
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}