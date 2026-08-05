/**
 * Integration tests for rate limiting with real Redis
 * 
 * These tests require a Redis instance running.
 * Skip if Redis is not available (for CI/CD environments without Redis).
 */

import Fastify from 'fastify';
import { createRedisClient } from '../../config/redis.js';
import rateLimiterPlugin from '../rate-limiter.js';

const REDIS_AVAILABLE = process.env.REDIS_AVAILABLE === 'true';

const describeIfRedis = REDIS_AVAILABLE ? describe : describe.skip;

describeIfRedis('Rate Limiter Integration Tests', () => {
  let fastify;
  let redis;

  beforeAll(async () => {
    redis = createRedisClient();
    await redis.ping(); // Ensure connection works
  });

  beforeEach(async () => {
    fastify = Fastify();
    await redis.flushdb(); // Clear Redis before each test
  });

  afterEach(async () => {
    await fastify.close();
  });

  afterAll(async () => {
    await redis.quit();
  });

  test('should enforce rate limits across multiple requests', async () => {
    await fastify.register(rateLimiterPlugin, {
      redis,
      max: 5,
      windowMs: 5000,
    });

    fastify.get('/test', async () => ({ success: true }));

    // Make 5 requests - all should succeed
    for (let i = 0; i < 5; i++) {
      const response = await fastify.inject({
        method: 'GET',
        url: '/test',
      });
      expect(response.statusCode).toBe(200);
      expect(response.headers['x-ratelimit-remaining']).toBe(String(4 - i));
    }

    // 6th request should be blocked
    const blockedResponse = await fastify.inject({
      method: 'GET',
      url: '/test',
    });
    expect(blockedResponse.statusCode).toBe(429);
  });

  test('should reset limits after window expires', async () => {
    await fastify.register(rateLimiterPlugin, {
      redis,
      max: 3,
      windowMs: 1000, // 1 second window
    });

    fastify.get('/test', async () => ({ success: true }));

    // Make 3 requests
    for (let i = 0; i < 3; i++) {
      const response = await fastify.inject({
        method: 'GET',
        url: '/test',
      });
      expect(response.statusCode).toBe(200);
    }

    // 4th request blocked
    const blocked = await fastify.inject({
      method: 'GET',
      url: '/test',
    });
    expect(blocked.statusCode).toBe(429);

    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Should allow requests again
    const afterReset = await fastify.inject({
      method: 'GET',
      url: '/test',
    });
    expect(afterReset.statusCode).toBe(200);
  });

  test('should handle concurrent requests correctly', async () => {
    await fastify.register(rateLimiterPlugin, {
      redis,
      max: 10,
      windowMs: 5000,
    });

    fastify.get('/test', async () => ({ success: true }));

    // Make 15 concurrent requests
    const requests = Array(15).fill(null).map(() =>
      fastify.inject({
        method: 'GET',
        url: '/test',
      })
    );

    const responses = await Promise.all(requests);

    const successCount = responses.filter(r => r.statusCode === 200).length;
    const blockedCount = responses.filter(r => r.statusCode === 429).length;

    expect(successCount).toBe(10);
    expect(blockedCount).toBe(5);
  });

  test('should enforce different limits per route', async () => {
    await fastify.register(rateLimiterPlugin, {
      redis,
      max: 100,
      windowMs: 60000,
    });

    fastify.get('/strict', {
      config: {
        rateLimit: {
          max: 2,
          windowMs: 5000,
          routeKey: 'strict',
        },
      },
    }, async () => ({ success: true }));

    fastify.get('/lenient', {
      config: {
        rateLimit: {
          max: 10,
          windowMs: 5000,
          routeKey: 'lenient',
        },
      },
    }, async () => ({ success: true }));

    // Strict endpoint: 2 requests max
    const strict1 = await fastify.inject({ method: 'GET', url: '/strict' });
    const strict2 = await fastify.inject({ method: 'GET', url: '/strict' });
    const strict3 = await fastify.inject({ method: 'GET', url: '/strict' });

    expect(strict1.statusCode).toBe(200);
    expect(strict2.statusCode).toBe(200);
    expect(strict3.statusCode).toBe(429);

    // Lenient endpoint: 10 requests max (not affected by strict)
    for (let i = 0; i < 10; i++) {
      const response = await fastify.inject({ method: 'GET', url: '/lenient' });
      expect(response.statusCode).toBe(200);
    }

    const lenient11 = await fastify.inject({ method: 'GET', url: '/lenient' });
    expect(lenient11.statusCode).toBe(429);
  });

  test('should use custom key generator', async () => {
    const customKeyGen = (req) => {
      return req.headers['x-user-id'] || req.ip;
    };

    await fastify.register(rateLimiterPlugin, {
      redis,
      max: 3,
      windowMs: 5000,
      keyGenerator: customKeyGen,
    });

    fastify.get('/test', async () => ({ success: true }));

    // User 1: 3 requests
    for (let i = 0; i < 3; i++) {
      const response = await fastify.inject({
        method: 'GET',
        url: '/test',
        headers: { 'x-user-id': 'user-1' },
      });
      expect(response.statusCode).toBe(200);
    }

    // User 1: 4th request blocked
    const blocked = await fastify.inject({
      method: 'GET',
      url: '/test',
      headers: { 'x-user-id': 'user-1' },
    });
    expect(blocked.statusCode).toBe(429);

    // User 2: should still have full quota
    const user2 = await fastify.inject({
      method: 'GET',
      url: '/test',
      headers: { 'x-user-id': 'user-2' },
    });
    expect(user2.statusCode).toBe(200);
    expect(user2.headers['x-ratelimit-remaining']).toBe('2');
  });

  test('should provide accurate rate limit info', async () => {
    await fastify.register(rateLimiterPlugin, {
      redis,
      max: 10,
      windowMs: 60000,
    });

    fastify.get('/test', async () => ({ success: true }));

    // Make 3 requests
    for (let i = 0; i < 3; i++) {
      await fastify.inject({ method: 'GET', url: '/test' });
    }

    const info = await fastify.getRateLimitInfo('127.0.0.1');

    expect(info.count).toBe(3);
    expect(info.remaining).toBe(7);
    expect(info.limit).toBe(10);
    expect(info.resetTime).toBeGreaterThan(Date.now());
  });
});
