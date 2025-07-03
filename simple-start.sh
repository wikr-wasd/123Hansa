#!/bin/bash

echo "🚀 Startar enkel testserver (utan Docker)..."

# Döda eventuella befintliga processer
pkill -f "node.*demo-server\|node.*simple-server" 2>/dev/null || true
sleep 2

# Starta demo servern
echo "📦 Startar demo server på port 3002..."
cd /home/willi/tubba-project
PORT=3002 node demo-server.js &
SERVER_PID=$!
echo $SERVER_PID > .server_pid

# Vänta lite för att servern ska starta
sleep 3

# Starta Localtunnel
echo "🌐 Startar Localtunnel..."
lt --port 3002 --subdomain 123hansa-simple &
TUNNEL_PID=$!
echo $TUNNEL_PID > .tunnel_pid

echo "✅ Enkel testmiljö startad!"
echo "📍 Lokala URLer:"
echo "   API: http://localhost:3002"
echo ""
echo "🌐 Publik URL via Localtunnel:"
echo "   https://123hansa-simple.loca.lt"
echo ""
echo "🛑 För att stoppa: Ctrl+C eller köra ./stop-simple.sh"

# Håll skriptet igång
wait