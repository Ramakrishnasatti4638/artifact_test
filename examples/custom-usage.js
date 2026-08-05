/**
 * Examples of custom rate limiting configurations
 */

import Fastify from 'fastify';
import { createRedisClient } from '../src/config/redis.js';
import rateLimiterPlugin from '../src/plugins/rate-limiter.js';

const fastify = Fastify({ logger: true });
const redis = createRedisClient();

// Example 1: Basic setup with global limits
await fastify.register(rateLimiterPlugin, {
  redis,
  max: 100,
  windowMs: 60000, // 100 requests per minute
});

// Example 2: Route with custom stricter limit
fastify.post('/api/auth/login', {
  config: {
    rateLimit: {
      max: 5,
      windowMs: 900000, // 5 requests per 15 minutes
      routeKey: 'login',
    },
  },
}, async (request, reply) => {
  // Login logic here
  return { success: true };
});

// Example 3: Route with custom key based on user ID (authenticated endpoints)
await fastify.register(async (instance) => {
  await instance.register(rateLimiterPlugin, {
    redis,
    max: 1000,
    windowMs: 3600000, // 1000 requests per hour
    keyGenerator: (request) => {
      // Use authenticated user ID instead of IP
      return request.user?.id || request.ip;
    },
  });

  instance.get('/api/user/profile', async (request) => {
    return { user: request.user };
  });
});

// Example 4: Whitelist certain IPs (internal services)
await fastify.register(rateLimiterPlugin, {
  redis,
  max: 100,
  windowMs: 60000,
  whitelist: [
    '127.0.0.1',           // Localhost
    '10.0.0.0/8',          // Internal network (note: requires custom logic)
    '::1',                 // IPv6 localhost
  ],
});

// Example 5: Different limits based on API tier
await fastify.register(async (instance) => {
  // Free tier: 100 req/hour
  instance.register(rateLimiterPlugin, {
    redis,
    max: 100,
    windowMs: 3600000,
    keyGenerator: (req) => {
      const tier = req.user?.tier || 'free';
      return `${req.user?.id || req.ip}:${tier}`;
    },
  });

  // Override for premium users
  instance.addHook('onRequest', async (request, reply) => {
    if (request.user?.tier === 'premium') {
      request.rateLimitOptions = {
        max: 10000,
        windowMs: 3600000,
      };
    }
  });

  instance.get('/api/data', async (request) => {
    return { data: [] };
  });
});

// Example 6: Callback when limit is reached (logging, alerting)
await fastify.register(rateLimiterPlugin, {
  redis,
  max: 100,
  windowMs: 60000,
  onLimitReached: (request) => {
    console.warn('Rate limit exceeded:', {
      ip: request.ip,
      url: request.url,
      user: request.user?.id,
      timestamp: new Date().toISOString(),
    });
    
    // Could send to monitoring system
    // monitoring.increment('rate_limit.exceeded', {
    //   route: request.routeOptions.url,
    //   ip: request.ip,
    // });
  },
});

// Example 7: Cost-based rate limiting (different endpoints have different costs)
const ENDPOINT_COSTS = {
  '/api/search': 5,           // Search is expensive
  '/api/export': 10,          // Export is very expensive
  '/api/simple': 1,           // Simple queries are cheap
};

await fastify.register(rateLimiterPlugin, {
  redis,
  max: 100,
  windowMs: 60000,
  // Note: This requires modifying the plugin to support cost
  // This is a conceptual example for future enhancement
});

// Example 8: Disable rate limiting for health checks
fastify.get('/health', {
  config: {
    rateLimit: false, // No rate limiting
  },
}, async () => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
  };
});

// Example 9: Skip failed requests (don't count errors against limit)
await fastify.register(rateLimiterPlugin, {
  redis,
  max: 100,
  windowMs: 60000,
  skipFailedRequests: true, // Don't count 4xx/5xx responses
});

// Example 10: Custom error response
fastify.setErrorHandler((error, request, reply) => {
  if (error.statusCode === 429) {
    return reply.status(429).send({
      error: 'Rate Limit Exceeded',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: error.retryAfter,
      limit: error.limit,
      resetTime: error.resetTime,
    });
  }
  
  return reply.send(error);
});

// Start server
await fastify.listen({ port: 3000, host: '0.0.0.0' });
console.log('Server running on http://localhost:3000');
