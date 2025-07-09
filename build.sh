#!/bin/bash
set -e

echo "=== Starting Vercel Build Process ==="
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Create package structure
echo "Creating workspace package structure..."
mkdir -p packages/shared/src packages/ui/src

# Create minimal package files
echo 'export {};' > packages/shared/src/index.ts
echo 'export {};' > packages/ui/src/index.ts
echo '{"name":"@gohansa/shared","version":"1.0.0","main":"src/index.ts"}' > packages/shared/package.json
echo '{"name":"@gohansa/ui","version":"1.0.0","main":"src/index.ts"}' > packages/ui/package.json

# Verify web directory exists
if [ ! -d "apps/web" ]; then
    echo "ERROR: apps/web directory not found"
    echo "Available directories:"
    find . -type d -name "web" 2>/dev/null || echo "No web directories found"
    exit 1
fi

# Build web app
echo "Building web application..."
cd apps/web

# Verify package.json exists
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found in apps/web"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install --include=dev

# Build the application
echo "Building application..."
npm run build

# Verify build output
if [ ! -d "dist" ]; then
    echo "ERROR: Build failed - no dist directory created"
    exit 1
fi

# Copy dist to root for Vercel
echo "Copying build output to root..."
cp -r dist ../../dist

# Verify output
echo "Build output verification:"
ls -la ../../dist/
echo "Build completed successfully"