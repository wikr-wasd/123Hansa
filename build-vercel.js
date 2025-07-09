#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Vercel Build Script ===');
console.log('Current directory:', process.cwd());
console.log('Script location:', __filename);

// Ensure we're in the root directory
const rootDir = path.resolve(__dirname);
console.log('Root directory:', rootDir);
process.chdir(rootDir);

try {
  // Create workspace structure
  console.log('Creating workspace structure...');
  const sharedDir = path.join(rootDir, 'packages', 'shared', 'src');
  const uiDir = path.join(rootDir, 'packages', 'ui', 'src');
  
  fs.mkdirSync(sharedDir, { recursive: true });
  fs.mkdirSync(uiDir, { recursive: true });
  
  fs.writeFileSync(path.join(sharedDir, 'index.ts'), 'export {};');
  fs.writeFileSync(path.join(uiDir, 'index.ts'), 'export {};');
  
  fs.writeFileSync(path.join(rootDir, 'packages', 'shared', 'package.json'), JSON.stringify({
    name: '@gohansa/shared',
    version: '1.0.0',
    main: 'src/index.ts'
  }));
  
  fs.writeFileSync(path.join(rootDir, 'packages', 'ui', 'package.json'), JSON.stringify({
    name: '@gohansa/ui',
    version: '1.0.0',
    main: 'src/index.ts'
  }));

  // Change to web directory
  const webDir = path.join(rootDir, 'apps', 'web');
  console.log('Changing to web directory:', webDir);
  process.chdir(webDir);

  // Install dependencies
  console.log('Installing dependencies...');
  execSync('npm install --include=dev', { stdio: 'inherit' });

  // Build the project
  console.log('Building project...');
  execSync('npm run build', { stdio: 'inherit' });

  // Go back to root
  console.log('Returning to root directory...');
  process.chdir(rootDir);

  // Copy dist directory
  console.log('Copying dist directory...');
  const webDistDir = path.join(webDir, 'dist');
  const rootDistDir = path.join(rootDir, 'dist');
  
  if (fs.existsSync(webDistDir)) {
    if (fs.existsSync(rootDistDir)) {
      fs.rmSync(rootDistDir, { recursive: true });
    }
    fs.cpSync(webDistDir, rootDistDir, { recursive: true });
    console.log('✅ Build completed successfully!');
  } else {
    console.error('❌ Build failed - no dist directory found');
    process.exit(1);
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}