#!/bin/bash
set -e

echo "=== VERCEL BUILD DEBUG ==="
echo "Current directory: $(pwd)"
echo "Contents of current directory:"
ls -la

echo "Checking if apps directory exists:"
if [ -d "apps" ]; then
    echo "✓ apps directory exists"
    echo "Contents of apps directory:"
    ls -la apps/
    
    echo "Checking if apps/web exists:"
    if [ -d "apps/web" ]; then
        echo "✓ apps/web directory exists"
        echo "Contents of apps/web directory:"
        ls -la apps/web/
        
        echo "Navigating to apps/web and building..."
        cd apps/web
        echo "Installing dependencies..."
        npm install
        echo "Building application..."
        npm run build
        echo "Build completed successfully!"
    else
        echo "✗ apps/web directory not found"
        echo "Available directories in apps/:"
        find apps/ -type d -maxdepth 1 2>/dev/null || echo "No directories found"
        exit 1
    fi
else
    echo "✗ apps directory not found"
    echo "Available directories:"
    find . -type d -maxdepth 1 2>/dev/null || echo "No directories found"
    exit 1
fi