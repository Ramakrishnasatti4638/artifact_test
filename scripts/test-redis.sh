#!/bin/bash

# Script to test if Redis is available and run integration tests

echo "Checking Redis connectivity..."

if redis-cli ping > /dev/null 2>&1; then
    echo "✓ Redis is available"
    echo "Running integration tests..."
    REDIS_AVAILABLE=true npm test -- --testPathPattern=integration
else
    echo "✗ Redis is not available"
    echo "Skipping integration tests"
    echo ""
    echo "To run integration tests, start Redis:"
    echo "  docker-compose up redis"
    echo "  or"
    echo "  redis-server"
    exit 1
fi
