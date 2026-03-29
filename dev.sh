#!/bin/bash
# Dev environment setup script for vibe-check

# Get current user info
USER_ID=$(id -u)
USER_GID=$(id -g)

# Ensure XDG_RUNTIME_DIR exists and has correct permissions
RUNTIME_DIR="/run/user/${USER_ID}"

if [ ! -d "$RUNTIME_DIR" ]; then
    echo "Creating runtime directory: $RUNTIME_DIR"
    sudo mkdir -p "$RUNTIME_DIR"
    sudo chown "${USER_ID}:${USER_GID}" "$RUNTIME_DIR"
    sudo chmod 700 "$RUNTIME_DIR"
fi

# Set environment variables
export XDG_RUNTIME_DIR="$RUNTIME_DIR"

# Create dconf directory if it doesn't exist
if [ ! -d "$XDG_RUNTIME_DIR/dconf" ]; then
    mkdir -p "$XDG_RUNTIME_DIR/dconf"
fi

# Kill any existing processes on dev ports
echo "Cleaning up ports 1420 and 1421..."
lsof -ti:1420,1421 2>/dev/null | xargs -r kill -9 2>/dev/null

# Run dev with proper D-Bus session
echo "Starting dev server..."
echo "XDG_RUNTIME_DIR=$XDG_RUNTIME_DIR"
dbus-run-session -- bun run dev "$@"
