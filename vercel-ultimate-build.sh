#!/bin/bash
set -e

echo "=== VERCEL ULTIMATE BUILD SOLUTION ==="
echo "Working directory: $(pwd)"

# Show what we have access to
echo "=== DIRECTORY STRUCTURE ==="
ls -la
echo ""

echo "=== SEARCHING FOR APPS DIRECTORY ==="
find . -name "apps" -type d 2>/dev/null || echo "No apps directory found"
echo ""

echo "=== SEARCHING FOR WEB DIRECTORY ==="
find . -name "web" -type d 2>/dev/null || echo "No web directory found"
echo ""

echo "=== CHECKING FOR APPS/WEB SPECIFICALLY ==="
if [ -d "apps/web" ]; then
    echo "✓ apps/web directory found"
    echo "Contents:"
    ls -la apps/web/
    echo ""
    echo "=== BUILDING FROM APPS/WEB ==="
    cd apps/web
    echo "Installing dependencies..."
    npm install
    echo "Building application..."
    npm run build
    echo "Build completed from apps/web!"
    
elif [ -d "apps" ]; then
    echo "✓ apps directory found but no web subdirectory"
    echo "Contents of apps:"
    ls -la apps/
    echo ""
    
    # Check if web directory exists elsewhere
    echo "=== LOOKING FOR WEB DIRECTORY IN APPS ==="
    find apps/ -name "web" -type d 2>/dev/null || echo "No web directory in apps"
    
    # Try to find package.json for web app
    echo "=== LOOKING FOR WEB PACKAGE.JSON ==="
    find . -name "package.json" -path "*/web/*" 2>/dev/null || echo "No web package.json found"
    
    exit 1
    
else
    echo "✗ No apps directory found"
    echo "=== FULL DIRECTORY TREE ==="
    find . -type d -maxdepth 3 2>/dev/null || echo "Cannot list directories"
    echo ""
    
    echo "=== LOOKING FOR PACKAGE.JSON FILES ==="
    find . -name "package.json" -maxdepth 3 2>/dev/null || echo "No package.json files found"
    echo ""
    
    exit 1
fi