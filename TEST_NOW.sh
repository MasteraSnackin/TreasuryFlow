#!/bin/bash

# TreasuryFlow - Quick Test Script
# This script helps you test the application immediately

set -e

echo "🚀 TreasuryFlow - Quick Test Script"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
  echo -e "${RED}❌ Error: frontend directory not found${NC}"
  echo "Please run this script from the project root directory"
  exit 1
fi

echo -e "${BLUE}📋 Step 1: Checking Dependencies${NC}"
echo "--------------------------------"

# Check Node.js
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
else
  echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
  exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm -v)
  echo -e "${GREEN}✅ npm installed: $NPM_VERSION${NC}"
else
  echo -e "${RED}❌ npm not found${NC}"
  exit 1
fi

echo ""
echo -e "${BLUE}📦 Step 2: Installing Dependencies${NC}"
echo "--------------------------------"

cd frontend

if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing frontend dependencies...${NC}"
  npm install
  echo -e "${GREEN}✅ Dependencies installed${NC}"
else
  echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

echo ""
echo -e "${BLUE}⚙️  Step 3: Checking Environment${NC}"
echo "--------------------------------"

# Check for .env file
if [ -f "../.env" ]; then
  echo -e "${GREEN}✅ .env file found${NC}"
  
  # Check for demo mode
  if grep -q "NEXT_PUBLIC_DEMO_MODE=true" ../.env; then
    echo -e "${GREEN}✅ Demo mode enabled${NC}"
  else
    echo -e "${YELLOW}⚠️  Demo mode not enabled${NC}"
    echo -e "${YELLOW}   Add NEXT_PUBLIC_DEMO_MODE=true to .env for testing${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  .env file not found${NC}"
  echo -e "${YELLOW}   Creating .env with demo mode...${NC}"
  
  cat > ../.env << 'EOF'
# Demo Mode (Enable for testing without blockchain)
NEXT_PUBLIC_DEMO_MODE=true

# Arc Network (Update when ready to deploy)
ARC_TESTNET_RPC_URL=https://rpc-testnet.arc.network
ARC_TESTNET_CHAIN_ID=42161

# Smart Contracts (Update after deployment)
NEXT_PUBLIC_TREASURY_VAULT_ADDRESS=
NEXT_PUBLIC_AUTO_SWAP_ADDRESS=
NEXT_PUBLIC_USDC_ADDRESS=0xaf88d065e77c8cC2239327C5EDb3A432268e5831
NEXT_PUBLIC_EURC_ADDRESS=0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c

# Circle (Optional - for CCTP features)
NEXT_PUBLIC_CIRCLE_APP_ID=
CIRCLE_API_KEY=

# AI Features (Optional - for invoice extraction)
ANTHROPIC_API_KEY=
EOF
  
  echo -e "${GREEN}✅ Created .env with demo mode enabled${NC}"
fi

echo ""
echo -e "${BLUE}🔨 Step 4: Building Application${NC}"
echo "--------------------------------"

echo -e "${YELLOW}Building Next.js application...${NC}"
npm run build

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Build successful${NC}"
else
  echo -e "${RED}❌ Build failed${NC}"
  echo -e "${YELLOW}Check the errors above and fix them${NC}"
  exit 1
fi

echo ""
echo -e "${BLUE}🚀 Step 5: Starting Development Server${NC}"
echo "--------------------------------"

echo ""
echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
echo -e "${YELLOW}Starting development server...${NC}"
echo ""
echo -e "${BLUE}📱 Your application will be available at:${NC}"
echo -e "${GREEN}   http://localhost:3000${NC}"
echo ""
echo -e "${BLUE}📋 Test these pages:${NC}"
echo "   • http://localhost:3000 - Homepage"
echo "   • http://localhost:3000/dashboard - Dashboard"
echo "   • http://localhost:3000/payments/schedule - Schedule Payment"
echo "   • http://localhost:3000/payments/batch - Execute Batch"
echo "   • http://localhost:3000/bridge - CCTP Bridge"
echo "   • http://localhost:3000/analytics - Analytics"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "   • Demo mode is enabled - no wallet needed"
echo "   • Press Ctrl+C to stop the server"
echo "   • Check browser console for any errors"
echo ""
echo -e "${GREEN}Starting server in 3 seconds...${NC}"
sleep 3

npm run dev