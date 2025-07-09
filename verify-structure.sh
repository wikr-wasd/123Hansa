#!/bin/bash
set -e

echo "=== VERIFYING DIRECTORY STRUCTURE ==="
echo "Current directory: $(pwd)"
echo "User: $(whoami)"

echo "=== ROOT DIRECTORY CONTENTS ==="
ls -la

echo "=== CHECKING APPS DIRECTORY ==="
if [ -d "apps" ]; then
    echo "✓ apps directory exists"
    ls -la apps/
    
    echo "=== CHECKING APPS/WEB DIRECTORY ==="
    if [ -d "apps/web" ]; then
        echo "✓ apps/web directory exists"
        ls -la apps/web/
        
        echo "=== CHECKING APPS/WEB PACKAGE.JSON ==="
        if [ -f "apps/web/package.json" ]; then
            echo "✓ apps/web/package.json exists"
            head -10 apps/web/package.json
            
            echo "=== CHECKING APPS/WEB BUILD DEPENDENCIES ==="
            if [ -f "apps/web/vite.config.ts" ]; then
                echo "✓ apps/web/vite.config.ts exists"
                echo "✓ Structure is correct for build"
            else
                echo "✗ apps/web/vite.config.ts missing"
            fi
        else
            echo "✗ apps/web/package.json missing"
        fi
    else
        echo "✗ apps/web directory missing"
    fi
else
    echo "✗ apps directory missing"
fi

echo "=== VERCELIGNORE CHECK ==="
if [ -f ".vercelignore" ]; then
    echo "Checking .vercelignore for apps/web exclusions..."
    grep -n "apps/web" .vercelignore || echo "No apps/web patterns found"
else
    echo "No .vercelignore file"
fi

echo "=== VERIFICATION COMPLETE ==="