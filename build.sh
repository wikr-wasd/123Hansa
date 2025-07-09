#!/bin/sh
set -e

# Create package structure
mkdir -p packages/shared/src packages/ui/src

# Create minimal package files
echo 'export {};' > packages/shared/src/index.ts
echo 'export {};' > packages/ui/src/index.ts
echo '{"name":"@gohansa/shared","version":"1.0.0","main":"src/index.ts"}' > packages/shared/package.json
echo '{"name":"@gohansa/ui","version":"1.0.0","main":"src/index.ts"}' > packages/ui/package.json

# Build web app
cd apps/web
npm install --include=dev
npm run build

# Verify output
ls -la dist/
echo "Build completed successfully"