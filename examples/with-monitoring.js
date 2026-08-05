/**
 * Example: Rate limiting with monitoring and metrics
 * Demonstrates how to add observability to rate limiting
 */

import Fastify from 'fastify';
import { createRedisClient } from '../src/config/redis.js';
import rateLimiterPlugin from '../src/plugins/rate-limiter.js';

const fastify = Fastify({ logger: true });
const redis = createRedisClient();

// Metrics storage (in production, use Prometheus, StatsD, etc.)
const metrics = {
  rateLimitHits: 0,
  rateLimitExceeded: 0,
  totalRequests: 0,
  limitedByRoute: {},
  limitedByIP: {},
};

// Middleware to track all requests
fastify.addHook('onRequest', async (request, reply) => {
  metrics.totalRequests++;
});

// Register rate limiter with monitoring hooks
await fastify.register(rateLimiterPlugin, {
  redis,
  max: 100,
  windowMs: 60000,
  
  onLimitReached: (request, reply) => {
    metrics.rateLimitExceeded++;
    
    // Track by route
    const route = request.routeOptions?.url || 'unknown';
    metrics.limitedByRoute[route] = (metrics.limitedByRoute[route] || 0) + 1;
    
    // Track by IP
    const ip = request.ip;
    metrics.limitedByIP[ip] = (metrics.limitedByIP[ip] || 0) + 1;
    
    // Log for analysis
    fastify.log.warn({
      event: 'rate_limit_exceeded',
      ip,
      route,
      method: request.method,
      userAgent: request.headers['user-agent'],
      timestamp: new Date().toISOString(),
    });
    
    // Could send to external monitoring
    // sendToDatadog({ metric: 'rate_limit.exceeded', tags: { route, ip } });
    // sendToSentry({ level: 'warning', message: 'Rate limit exceeded', extra: { ip, route } });
  },
});

// Metrics endpoint
fastify.get('/metrics', {
  config: {
    rateLimit: false, // Don't rate limit the metrics endpoint
  },
}, async () => {
  const rateLimitRate = metrics.totalRequests > 0
    ? (metrics.rateLimitExceeded / metrics.totalRequests * 100).toFixed(2)
    : 0;

  return {
    metrics: {
      total_requests: metrics.totalRequests,
      rate_limit_hits: metrics.rateLimitHits,
      rate_limit_exceeded: metrics.rateLimitExceeded,
      rate_limit_rate_percent: rateLimitRate,
    },
    by_route: metrics.limitedByRoute,
    by_ip: metrics.limitedByIP,
    top_limited_ips: Object.entries(metrics.limitedByIP)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count })),
  };
});

// Prometheus-style metrics (optional)
fastify.get('/metrics/prometheus', {
  config: {
    rateLimit: false,
  },
}, async (request, reply) => {
  const output = [
    '# HELP api_requests_total Total number of API requests',
    '# TYPE api_requests_total counter',
    `api_requests_total ${metrics.totalRequests}`,
    '',
    '# HELP api_rate_limit_exceeded_total Total number of rate limited requests',
    '# TYPE api_rate_limit_exceeded_total counter',
    `api_rate_limit_exceeded_total ${metrics.rateLimitExceeded}`,
    '',
  ];

  // Per-route metrics
  output.push('# HELP api_rate_limit_by_route Rate limits by route');
  output.push('# TYPE api_rate_limit_by_route counter');
  for (const [route, count] of Object.entries(metrics.limitedByRoute)) {
    output.push(`api_rate_limit_by_route{route="${route}"} ${count}`);
  }

  reply.type('text/plain');
  return output.join('\n');
});

// API routes with different limits
fastify.post('/api/login', {
  config: {
    rateLimit: {
      max: 5,
      windowMs: 900000, // 5 per 15 minutes
      routeKey: 'login',
    },
  },
}, async (request) => {
  metrics.rateLimitHits++;
  return { success: true, message: 'Login endpoint' };
});

fastify.get('/api/data', async () => {
  metrics.rateLimitHits++;
  return { data: [] };
});

// Health check hook to expose metrics
fastify.addHook('onReady', async () => {
  fastify.log.info('Metrics available at:');
  fastify.log.info('  - /metrics (JSON)');
  fastify.log.info('  - /metrics/prometheus (Prometheus format)');
});

// Alert on high rate limit violations
setInterval(() => {
  const recentLimit = metrics.rateLimitExceeded;
  
  if (recentLimit > 1000) {
    fastify.log.error({
      alert: 'high_rate_limit_violations',
      count: recentLimit,
      message: 'Unusually high number of rate limit violations detected',
    });
    
    // Could trigger:
    // - PagerDuty alert
    // - Slack notification
    // - Auto-scaling
    // - IP blocking
  }
}, 60000); // Check every minute

// Periodic summary
setInterval(() => {
  const summary = {
    period: '1 minute',
    total_requests: metrics.totalRequests,
    rate_limited: metrics.rateLimitExceeded,
    top_limited_routes: Object.entries(metrics.limitedByRoute)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3),
  };
  
  fastify.log.info({ type: 'rate_limit_summary', ...summary });
}, 60000);

await fastify.listen({ port: 3000, host: '0.0.0.0' });
console.log('Server with monitoring running on http://localhost:3000');
console.log('Visit http://localhost:3000/metrics for metrics');
