#!/bin/bash

echo "=== ENSURING DIRECTORY STRUCTURE ==="
echo "Current directory: $(pwd)"

# Check if apps/web exists
if [ ! -d "apps/web" ]; then
    echo "apps/web not found, creating it..."
    
    # Try to create it from backup
    if [ -d "apps-backup/web" ]; then
        echo "Copying from apps-backup/web"
        mkdir -p apps
        cp -r apps-backup/web apps/web
        echo "✓ Created apps/web from backup"
    elif [ -d "web" ]; then
        echo "Using web directory"
        mkdir -p apps
        cp -r web apps/web
        echo "✓ Created apps/web from web directory"
    else
        echo "✗ Cannot create apps/web - no source found"
        exit 1
    fi
else
    echo "✓ apps/web already exists"
fi

# Verify the structure
if [ -f "apps/web/package.json" ] && [ -f "apps/web/vite.config.ts" ]; then
    echo "✓ apps/web structure verified"
else
    echo "✗ apps/web structure invalid"
    exit 1
fi

echo "=== STRUCTURE READY ==="