#!/bin/bash
set -e

echo "=== Robust Vercel Build Process ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Current directory: $(pwd)"

# Function to check if build was successful
check_build_success() {
    if [ -d "dist" ] && [ -f "dist/index.html" ]; then
        echo "✓ Build successful - dist directory contains index.html"
        return 0
    else
        echo "✗ Build failed - no dist/index.html found"
        return 1
    fi
}

# Function to clean up previous builds
cleanup_previous_builds() {
    echo "Cleaning up previous builds..."
    rm -rf dist
    rm -rf apps/web/dist
}

# Function to setup workspace structure
setup_workspace() {
    echo "Setting up workspace structure..."
    mkdir -p packages/shared/src packages/ui/src
    echo 'export {};' > packages/shared/src/index.ts
    echo 'export {};' > packages/ui/src/index.ts
    echo '{"name":"@gohansa/shared","version":"1.0.0","main":"src/index.ts"}' > packages/shared/package.json
    echo '{"name":"@gohansa/ui","version":"1.0.0","main":"src/index.ts"}' > packages/ui/package.json
}

# Function to build from apps/web
build_from_apps_web() {
    echo "Attempting to build from apps/web..."
    
    if [ ! -d "apps/web" ]; then
        echo "✗ apps/web directory not found"
        return 1
    fi
    
    cd apps/web
    
    if [ ! -f "package.json" ]; then
        echo "✗ package.json not found in apps/web"
        return 1
    fi
    
    echo "Installing dependencies in apps/web..."
    npm install --include=dev
    
    echo "Building application..."
    npm run build
    
    if check_build_success; then
        echo "Copying build output to root..."
        cp -r dist ../../dist
        return 0
    else
        return 1
    fi
}

# Function to build using npm workspace
build_using_workspace() {
    echo "Attempting to build using npm workspace..."
    
    if [ ! -f "package.json" ]; then
        echo "✗ Root package.json not found"
        return 1
    fi
    
    echo "Installing dependencies..."
    npm install
    
    echo "Building using vercel:build script..."
    npm run vercel:build
    
    if check_build_success; then
        return 0
    else
        return 1
    fi
}

# Function to build directly from web directory
build_from_web_direct() {
    echo "Looking for web directory..."
    
    local web_dir=""
    
    # Try to find web directory
    if [ -d "web" ]; then
        web_dir="web"
    elif [ -d "apps/web" ]; then
        web_dir="apps/web"
    else
        web_dir=$(find . -name "web" -type d | head -1)
    fi
    
    if [ -z "$web_dir" ]; then
        echo "✗ No web directory found"
        return 1
    fi
    
    echo "Building from $web_dir..."
    cd "$web_dir"
    
    if [ ! -f "package.json" ]; then
        echo "✗ package.json not found in $web_dir"
        return 1
    fi
    
    npm install --include=dev
    npm run build
    
    if check_build_success; then
        # Copy to root if not already there
        if [ "$web_dir" != "." ]; then
            cp -r dist ../dist
        fi
        return 0
    else
        return 1
    fi
}

# Main build process
main() {
    cleanup_previous_builds
    setup_workspace
    
    # Try different build strategies
    echo "=== Build Strategy 1: apps/web ==="
    if build_from_apps_web; then
        echo "✓ Build successful using apps/web strategy"
        return 0
    fi
    
    echo "=== Build Strategy 2: npm workspace ==="
    if build_using_workspace; then
        echo "✓ Build successful using npm workspace strategy"
        return 0
    fi
    
    echo "=== Build Strategy 3: direct web directory ==="
    if build_from_web_direct; then
        echo "✓ Build successful using direct web directory strategy"
        return 0
    fi
    
    echo "✗ All build strategies failed"
    exit 1
}

# Run main function
main

echo "=== Final Build Verification ==="
if [ -d "dist" ]; then
    echo "Build output:"
    ls -la dist/
    echo "✓ Build completed successfully"
else
    echo "✗ Final build verification failed"
    exit 1
fi