# Rate Limiting Architecture

## Overview

This implementation uses a **sliding window** algorithm with Redis to provide distributed rate limiting for a Fastify REST API.

## Algorithm: Sliding Window Log

### How It Works

1. **Store Request Timestamps**: Each request is recorded as a timestamp in a Redis Sorted Set
2. **Cleanup Old Entries**: Remove timestamps older than the time window
3. **Count Requests**: Count remaining timestamps in the window
4. **Allow or Deny**: Compare count against the limit

### Why Sliding Window?

- **Accuracy**: More precise than fixed windows (no burst at window boundaries)
- **Fairness**: Requests are counted based on exact time, not arbitrary window resets
- **Memory Efficient**: Old entries are automatically cleaned up

### Redis Data Structure

```
Key: "ratelimit:{identifier}:{routeKey}"
Type: Sorted Set (ZSET)
Members: Unique request IDs
Scores: Unix timestamps (ms)
TTL: Window duration
```

### Example Flow

```
Window: 60 seconds, Limit: 100 requests

Request at t=0:
  ZREMRANGEBYSCORE key 0 (now - 60000)  # Remove old entries
  ZCARD key                              # Count = 45
  ZADD key now uuid                      # Add new request
  → Allow (45 < 100)

Request at t=100:
  ZREMRANGEBYSCORE key 0 (now - 60000)
  ZCARD key                              # Count = 100
  → Deny (100 >= 100)
```

## Architecture Components

### 1. Rate Limiter Plugin (`src/plugins/rate-limiter.js`)

**Responsibilities:**
- Register as a Fastify plugin
- Configure global and route-specific limits
- Execute rate limiting logic on each request
- Set response headers
- Handle Redis failures gracefully (fail-open strategy)

**Key Features:**
- Per-route configuration override
- Custom key generators
- Whitelist support
- Callbacks on limit reached
- Global enable/disable switch

### 2. Redis Client (`src/config/redis.js`)

**Responsibilities:**
- Create and configure Redis connection
- Handle reconnection logic
- Provide logging for connection events

**Configuration:**
- Host, port, password from environment
- Retry strategy with exponential backoff (max 2s)
- Connection pooling via ioredis

### 3. API Routes (`src/routes/api.js`)

**Responsibilities:**
- Define route-specific rate limits
- Demonstrate various rate limiting configurations

**Examples:**
- `/api/data` - Global limit
- `/api/create` - Strict limit (10/min)
- `/api/public` - Permissive limit (1000/min)
- `/api/health` - No limit
- `/api/rate-limit-status` - Get current status

## Configuration Options

### Global Configuration

```javascript
fastify.register(rateLimiterPlugin, {
  redis: redisClient,           // Required: Redis client instance
  max: 100,                      // Max requests per window
  windowMs: 60000,               // Time window in milliseconds
  enabled: true,                 // Enable/disable globally
  keyGenerator: (req) => req.ip, // Custom key function
  whitelist: ['127.0.0.1'],      // IPs to skip
  skipFailedRequests: false,     // Don't count failed requests
  skipSuccessfulRequests: false, // Don't count successful requests
  onLimitReached: (req) => {},   // Callback when limit hit
})
```

### Route-Level Configuration

```javascript
fastify.get('/endpoint', {
  config: {
    rateLimit: {
      max: 10,
      windowMs: 60000,
      routeKey: 'endpoint', // Optional: custom key suffix
    }
  }
}, handler)

// Disable for specific route
fastify.get('/no-limit', {
  config: {
    rateLimit: false
  }
}, handler)
```

## Response Headers

Standard rate limit headers are set on every response:

```
X-RateLimit-Limit: 100           # Max requests allowed
X-RateLimit-Remaining: 45        # Requests remaining
X-RateLimit-Reset: 1704067200    # Unix timestamp when window resets
```

On rate limit exceeded (429):

```
Retry-After: 45                  # Seconds until reset
```

## Error Handling

### Fail-Open Strategy

If Redis is unavailable:
- Requests are **allowed** (fail-open, not fail-closed)
- Error is logged
- No rate limiting applied
- System remains available

### Rationale

- **Availability over strict enforcement**: Better to allow requests than to have downtime
- **Graceful degradation**: API remains functional during Redis outages
- **Monitoring**: Errors are logged for alerting

## Security Considerations

### Rate Limit Bypass

- **Whitelist**: Trusted IPs can bypass limits
- **Use case**: Internal services, health checks, monitoring

### Distributed Denial of Service (DDoS)

- **Not a complete solution**: Rate limiting helps but isn't sufficient alone
- **Complement with**: WAF, CDN, infrastructure-level protection
- **Configuration**: Adjust limits based on traffic patterns

### Key Generation

Default: `request.ip`

**Limitations:**
- NAT/Proxy: Multiple users may share an IP
- IPv6: Address rotation can bypass limits

**Alternatives:**
- User ID (authenticated endpoints)
- API key
- Combination: IP + User-Agent + Custom header

### Redis Security

- **Authentication**: Set REDIS_PASSWORD in production
- **Network**: Use private networks, don't expose Redis publicly
- **TLS**: Use Redis with TLS for encryption in transit

## Performance Characteristics

### Time Complexity

- **Per Request**: O(log N) where N = requests in window
  - ZREMRANGEBYSCORE: O(log N + M) where M = removed entries
  - ZCARD: O(1)
  - ZADD: O(log N)

### Space Complexity

- **Per Key**: O(M) where M = max requests in window
- **Memory**: ~100 bytes per request entry
- **Example**: 100 req/min = ~10KB per key

### Redis Pipeline

All operations are pipelined in a single round-trip:
- Reduces network latency
- Improves throughput
- Maintains atomicity

## Monitoring & Observability

### Metrics to Track

1. **Rate limit hits**: Count of 429 responses
2. **Requests per key**: Distribution of usage
3. **Redis latency**: P50, P95, P99
4. **Redis failures**: Connection errors, timeouts
5. **Bypass count**: Whitelist/disabled route hits

### Logging

- Rate limit exceeded: `{ key, count, limit, route }`
- Redis errors: `{ error, operation }`
- Connection events: `{ event: 'connect/ready/error' }`

## Scaling Considerations

### Horizontal Scaling

- **Stateless**: API servers share Redis state
- **Consistent**: All servers enforce the same limits
- **No coordination**: No inter-server communication needed

### Redis Scaling

- **Single Instance**: Sufficient for most use cases
- **Sentinel**: High availability with automatic failover
- **Cluster**: Horizontal scaling for very high throughput
- **Sharding**: Partition keys across multiple Redis instances

### Performance Optimization

1. **Connection Pooling**: Reuse Redis connections
2. **Pipeline Operations**: Batch commands
3. **Lua Scripts**: Atomic multi-command operations (future enhancement)
4. **TTL Management**: Automatic cleanup of old data

## Testing Strategy

### Unit Tests

- **Mock Redis**: Test logic without actual Redis
- **Edge Cases**: Limit boundaries, window transitions
- **Error Handling**: Redis failures, malformed data
- **Configuration**: All options and overrides

### Integration Tests

- **Real Redis**: Test with actual Redis instance
- **Concurrent Requests**: Verify limit enforcement under load
- **Time-based**: Test window sliding and reset

### Load Testing

```bash
# Example with autocannon
npx autocannon -c 100 -d 30 http://localhost:3000/api/data
```

Expected: 429 responses after hitting limit

## Future Enhancements

1. **Lua Scripts**: Atomic operations for better performance
2. **Token Bucket**: Alternative algorithm option
3. **Distributed Locks**: Ensure strict limits across instances
4. **Cost-based Limiting**: Different costs for different endpoints
5. **Dynamic Limits**: Adjust based on user tier/subscription
6. **Metrics Export**: Prometheus/StatsD integration
7. **Admin API**: View/modify limits at runtime
8. **Burst Allowance**: Allow temporary spikes

## References

- [Redis Sorted Sets](https://redis.io/docs/data-types/sorted-sets/)
- [Rate Limiting Algorithms](https://en.wikipedia.org/wiki/Rate_limiting)
- [Fastify Lifecycle](https://www.fastify.io/docs/latest/Reference/Lifecycle/)
