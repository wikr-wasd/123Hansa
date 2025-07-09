#!/bin/bash

echo "=== POSTINSTALL STRUCTURE FIX ==="
echo "Working directory: $(pwd)"

# Create apps directory
mkdir -p apps

# Ensure apps/web exists from backup
if [ ! -d "apps/web" ] && [ -d "apps-backup/web" ]; then
    echo "Creating apps/web from apps-backup/web"
    cp -r apps-backup/web apps/web
fi

# Create symlink as backup
if [ ! -L "web" ] && [ -d "apps/web" ]; then
    echo "Creating web symlink"
    ln -sf apps/web web
fi

# Verify final structure
if [ -d "apps/web" ] && [ -f "apps/web/package.json" ]; then
    echo "✓ Structure verified"
else
    echo "✗ Structure verification failed"
fi

echo "=== POSTINSTALL COMPLETE ==="