#!/bin/bash

echo "=== COMPLETE DIRECTORY DEBUG ==="
echo "Current directory: $(pwd)"
echo "Current user: $(whoami)"
echo "Current time: $(date)"

echo "=== LISTING ROOT DIRECTORY ==="
ls -la

echo "=== CHECKING FOR APPS DIRECTORY ==="
if [ -d "apps" ]; then
    echo "✓ apps directory exists"
    ls -la apps/
    
    echo "=== CHECKING APPS/WEB SPECIFICALLY ==="
    if [ -d "apps/web" ]; then
        echo "✓ apps/web directory exists"
        ls -la apps/web/
        
        echo "=== CHECKING APPS/WEB PERMISSIONS ==="
        ls -ld apps/web/
        
        echo "=== CHECKING APPS/WEB CONTENTS ==="
        if [ -f "apps/web/package.json" ]; then
            echo "✓ apps/web/package.json exists"
            head -5 apps/web/package.json
        else
            echo "✗ apps/web/package.json missing"
        fi
        
        if [ -f "apps/web/vite.config.ts" ]; then
            echo "✓ apps/web/vite.config.ts exists"
        else
            echo "✗ apps/web/vite.config.ts missing"
        fi
    else
        echo "✗ apps/web directory not found"
    fi
else
    echo "✗ apps directory not found"
fi

echo "=== CHECKING ALTERNATIVE DIRECTORIES ==="
if [ -d "apps-backup" ]; then
    echo "✓ apps-backup directory exists"
    ls -la apps-backup/
fi

if [ -d "web" ]; then
    echo "✓ web directory exists"
    ls -la web/
fi

echo "=== FIND ALL WEB DIRECTORIES ==="
find . -name "web" -type d 2>/dev/null

echo "=== FIND ALL PACKAGE.JSON FILES ==="
find . -name "package.json" 2>/dev/null

echo "=== FIND ALL VITE.CONFIG.TS FILES ==="
find . -name "vite.config.ts" 2>/dev/null

echo "=== TESTING CD COMMAND ==="
echo "About to test: cd apps/web"
if cd apps/web 2>/dev/null; then
    echo "✓ cd apps/web successful"
    echo "Current directory after cd: $(pwd)"
    ls -la
    cd ..
else
    echo "✗ cd apps/web failed"
fi

echo "=== DEBUG COMPLETE ==="