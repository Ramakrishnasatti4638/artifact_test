#!/bin/bash

# Demo script to test rate limiting functionality
# Requires the server to be running on localhost:3000

set -e

BASE_URL="http://localhost:3000"
COLORS=true

# Colors
if [ "$COLORS" = true ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    NC='\033[0m' # No Color
else
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    NC=''
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Rate Limiting Demo${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to make a request and show headers
make_request() {
    local url=$1
    local name=$2
    
    echo -e "${YELLOW}Request: ${name}${NC}"
    
    response=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" "$url")
    body=$(echo "$response" | sed -e :a -e '$d;N;2,3ba' -e 'P;D')
    status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
    
    # Get rate limit headers (requires -i flag)
    headers=$(curl -s -i "$url" | grep -i "x-ratelimit\|retry-after")
    
    if [ "$status" = "200" ]; then
        echo -e "${GREEN}✓ Status: $status${NC}"
    elif [ "$status" = "429" ]; then
        echo -e "${RED}✗ Status: $status (Rate Limited)${NC}"
    else
        echo -e "${YELLOW}Status: $status${NC}"
    fi
    
    if [ ! -z "$headers" ]; then
        echo -e "${BLUE}Rate Limit Headers:${NC}"
        echo "$headers" | sed 's/^/  /'
    fi
    
    echo ""
}

# Test 1: Normal requests (within limit)
echo -e "${BLUE}Test 1: Normal requests to /api/data${NC}"
echo "Making 3 requests (should all succeed)..."
for i in {1..3}; do
    make_request "$BASE_URL/api/data" "Request #$i"
    sleep 0.5
done

# Test 2: Rapid requests to trigger rate limit
echo -e "${BLUE}Test 2: Rapid requests to /api/create (max 10/min)${NC}"
echo "Making 12 requests rapidly..."
for i in {1..12}; do
    status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/create")
    if [ "$status" = "200" ]; then
        echo -e "${GREEN}Request $i: ✓ Success${NC}"
    else
        echo -e "${RED}Request $i: ✗ Rate limited (429)${NC}"
    fi
done
echo ""

# Test 3: Check rate limit status
echo -e "${BLUE}Test 3: Check current rate limit status${NC}"
make_request "$BASE_URL/api/rate-limit-status" "Rate Limit Status"

# Test 4: Public endpoint (high limit)
echo -e "${BLUE}Test 4: Public endpoint /api/public (max 1000/min)${NC}"
echo "Making 5 requests (should all succeed)..."
for i in {1..5}; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/public")
    echo -e "${GREEN}Request $i: ✓ Status $status${NC}"
done
echo ""

# Test 5: Health endpoint (no rate limit)
echo -e "${BLUE}Test 5: Health endpoint (no rate limiting)${NC}"
echo "Making 20 requests to /api/health..."
success=0
for i in {1..20}; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
    if [ "$status" = "200" ]; then
        ((success++))
    fi
done
echo -e "${GREEN}All $success/20 requests succeeded (no rate limiting)${NC}"
echo ""

# Test 6: Show headers in detail
echo -e "${BLUE}Test 6: Detailed headers from /api/data${NC}"
curl -i -s "$BASE_URL/api/data" | grep -E "^HTTP|^X-RateLimit|^Retry-After"
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Demo complete!${NC}"
echo -e "${BLUE}========================================${NC}"
