#!/bin/bash
# Script to set up git hooks for Azure Task ID validation

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

HOOKS_DIR=".githooks"
GIT_HOOKS_DIR=".git/hooks"

if [ ! -d "$HOOKS_DIR" ]; then
    echo -e "${YELLOW}No .githooks directory found${NC}"
    exit 1
fi

# Configure git to use the custom hooks directory
echo "Configuring git to use custom hooks directory..."
git config core.hooksPath "$HOOKS_DIR"

# Make hooks executable
echo "Making hooks executable..."
chmod +x "$HOOKS_DIR"/*

echo -e "${GREEN}✓ Git hooks configured successfully!${NC}"
echo ""
echo "Installed hooks:"
ls -1 "$HOOKS_DIR" | while read hook; do
    echo "  - $hook"
done
echo ""
echo "Git hooks will now validate your commits and remind you to include Azure Task IDs."
