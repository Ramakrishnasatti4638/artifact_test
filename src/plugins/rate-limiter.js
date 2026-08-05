import fp from 'fastify-plugin';

/**
 * Rate Limiter Plugin for Fastify
 * Implements sliding window rate limiting using Redis
 */

const DEFAULT_OPTIONS = {
  max: 100,
  windowMs: 60000,
  keyGenerator: (request) => request.ip,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  whitelist: [],
  onLimitReached: null,
  enabled: true,
};

async function rateLimiterPlugin(fastify, options) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  if (!config.enabled) {
    fastify.log.info('Rate limiter is disabled');
    return;
  }

  if (!config.redis) {
    throw new Error('Redis client is required for rate limiter');
  }

  const redis = config.redis;

  /**
   * Check if IP/key is whitelisted
   */
  function isWhitelisted(key) {
    return config.whitelist.includes(key);
  }

  /**
   * Get rate limit key for Redis
   */
  function getRateLimitKey(key, routeKey = 'global') {
    return `ratelimit:${routeKey}:${key}`;
  }

  /**
   * Sliding window rate limiter implementation
   */
  async function checkRateLimit(key, routeKey, max, windowMs) {
    const redisKey = getRateLimitKey(key, routeKey);
    const now = Date.now();
    const windowStart = now - windowMs;

    const pipeline = redis.pipeline();
    
    // Remove old entries outside the window
    pipeline.zremrangebyscore(redisKey, 0, windowStart);
    
    // Count requests in current window
    pipeline.zcard(redisKey);
    
    // Add current request
    pipeline.zadd(redisKey, now, `${now}-${Math.random()}`);
    
    // Set expiry on the key
    pipeline.expire(redisKey, Math.ceil(windowMs / 1000) + 1);

    const results = await pipeline.exec();
    
    // results[1] is the count before adding current request
    const count = results[1][1];
    const remaining = Math.max(0, max - count - 1);
    const isLimited = count >= max;

    const resetTime = now + windowMs;

    return {
      success: !isLimited,
      count: count + 1,
      remaining,
      resetTime,
      retryAfter: isLimited ? Math.ceil(windowMs / 1000) : null,
    };
  }

  /**
   * Rate limiter hook
   */
  fastify.addHook('onRequest', async (request, reply) => {
    const routeConfig = request.routeOptions?.config || {};
    const routeRateLimit = routeConfig.rateLimit;

    // Skip if route explicitly disables rate limiting
    if (routeRateLimit === false) {
      return;
    }

    const key = config.keyGenerator(request);

    // Skip whitelisted keys
    if (isWhitelisted(key)) {
      return;
    }

    // Use route-specific config or global config
    const max = routeRateLimit?.max || config.max;
    const windowMs = routeRateLimit?.windowMs || config.windowMs;
    const routeKey = routeRateLimit?.routeKey || request.routeOptions?.url || 'global';

    try {
      const result = await checkRateLimit(key, routeKey, max, windowMs);

      // Set rate limit headers
      reply.header('X-RateLimit-Limit', max);
      reply.header('X-RateLimit-Remaining', result.remaining);
      reply.header('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

      if (!result.success) {
        reply.header('Retry-After', result.retryAfter);

        if (config.onLimitReached) {
          config.onLimitReached(request, reply);
        }

        return reply.code(429).send({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
          retryAfter: result.retryAfter,
        });
      }
    } catch (error) {
      fastify.log.error({ err: error }, 'Rate limiter error');
      // Fail open - allow request if rate limiter fails
    }
  });

  /**
   * Decorator to manually check rate limits
   */
  fastify.decorate('checkRateLimit', checkRateLimit);

  /**
   * Decorator to get remaining rate limit
   */
  fastify.decorate('getRateLimitInfo', async (key, routeKey = 'global') => {
    const redisKey = getRateLimitKey(key, routeKey);
    const now = Date.now();
    const windowStart = now - config.windowMs;

    await redis.zremrangebyscore(redisKey, 0, windowStart);
    const count = await redis.zcard(redisKey);
    const remaining = Math.max(0, config.max - count);

    return {
      count,
      remaining,
      limit: config.max,
      resetTime: now + config.windowMs,
    };
  });
}

export default fp(rateLimiterPlugin, {
  fastify: '4.x',
  name: 'rate-limiter',
});
