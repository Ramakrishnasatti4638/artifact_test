import Fastify from 'fastify';
import { jest } from '@jest/globals';
import rateLimiterPlugin from '../rate-limiter.js';

describe('Rate Limiter Plugin', () => {
  let fastify;
  let mockRedis;
  let mockPipeline;

  beforeEach(async () => {
    fastify = Fastify();

    mockPipeline = {
      zremrangebyscore: jest.fn().mockReturnThis(),
      zcard: jest.fn().mockReturnThis(),
      zadd: jest.fn().mockReturnThis(),
      expire: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    mockRedis = {
      pipeline: jest.fn(() => mockPipeline),
      zremrangebyscore: jest.fn(),
      zcard: jest.fn(),
      quit: jest.fn(),
      on: jest.fn(),
    };

    // Default: allow requests (count = 5, under limit of 10)
    mockPipeline.exec.mockResolvedValue([
      [null, 1], // zremrangebyscore
      [null, 5], // zcard - current count
      [null, 1], // zadd
      [null, 1], // expire
    ]);
  });

  afterEach(async () => {
    await fastify.close();
  });

  test('should allow requests under rate limit', async () => {
    await fastify.register(rateLimiterPlugin, {
      redis: mockRedis,
      max: 10,
      windowMs: 60000,
    });

    fastify.get('/test', async () => ({ success: true }));

    const response = await fastify.inject({
      method: 'GET',
      url: '/test',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['x-ratelimit-limit']).toBe('10');
    expect(response.headers['x-ratelimit-remaining']).toBe('4');
    expect(mockRedis.pipeline).toHaveBeenCalled();
  });

  test('should block requests over rate limit', async () => {
    // Mock: request count at limit
    mockPipeline.exec.mockResolvedValue([
      [null, 1],
      [null, 10], // count = max
      [null, 1],
      [null, 1],
    ]);

    await fastify.register(rateLimiterPlugin, {
      redis: mockRedis,
      max: 10,
      windowMs: 60000,
    });

    fastify.get('/test', async () => ({ success: true }));

    const response = await fastify.inject({
      method: 'GET',
      url: '/test',
    });

    expect(response.statusCode).toBe(429);
    expect(response.json()).toMatchObject({
      error: 'Too Many Requests',
    });
    expect(response.headers['retry-after']).toBeDefined();
  });

  test('should apply route-specific rate limits', async () => {
    // Mock lower count for this test
    mockPipeline.exec.mockResolvedValue([
      [null, 1],
      [null, 2], // count below route-specific max of 5
      [null, 1],
      [null, 1],
    ]);

    await fastify.register(rateLimiterPlugin, {
      redis: mockRedis,
      max: 100,
      windowMs: 60000,
    });

    fastify.get('/strict', {
      config: {
        rateLimit: {
          max: 5,
          windowMs: 60000,
        },
      },
    }, async () => ({ success: true }));

    const response = await fastify.inject({
      method: 'GET',
      url: '/strict',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['x-ratelimit-limit']).toBe('5');
    expect(response.headers['x-ratelimit-remaining']).toBe('2');
  });

  test('should skip rate limiting for disabled routes', async () => {
    await fastify.register(rateLimiterPlugin, {
      redis: mockRedis,
      max: 10,
    });

    fastify.get('/no-limit', {
      config: {
        rateLimit: false,
      },
    }, async () => ({ success: true }));

    const response = await fastify.inject({
      method: 'GET',
      url: '/no-limit',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['x-ratelimit-limit']).toBeUndefined();
    expect(mockRedis.pipeline).not.toHaveBeenCalled();
  });

  test('should not apply rate limiting when disabled globally', async () => {
    await fastify.register(rateLimiterPlugin, {
      redis: mockRedis,
      enabled: false,
    });

    fastify.get('/test', async () => ({ success: true }));

    const response = await fastify.inject({
      method: 'GET',
      url: '/test',
    });

    expect(response.statusCode).toBe(200);
    expect(mockRedis.pipeline).not.toHaveBeenCalled();
  });

  test('should use custom key generator', async () => {
    const customKeyGen = jest.fn(() => 'custom-key');

    await fastify.register(rateLimiterPlugin, {
      redis: mockRedis,
      keyGenerator: customKeyGen,
    });

    fastify.get('/test', async () => ({ success: true }));

    await fastify.inject({
      method: 'GET',
      url: '/test',
    });

    expect(customKeyGen).toHaveBeenCalled();
  });

  test('should respect whitelist', async () => {
    await fastify.register(rateLimiterPlugin, {
      redis: mockRedis,
      whitelist: ['127.0.0.1'],
    });

    fastify.get('/test', async () => ({ success: true }));

    const response = await fastify.inject({
      method: 'GET',
      url: '/test',
      remoteAddress: '127.0.0.1',
    });

    expect(response.statusCode).toBe(200);
    expect(mockRedis.pipeline).not.toHaveBeenCalled();
  });

  test('should call onLimitReached callback when limit exceeded', async () => {
    const onLimitReached = jest.fn();

    mockPipeline.exec.mockResolvedValue([
      [null, 1],
      [null, 100],
      [null, 1],
      [null, 1],
    ]);

    await fastify.register(rateLimiterPlugin, {
      redis: mockRedis,
      max: 100,
      onLimitReached,
    });

    fastify.get('/test', async () => ({ success: true }));

    await fastify.inject({
      method: 'GET',
      url: '/test',
    });

    expect(onLimitReached).toHaveBeenCalled();
  });

  test('should fail open on Redis error', async () => {
    mockPipeline.exec.mockRejectedValue(new Error('Redis connection failed'));

    await fastify.register(rateLimiterPlugin, {
      redis: mockRedis,
    });

    fastify.get('/test', async () => ({ success: true }));

    const response = await fastify.inject({
      method: 'GET',
      url: '/test',
    });

    expect(response.statusCode).toBe(200);
  });

  test('should provide rate limit info via decorator', async () => {
    mockRedis.zremrangebyscore.mockResolvedValue(1);
    mockRedis.zcard.mockResolvedValue(15);

    await fastify.register(rateLimiterPlugin, {
      redis: mockRedis,
      max: 100,
    });

    const info = await fastify.getRateLimitInfo('test-key');

    expect(info).toMatchObject({
      count: 15,
      remaining: 85,
      limit: 100,
    });
    expect(info.resetTime).toBeDefined();
  });

  test('should set correct rate limit headers', async () => {
    mockPipeline.exec.mockResolvedValue([
      [null, 1],
      [null, 25],
      [null, 1],
      [null, 1],
    ]);

    await fastify.register(rateLimiterPlugin, {
      redis: mockRedis,
      max: 50,
      windowMs: 60000,
    });

    fastify.get('/test', async () => ({ success: true }));

    const response = await fastify.inject({
      method: 'GET',
      url: '/test',
    });

    expect(response.headers['x-ratelimit-limit']).toBe('50');
    expect(response.headers['x-ratelimit-remaining']).toBe('24');
    expect(response.headers['x-ratelimit-reset']).toBeDefined();
  });

  test('should use sliding window correctly', async () => {
    await fastify.register(rateLimiterPlugin, {
      redis: mockRedis,
      max: 10,
      windowMs: 60000,
    });

    fastify.get('/test', async () => ({ success: true }));

    await fastify.inject({
      method: 'GET',
      url: '/test',
    });

    const pipelineCalls = mockPipeline.zremrangebyscore.mock.calls;
    expect(pipelineCalls.length).toBeGreaterThan(0);
  });
});
