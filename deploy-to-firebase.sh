#!/bin/bash

# Melody Firebase Deployment Script
# This script automates the build and deployment process to Firebase Hosting

set -e

echo "🎵 Melody Firebase Deployment Script"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm is not installed${NC}"
    echo "Install pnpm with: npm install -g pnpm"
    exit 1
fi

# Check if firebase-tools is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI is not installed${NC}"
    echo "Install Firebase CLI with: npm install -g firebase-tools"
    exit 1
fi

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
cd "$SCRIPT_DIR"
pnpm install --ignore-scripts
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo -e "${YELLOW}Step 2: Building for Firebase...${NC}"
cd "$SCRIPT_DIR/artifacts/showcase"
npx vite build --config vite.config.firebase.ts
echo -e "${GREEN}✓ Build completed${NC}"
echo ""

echo -e "${YELLOW}Step 3: Verifying build output...${NC}"
if [ -f "$SCRIPT_DIR/artifacts/showcase/dist/index.html" ]; then
    echo -e "${GREEN}✓ Build output verified${NC}"
else
    echo -e "${RED}❌ Build output not found${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Step 4: Deploying to Firebase...${NC}"
cd "$SCRIPT_DIR"

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}You need to authenticate with Firebase${NC}"
    firebase login
fi

firebase deploy
echo -e "${GREEN}✓ Deployment completed${NC}"
echo ""

echo -e "${GREEN}🎉 Deployment successful!${NC}"
echo ""
echo "Your site is now live at:"
firebase hosting:channel:list 2>/dev/null | grep "Default URL" || echo "Check Firebase Console for your hosting URL"
