#!/bin/bash
set -e

echo "Building 123hansa web application..."

# Navigate to web app directory
cd apps/web

echo "Installing dependencies..."
npm install

echo "Building application..."
npm run build

echo "Build completed successfully!"