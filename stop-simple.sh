#!/bin/bash

echo "🛑 Stoppar enkel testmiljö..."

# Stoppa server
if [ -f .server_pid ]; then
    SERVER_PID=$(cat .server_pid)
    if ps -p $SERVER_PID > /dev/null; then
        echo "📦 Stoppar demo server..."
        kill $SERVER_PID
    fi
    rm .server_pid
fi

# Stoppa Localtunnel
if [ -f .tunnel_pid ]; then
    TUNNEL_PID=$(cat .tunnel_pid)
    if ps -p $TUNNEL_PID > /dev/null; then
        echo "🌐 Stoppar Localtunnel..."
        kill $TUNNEL_PID
    fi
    rm .tunnel_pid
fi

# Rensa eventuella kvarvarande processer
pkill -f "node.*demo-server\|node.*simple-server\|localtunnel\|lt --port" 2>/dev/null || true

echo "✅ Enkel testmiljö stoppad!"