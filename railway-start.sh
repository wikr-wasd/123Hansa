#!/bin/bash

echo "🚀 Deploying 123hansa test server to Railway..."

# Install Railway CLI if not exists
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login and deploy
echo "🔐 Railway login required..."
echo "Visit: https://railway.app/login"
echo "Then run: railway login"
echo ""
echo "After login, run:"
echo "railway init"
echo "railway up"
echo ""
echo "This will give you a permanent public URL like:"
echo "https://123hansa-test-production.up.railway.app"