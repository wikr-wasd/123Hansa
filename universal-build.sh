#!/bin/bash
set -e

echo "=== UNIVERSAL BUILD SOLUTION ==="
echo "Current directory: $(pwd)"
echo "Available files and directories:"
ls -la

# Function to build in a given directory
build_in_dir() {
    local dir="$1"
    echo "Building in directory: $dir"
    cd "$dir"
    
    if [ -f "package.json" ] && [ -f "vite.config.ts" ]; then
        echo "✓ Found package.json and vite.config.ts"
        echo "Installing dependencies..."
        npm install
        echo "Building application..."
        npm run build
        echo "✓ Build completed successfully in $dir"
        return 0
    else
        echo "✗ Missing package.json or vite.config.ts in $dir"
        return 1
    fi
}

# Try multiple possible locations for the web directory
echo "=== ATTEMPTING BUILD IN MULTIPLE LOCATIONS ==="

# 1. Try apps/web (standard location)
if [ -d "apps/web" ]; then
    echo "Found apps/web directory"
    if build_in_dir "apps/web"; then
        exit 0
    fi
fi

# 2. Try apps-backup/web (our backup location)  
if [ -d "apps-backup/web" ]; then
    echo "Found apps-backup/web directory"
    if build_in_dir "apps-backup/web"; then
        exit 0
    fi
fi

# 3. Try web (symbolic link)
if [ -d "web" ]; then
    echo "Found web directory (symbolic link)"
    if build_in_dir "web"; then
        exit 0
    fi
fi

# 4. Try to find any directory with vite.config.ts
echo "Searching for any directory with vite.config.ts..."
VITE_DIR=$(find . -name "vite.config.ts" -type f 2>/dev/null | head -1)
if [ -n "$VITE_DIR" ]; then
    VITE_DIR=$(dirname "$VITE_DIR")
    echo "Found Vite project at: $VITE_DIR"
    if build_in_dir "$VITE_DIR"; then
        exit 0
    fi
fi

echo "✗ Could not find any suitable directory to build"
echo "Available directory structure:"
find . -type d -maxdepth 3 2>/dev/null | sort
echo "Files with vite.config.ts:"
find . -name "vite.config.ts" -type f 2>/dev/null
echo "Files with package.json:"
find . -name "package.json" -type f 2>/dev/null
exit 1