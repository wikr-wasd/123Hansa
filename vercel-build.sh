#!/bin/bash
set -e

echo "=== VERCEL BUILD SCRIPT ==="
echo "Working directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Create packages directory structure if it doesn't exist
echo "Creating packages directory structure..."
mkdir -p packages/shared/src packages/ui/src

# Create minimal package.json files for the packages if they don't exist
if [ ! -f "packages/shared/package.json" ]; then
    echo "Creating packages/shared/package.json..."
    cat > packages/shared/package.json << 'EOF'
{
  "name": "@gohansa/shared",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts"
}
EOF
fi

if [ ! -f "packages/ui/package.json" ]; then
    echo "Creating packages/ui/package.json..."
    cat > packages/ui/package.json << 'EOF'
{
  "name": "@gohansa/ui",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts"
}
EOF
fi

# Create minimal index files for the packages
if [ ! -f "packages/shared/src/index.ts" ]; then
    echo "Creating packages/shared/src/index.ts..."
    echo "export {};" > packages/shared/src/index.ts
fi

if [ ! -f "packages/ui/src/index.ts" ]; then
    echo "Creating packages/ui/src/index.ts..."
    echo "export {};" > packages/ui/src/index.ts
fi

# Navigate to web app directory
echo "Navigating to apps/web..."
cd apps/web

# Install dependencies
echo "Installing web app dependencies..."
npm install --include=dev

# Check if all required files exist
echo "Checking required files..."
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found in apps/web"
    exit 1
fi

if [ ! -f "vite.config.ts" ]; then
    echo "Error: vite.config.ts not found"
    exit 1
fi

if [ ! -f "tsconfig.json" ]; then
    echo "Error: tsconfig.json not found"
    exit 1
fi

# Clean any existing dist
echo "Cleaning existing dist..."
rm -rf dist

# Build the application
echo "Building application..."
npm run build

# Verify build output
echo "Verifying build output..."
if [ -d "dist" ]; then
    echo "✓ Build output directory exists"
    echo "Contents:"
    ls -la dist/
    
    # Check for essential files
    if [ -f "dist/index.html" ]; then
        echo "✓ index.html found"
    else
        echo "✗ index.html missing"
        exit 1
    fi
    
    if [ -d "dist/assets" ]; then
        echo "✓ assets directory found"
    else
        echo "✗ assets directory missing"
        exit 1
    fi
else
    echo "✗ Build output directory missing"
    exit 1
fi

echo "✓ Build completed successfully"