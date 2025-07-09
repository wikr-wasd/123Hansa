#!/bin/bash
set -e

echo "=== VERCEL BUILD FIX ==="
echo "Working directory: $(pwd)"
echo "Contents of current directory:"
ls -la

# Debug environment
echo "=== ENVIRONMENT DEBUG ==="
echo "NODE_ENV: $NODE_ENV"
echo "User: $(whoami)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Function to ensure directory structure
ensure_structure() {
    echo "=== ENSURING DIRECTORY STRUCTURE ==="
    
    # Check if we're in the right place
    if [ ! -f "package.json" ]; then
        echo "✗ No package.json found in root"
        exit 1
    fi
    
    # Check if apps/web exists
    if [ -d "apps/web" ] && [ -f "apps/web/package.json" ]; then
        echo "✓ apps/web already exists"
        return 0
    fi
    
    # Create apps directory
    mkdir -p apps
    
    # Try to find web source
    if [ -d "apps-backup/web" ]; then
        echo "Using apps-backup/web as source"
        cp -r apps-backup/web apps/web
    elif [ -L "web" ] && [ -d "web" ]; then
        echo "Using web symlink as source"
        cp -r web apps/web
    elif [ -d "web" ]; then
        echo "Using web directory as source"
        cp -r web apps/web
    else
        echo "✗ No source directory found"
        exit 1
    fi
    
    # Verify
    if [ -f "apps/web/package.json" ]; then
        echo "✓ apps/web created successfully"
    else
        echo "✗ Failed to create apps/web"
        exit 1
    fi
}

# Function to build
build_app() {
    echo "=== BUILDING APPLICATION ==="
    
    # Ensure structure
    ensure_structure
    
    # Navigate to web directory
    cd apps/web
    
    # Check if we're in the right place
    if [ ! -f "package.json" ]; then
        echo "✗ No package.json in $(pwd)"
        exit 1
    fi
    
    echo "✓ In directory: $(pwd)"
    echo "Contents:"
    ls -la
    
    # Install dependencies
    echo "Installing dependencies..."
    npm ci --production=false
    
    # Build
    echo "Building application..."
    npm run build
    
    # Verify build
    if [ -d "dist" ]; then
        echo "✓ Build successful"
        echo "Build output:"
        ls -la dist/
    else
        echo "✗ Build failed - no dist directory"
        exit 1
    fi
}

# Main execution
build_app