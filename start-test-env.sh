#!/bin/bash

echo "🚀 Startar 123hansa testmiljö..."

# Kontrollera om Docker är tillgängligt
if ! command -v docker &> /dev/null; then
    echo "❌ Docker inte tillgängligt. Kontrollera Docker Desktop WSL2-integration."
    exit 1
fi

# Starta Docker Compose
echo "📦 Startar Docker containers..."
docker-compose up -d

# Vänta på att services ska starta
echo "⏳ Väntar på att services ska starta..."
sleep 10

# Kontrollera hälsostatus
echo "🔍 Kontrollerar services..."
docker-compose ps

# Starta Localtunnel som backup
echo "🌐 Startar Localtunnel som backup..."
lt --port 3002 --subdomain 123hansa-test &
TUNNEL_PID=$!
echo $TUNNEL_PID > .tunnel_pid

echo "✅ Testmiljö startad!"
echo "📍 Lokala URLer:"
echo "   API: http://localhost:3002"
echo "   Web: http://localhost:3000"
echo "   Databas: localhost:5432"
echo "   Redis: localhost:6379"
echo "   Email (MailHog): http://localhost:8025"
echo ""
echo "🌐 Publik URL via Localtunnel:"
echo "   https://123hansa-test.loca.lt"
echo ""
echo "🛑 För att stoppa: köra ./stop-test-env.sh"