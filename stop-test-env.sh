#!/bin/bash

echo "🛑 Stoppar 123hansa testmiljö..."

# Stoppa Localtunnel
if [ -f .tunnel_pid ]; then
    TUNNEL_PID=$(cat .tunnel_pid)
    if ps -p $TUNNEL_PID > /dev/null; then
        echo "🌐 Stoppar Localtunnel..."
        kill $TUNNEL_PID
    fi
    rm .tunnel_pid
fi

# Stoppa Docker Compose
echo "📦 Stoppar Docker containers..."
docker-compose down

# Rensa eventuella kvarvarande processer
pkill -f "localtunnel\|lt --port" 2>/dev/null || true

echo "✅ Testmiljö stoppad!"