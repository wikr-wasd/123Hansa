#!/bin/bash
set -e

echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

echo "Apps directory contents:"
ls -la apps/ || echo "apps/ directory not found"

echo "Checking if apps/web exists:"
if [ -d "apps/web" ]; then
    echo "apps/web directory exists"
    ls -la apps/web/
    cd apps/web
    echo "Installing web app dependencies..."
    npm install
    echo "Building web app..."
    npm run build
else
    echo "ERROR: apps/web directory not found!"
    exit 1
fi