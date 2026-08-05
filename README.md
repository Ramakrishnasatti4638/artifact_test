# Fastify API with Redis Rate Limiting

A production-ready REST API built with Fastify featuring a robust Redis-based rate limiting system using the sliding window algorithm.

## Features

### Rate Limiting System
- **Sliding Window Algorithm** - Accurate request counting with sub-second precision
- **Redis-Backed** - Distributed rate limiting across multiple instances
- **Flexible Configuration** - Global, per-route, and per-user limits
- **Standard Headers** - X-RateLimit-* headers for client visibility
- **Graceful Degradation** - Fail-open strategy if Redis is unavailable
- **Whitelist Support** - Bypass rate limits for trusted IPs/users
- **Route-Specific Limits** - Different limits for different endpoints

### API Endpoints
- **GET /** - API information and available endpoints
- **GET /api/health** - Health check (rate limiting disabled)
- **GET /api/data** - Example endpoint with global rate limit
- **POST /api/create** - Example endpoint with strict rate limit (10/min)
- **GET /api/public** - Example endpoint with permissive rate limit (1000/min)
- **GET /api/rate-limit-status** - Check current rate limit status

### Technical Features
- **Fastify 4.x** - High-performance web framework
- **ioredis** - Production-grade Redis client with connection pooling
- **Environment-based config** - Easy deployment configuration
- **Comprehensive tests** - Jest test suite with 80%+ coverage
- **Graceful shutdown** - Proper cleanup of Redis connections

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Environment Variables

```bash
# Server
PORT=3000
HOST=0.0.0.0

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Rate Limiting
RATE_LIMIT_MAX=100              # Max requests per window
RATE_LIMIT_WINDOW_MS=60000      # Window size in milliseconds (60s)
RATE_LIMIT_ENABLED=true         # Enable/disable rate limiting
```

## Usage

### Start Redis (Docker)

```bash
docker run -d -p 6379:6379 redis:7-alpine
```

### Start the Server

```bash
npm start
```

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm test:coverage
```

## Rate Limiting Configuration

### Global Rate Limit

Default configuration applies to all routes unless overridden:

```javascript
await fastify.register(rateLimiterPlugin, {
  redis,
  max: 100,           // 100 requests
  windowMs: 60000,    // per 60 seconds
});
```

### Route-Specific Rate Limits

```javascript
fastify.post('/create', {
  config: {
    rateLimit: {
      max: 10,
      windowMs: 60000,
      routeKey: 'create',  // Optional: custom Redis key
    },
  },
}, async (request, reply) => {
  // Handler
});
```

### Disable Rate Limiting for Specific Routes

```javascript
fastify.get('/health', {
  config: {
    rateLimit: false,
  },
}, async (request, reply) => {
  // Handler
});
```

### Custom Key Generator

Rate limit by user ID instead of IP:

```javascript
await fastify.register(rateLimiterPlugin, {
  redis,
  keyGenerator: (request) => {
    return request.user?.id || request.ip;
  },
});
```

### Whitelist IPs

```javascript
await fastify.register(rateLimiterPlugin, {
  redis,
  whitelist: ['127.0.0.1', '10.0.0.0/8'],
});
```

### Custom Callback on Limit Reached

```javascript
await fastify.register(rateLimiterPlugin, {
  redis,
  onLimitReached: (request, reply) => {
    fastify.log.warn({
      ip: request.ip,
      path: request.url,
    }, 'Rate limit exceeded');
  },
});
```

## API Response Headers

All rate-limited endpoints return these headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-01-01T00:01:00.000Z
```

When rate limited (429 response):

```
Retry-After: 60
```

## Rate Limit Error Response

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 60 seconds.",
  "retryAfter": 60
}
```

## Architecture

### Sliding Window Algorithm

The rate limiter uses Redis Sorted Sets (ZSET) for accurate sliding window counting:

1. **Store requests** - Each request is added to a ZSET with timestamp as score
2. **Window cleanup** - Requests outside the time window are removed
3. **Count requests** - Current count determines if limit is exceeded
4. **Atomic operations** - Redis pipeline ensures consistency

### Redis Data Structure

```
Key: ratelimit:{routeKey}:{userKey}
Type: Sorted Set (ZSET)
Score: Timestamp in milliseconds
Member: Unique request identifier
TTL: Window duration + 1 second
```

Example:
```
ratelimit:global:127.0.0.1
  1704067200000 -> "1704067200000-0.123"
  1704067201000 -> "1704067201000-0.456"
  1704067202000 -> "1704067202000-0.789"
```

### Plugin Architecture

```
src/
├── config/
│   └── redis.js           # Redis client configuration
├── plugins/
│   ├── rate-limiter.js    # Rate limiter plugin
│   └── __tests__/
│       └── rate-limiter.test.js
├── routes/
│   └── api.js             # API routes with rate limit examples
└── server.js              # Main application
```

## Testing Examples

### Test Rate Limiting

```bash
# Make multiple requests quickly
for i in {1..105}; do
  curl http://localhost:3000/api/data
  echo ""
done
```

After 100 requests, you'll get:

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 60 seconds.",
  "retryAfter": 60
}
```

### Check Rate Limit Status

```bash
curl http://localhost:3000/api/rate-limit-status
```

Response:
```json
{
  "ip": "127.0.0.1",
  "count": 5,
  "remaining": 95,
  "limit": 100,
  "resetTime": 1704067260000
}
```

## Production Considerations

### Security
- **Behind a Proxy** - Configure `keyGenerator` to use `X-Forwarded-For`
- **Whitelist Management** - Store whitelists in environment/config
- **DDoS Protection** - Combine with upstream rate limiting (nginx, CloudFlare)

### Performance
- **Redis Connection Pooling** - ioredis handles connection pooling automatically
- **Pipeline Usage** - Atomic operations reduce Redis round trips
- **Fail Open** - Service continues even if Redis is down

### Monitoring
- Log rate limit violations
- Track Redis connection health
- Monitor rate limit metrics (requests/sec, blocks/sec)

### Scaling
- **Horizontal Scaling** - Redis-based state allows multiple API instances
- **Redis Cluster** - For high-throughput applications
- **Different Strategies** - Consider token bucket for burst handling

## Advanced Usage

### Multiple Rate Limits

Apply multiple rate limiters with different strategies:

```javascript
// Global rate limit: 1000 requests/hour
await fastify.register(rateLimiterPlugin, {
  redis: redisClient1,
  max: 1000,
  windowMs: 3600000,
});

// Strict rate limit for specific routes
fastify.post('/expensive', {
  config: {
    rateLimit: { max: 5, windowMs: 60000 }
  }
}, handler);
```

### User-Specific Limits

```javascript
await fastify.register(rateLimiterPlugin, {
  redis,
  keyGenerator: (request) => {
    const userId = request.user?.id;
    const tier = request.user?.tier || 'free';
    
    // Different limits for different user tiers
    return userId ? `user:${userId}:${tier}` : request.ip;
  },
  max: (request) => {
    const tier = request.user?.tier || 'free';
    return tier === 'premium' ? 1000 : 100;
  },
});
```

### Dynamic Configuration

```javascript
// Load limits from database
const limits = await loadLimitsFromDB();

await fastify.register(rateLimiterPlugin, {
  redis,
  max: limits.default.max,
  windowMs: limits.default.windowMs,
});
```

## Troubleshooting

### Redis Connection Issues

```bash
# Check Redis is running
redis-cli ping

# Check Redis connection from app
docker logs <container-name>
```

### Rate Limiter Not Working

1. Check `RATE_LIMIT_ENABLED=true` in `.env`
2. Verify Redis connection in logs
3. Ensure route doesn't have `rateLimit: false` config

### Tests Failing

```bash
# Clear Redis test data
redis-cli FLUSHDB

# Run tests with verbose output
npm test -- --verbose
```

## License

MIT
