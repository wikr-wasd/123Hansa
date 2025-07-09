#!/bin/bash

# This script overrides the hardcoded Vercel command by manipulating PATH
# It makes the hardcoded "cd apps/web && npm install && npm run build" work

echo "=== BUILD OVERRIDE ACTIVATED ==="
echo "Working directory: $(pwd)"
echo "PATH: $PATH"

# Create a temporary bin directory
mkdir -p /tmp/bin

# Create a custom npm wrapper that detects the broken cd command
cat > /tmp/bin/npm << 'EOF'
#!/bin/bash
echo "=== NPM WRAPPER ACTIVATED ==="
echo "Current directory: $(pwd)"
echo "Arguments: $@"

# Check if we're in the wrong directory due to failed cd
if [ ! -f "package.json" ]; then
    echo "No package.json found, looking for web directory..."
    
    # Try to find the web directory
    if [ -d "/vercel/path0/apps/web" ]; then
        echo "Found web directory at /vercel/path0/apps/web"
        cd /vercel/path0/apps/web
    elif [ -d "/vercel/path0/apps-backup/web" ]; then
        echo "Found backup web directory at /vercel/path0/apps-backup/web"
        cd /vercel/path0/apps-backup/web
    elif [ -d "/vercel/path0/web" ]; then
        echo "Found web directory at /vercel/path0/web"
        cd /vercel/path0/web
    else
        # Find any directory with vite.config.ts
        WEB_DIR=$(find /vercel/path0 -name "vite.config.ts" -type f 2>/dev/null | head -1)
        if [ -n "$WEB_DIR" ]; then
            WEB_DIR=$(dirname "$WEB_DIR")
            echo "Found Vite project at: $WEB_DIR"
            cd "$WEB_DIR"
        else
            echo "Cannot find web directory anywhere"
            exit 1
        fi
    fi
fi

# Execute the original npm command
echo "Running npm $@ in $(pwd)"
exec /usr/bin/npm "$@"
EOF

chmod +x /tmp/bin/npm

# Create a custom cd wrapper that handles the directory issue
cat > /tmp/bin/cd << 'EOF'
#!/bin/bash
echo "=== CD WRAPPER ACTIVATED ==="
echo "Attempting to cd to: $1"

# If trying to cd to apps/web, try alternative locations
if [ "$1" = "apps/web" ]; then
    if [ -d "apps/web" ]; then
        echo "Found apps/web directory"
        exec /bin/cd "$1"
    elif [ -d "apps-backup/web" ]; then
        echo "Using apps-backup/web instead"
        exec /bin/cd "apps-backup/web"
    elif [ -d "web" ]; then
        echo "Using web directory instead"
        exec /bin/cd "web"
    else
        echo "Cannot find any web directory"
        exit 1
    fi
else
    # Normal cd behavior
    exec /bin/cd "$@"
fi
EOF

chmod +x /tmp/bin/cd

# Add our custom bin directory to PATH
export PATH="/tmp/bin:$PATH"

echo "PATH updated: $PATH"
echo "Custom commands ready"

# The hardcoded command will now use our wrappers
echo "Ready for hardcoded command execution"