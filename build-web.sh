#!/bin/bash
set -e

echo "=== ROBUST WEB BUILD SCRIPT ==="
echo "Current directory: $(pwd)"
echo "User: $(whoami)"
echo "Available directories:"
ls -la

# Check if we're already in the web directory
if [ -f "package.json" ] && [ -f "vite.config.ts" ]; then
    echo "✓ Already in web directory"
    echo "Installing dependencies..."
    npm install
    echo "Building application..."
    npm run build
    echo "Build completed!"
    exit 0
fi

# Check if apps/web exists
if [ -d "apps/web" ]; then
    echo "✓ Found apps/web directory"
    cd apps/web
    echo "Installing dependencies..."
    npm install
    echo "Building application..."
    npm run build
    echo "Build completed!"
    exit 0
fi

# Try to find web directory anywhere
WEB_DIR=$(find . -name "web" -type d -path "*/apps/*" 2>/dev/null | head -1)
if [ -n "$WEB_DIR" ]; then
    echo "✓ Found web directory at: $WEB_DIR"
    cd "$WEB_DIR"
    echo "Installing dependencies..."
    npm install
    echo "Building application..."
    npm run build
    echo "Build completed!"
    exit 0
fi

# Look for any directory with vite.config.ts
VITE_DIR=$(find . -name "vite.config.ts" -type f 2>/dev/null | head -1 | xargs dirname)
if [ -n "$VITE_DIR" ]; then
    echo "✓ Found Vite project at: $VITE_DIR"
    cd "$VITE_DIR"
    echo "Installing dependencies..."
    npm install
    echo "Building application..."
    npm run build
    echo "Build completed!"
    exit 0
fi

echo "✗ Could not find web directory or Vite project"
echo "Available structure:"
find . -type d -maxdepth 3 2>/dev/null || echo "Cannot list directories"
exit 1