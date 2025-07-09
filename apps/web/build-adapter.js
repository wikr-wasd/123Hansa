#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== VERCEL BUILD ADAPTER ===');
console.log('Current directory:', process.cwd());
console.log('Directory contents:');
console.log(fs.readdirSync('.'));

try {
    // Check if we're in the right directory
    if (fs.existsSync('package.json') && fs.existsSync('vite.config.ts')) {
        console.log('✓ Found package.json and vite.config.ts');
        
        // Install dependencies
        console.log('Installing dependencies...');
        execSync('npm install', { stdio: 'inherit' });
        
        // Build the project
        console.log('Building project...');
        execSync('npm run build', { stdio: 'inherit' });
        
        console.log('✓ Build completed successfully!');
    } else {
        console.log('✗ Missing package.json or vite.config.ts');
        process.exit(1);
    }
} catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
}