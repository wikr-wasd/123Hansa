const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find root directory
let rootDir = process.cwd();
while (!fs.existsSync(path.join(rootDir, 'package.json')) || !fs.existsSync(path.join(rootDir, 'apps'))) {
  rootDir = path.dirname(rootDir);
}

console.log('Root dir:', rootDir);
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