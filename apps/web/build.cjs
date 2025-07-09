const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Build Script Started ===');
console.log('Current directory:', process.cwd());

// Find root directory - go up until we find the project root
let rootDir = process.cwd();
console.log('Starting search from:', rootDir);

// Keep going up until we find the root (has package.json with workspaces and apps directory)
while (rootDir !== path.dirname(rootDir)) {
  console.log('Checking directory:', rootDir);
  
  const packageJsonPath = path.join(rootDir, 'package.json');
  const appsPath = path.join(rootDir, 'apps');
  
  if (fs.existsSync(packageJsonPath) && fs.existsSync(appsPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.workspaces) {
        console.log('✓ Found project root at:', rootDir);
        break;
      }
    } catch (e) {
      console.log('Failed to parse package.json, continuing search...');
    }
  }
  
  rootDir = path.dirname(rootDir);
}

console.log('Final root dir:', rootDir);
process.chdir(rootDir);

// Create workspace structure
fs.mkdirSync('packages/shared/src', {recursive: true});
fs.mkdirSync('packages/ui/src', {recursive: true});
fs.writeFileSync('packages/shared/src/index.ts', 'export {};');
fs.writeFileSync('packages/ui/src/index.ts', 'export {};');
fs.writeFileSync('packages/shared/package.json', JSON.stringify({name: '@gohansa/shared', version: '1.0.0', main: 'src/index.ts'}));
fs.writeFileSync('packages/ui/package.json', JSON.stringify({name: '@gohansa/ui', version: '1.0.0', main: 'src/index.ts'}));

// Build web app
process.chdir('apps/web');
execSync('npm install --include=dev', {stdio: 'inherit'});
execSync('npm run build', {stdio: 'inherit'});

// Copy to root
process.chdir(rootDir);
fs.cpSync('apps/web/dist', 'dist', {recursive: true});
console.log('Build completed successfully');