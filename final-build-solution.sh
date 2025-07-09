#!/bin/bash
set -e

echo "=== FINAL BUILD SOLUTION ==="
echo "Working directory: $(pwd)"
echo "Arguments: $@"

# Function to ensure apps/web exists and is accessible
ensure_apps_web() {
    echo "=== ENSURING APPS/WEB EXISTS ==="
    
    # Check if apps/web already exists and is accessible
    if [ -d "apps/web" ] && [ -f "apps/web/package.json" ]; then
        echo "✓ apps/web already exists and is accessible"
        return 0
    fi
    
    echo "apps/web not found or not accessible, creating it..."
    
    # Create apps directory if it doesn't exist
    mkdir -p apps
    
    # Try different sources for web directory
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
        echo "✗ No source directory found for web"
        return 1
    fi
    
    # Verify the result
    if [ -f "apps/web/package.json" ] && [ -f "apps/web/vite.config.ts" ]; then
        echo "✓ apps/web successfully created and verified"
        return 0
    else
        echo "✗ apps/web creation failed verification"
        return 1
    fi
}

# Function to build the web application
build_web() {
    echo "=== BUILDING WEB APPLICATION ==="
    
    # Ensure apps/web exists
    ensure_apps_web
    
    # Navigate to apps/web
    echo "Navigating to apps/web..."
    cd apps/web
    
    # Verify we're in the right place
    if [ ! -f "package.json" ]; then
        echo "✗ No package.json found in $(pwd)"
        exit 1
    fi
    
    echo "✓ Found package.json in $(pwd)"
    
    # Install dependencies
    echo "Installing dependencies..."
    npm install
    
    # Build the application
    echo "Building application..."
    npm run build
    
    echo "✓ Build completed successfully"
}

# Main execution
build_web