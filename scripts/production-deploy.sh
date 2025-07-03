#!/bin/bash

# 123hansa.se Production Deployment Script
# This script handles the complete deployment process for production

set -e

echo "🚀 Starting 123hansa.se production deployment..."

# Configuration
PROJECT_NAME="123hansa"
BACKUP_DIR="/var/backups/$PROJECT_NAME"
LOG_FILE="/var/log/$PROJECT_NAME-deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root for security reasons"
fi

# Check required environment variables
check_env_vars() {
    log "Checking environment variables..."
    
    required_vars=(
        "DATABASE_URL"
        "JWT_SECRET"
        "EMAIL_API_KEY"
        "STRIPE_SECRET_KEY"
        "AWS_ACCESS_KEY_ID"
        "AWS_SECRET_ACCESS_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            error "Required environment variable $var is not set"
        fi
    done
    
    log "✅ All required environment variables are set"
}

# Create backup of current deployment
create_backup() {
    log "Creating backup of current deployment..."
    
    mkdir -p "$BACKUP_DIR"
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    
    if [ -d "/var/www/$PROJECT_NAME" ]; then
        cp -r "/var/www/$PROJECT_NAME" "$BACKUP_DIR/$BACKUP_NAME"
        log "✅ Backup created: $BACKUP_DIR/$BACKUP_NAME"
    else
        warning "No existing deployment found to backup"
    fi
}

# Database backup
backup_database() {
    log "Creating database backup..."
    
    # Extract database details from DATABASE_URL
    DB_BACKUP_FILE="$BACKUP_DIR/db-backup-$(date +%Y%m%d-%H%M%S).sql"
    
    if command -v pg_dump &> /dev/null; then
        pg_dump "$DATABASE_URL" > "$DB_BACKUP_FILE"
        gzip "$DB_BACKUP_FILE"
        log "✅ Database backup created: ${DB_BACKUP_FILE}.gz"
    else
        warning "pg_dump not found, skipping database backup"
    fi
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    if [ "$(printf '%s\n' "18.0.0" "$NODE_VERSION" | sort -V | head -n1)" != "18.0.0" ]; then
        error "Node.js version 18 or higher is required"
    fi
    
    npm ci --only=production
    log "✅ Dependencies installed"
}

# Build application
build_application() {
    log "Building application..."
    
    NODE_ENV=production npm run build
    
    if [ $? -eq 0 ]; then
        log "✅ Application built successfully"
    else
        error "Build failed"
    fi
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    cd apps/api
    npx prisma migrate deploy
    npx prisma generate
    cd ../..
    
    log "✅ Database migrations completed"
}

# Setup SSL certificates (if not using Cloudflare)
setup_ssl() {
    log "Setting up SSL certificates..."
    
    if [ ! -f "/etc/nginx/ssl/123hansa.se.crt" ]; then
        warning "SSL certificates not found. Please ensure certificates are properly configured."
    else
        log "✅ SSL certificates found"
    fi
}

# Update Nginx configuration
update_nginx() {
    log "Updating Nginx configuration..."
    
    sudo cp nginx.production.conf /etc/nginx/sites-available/123hansa.se
    sudo ln -sf /etc/nginx/sites-available/123hansa.se /etc/nginx/sites-enabled/
    
    # Test Nginx configuration
    sudo nginx -t
    if [ $? -eq 0 ]; then
        sudo systemctl reload nginx
        log "✅ Nginx configuration updated and reloaded"
    else
        error "Nginx configuration test failed"
    fi
}

# Start application with PM2
start_application() {
    log "Starting application with PM2..."
    
    # Stop existing application
    pm2 stop 123hansa-api 2>/dev/null || true
    pm2 delete 123hansa-api 2>/dev/null || true
    
    # Start new application
    cd apps/api
    pm2 start dist/index.js --name 123hansa-api --instances max --exec-mode cluster
    pm2 save
    cd ../..
    
    log "✅ Application started with PM2"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Wait for application to start
    sleep 10
    
    # Check API health
    for i in {1..5}; do
        if curl -f http://localhost:3001/health > /dev/null 2>&1; then
            log "✅ Health check passed"
            return 0
        fi
        log "Health check attempt $i failed, retrying..."
        sleep 5
    done
    
    error "Health check failed after 5 attempts"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Start monitoring services if docker-compose is available
    if command -v docker-compose &> /dev/null; then
        docker-compose -f docker-compose.production.yml up -d prometheus grafana
        log "✅ Monitoring services started"
    else
        warning "Docker Compose not found, skipping monitoring setup"
    fi
}

# Cleanup old deployments
cleanup() {
    log "Cleaning up old deployments..."
    
    # Keep only last 5 backups
    if [ -d "$BACKUP_DIR" ]; then
        ls -1t "$BACKUP_DIR" | tail -n +6 | xargs -d '\n' -r rm -rf --
        log "✅ Old backups cleaned up"
    fi
    
    # Clean up old PM2 logs
    pm2 flush
    
    log "✅ Cleanup completed"
}

# Main deployment function
main() {
    log "🚀 Starting 123hansa.se deployment process..."
    
    check_env_vars
    create_backup
    backup_database
    install_dependencies
    build_application
    run_migrations
    setup_ssl
    update_nginx
    start_application
    health_check
    setup_monitoring
    cleanup
    
    log "🎉 Deployment completed successfully!"
    log "🌐 Application is now running at https://123hansa.se"
    log "📊 Monitor at: http://localhost:3000 (Grafana)"
    log "📈 Metrics at: http://localhost:9090 (Prometheus)"
}

# Rollback function
rollback() {
    log "🔄 Starting rollback process..."
    
    # Find latest backup
    LATEST_BACKUP=$(ls -1t "$BACKUP_DIR" | grep "backup-" | head -n1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        error "No backup found for rollback"
    fi
    
    log "Rolling back to: $LATEST_BACKUP"
    
    # Stop current application
    pm2 stop 123hansa-api
    
    # Restore backup
    rm -rf "/var/www/$PROJECT_NAME"
    cp -r "$BACKUP_DIR/$LATEST_BACKUP" "/var/www/$PROJECT_NAME"
    
    # Restart application
    pm2 start 123hansa-api
    
    log "✅ Rollback completed"
}

# Handle command line arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        rollback
        ;;
    "health")
        health_check
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|health}"
        echo "  deploy  - Full deployment (default)"
        echo "  rollback - Rollback to previous version"
        echo "  health  - Check application health"
        exit 1
        ;;
esac