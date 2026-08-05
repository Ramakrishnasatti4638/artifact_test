import Fastify from 'fastify';
import dotenv from 'dotenv';
import { createRedisClient } from './config/redis.js';
import rateLimiterPlugin from './plugins/rate-limiter.js';
import apiRoutes from './routes/api.js';

dotenv.config();

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

// Create Redis client
const redis = createRedisClient();

// Register rate limiter plugin
await fastify.register(rateLimiterPlugin, {
  redis,
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
  keyGenerator: (request) => {
    // Use X-Forwarded-For if behind proxy, otherwise use IP
    return request.headers['x-forwarded-for']?.split(',')[0].trim() || request.ip;
  },
  whitelist: [],
  onLimitReached: (request, reply) => {
    fastify.log.warn({
      ip: request.ip,
      path: request.url,
      method: request.method,
    }, 'Rate limit exceeded');
  },
});

// Register routes
await fastify.register(apiRoutes, { prefix: '/api' });

// Root route
fastify.get('/', async (request, reply) => {
  return {
    message: 'Fastify API with Redis Rate Limiting',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      data: '/api/data',
      create: '/api/create',
      public: '/api/public',
      rateLimitStatus: '/api/rate-limit-status',
    },
  };
});

// Graceful shutdown
const closeGracefully = async (signal) => {
  fastify.log.info(`Received signal to terminate: ${signal}`);
  
  await fastify.close();
  await redis.quit();
  
  process.exit(0);
};

process.on('SIGINT', closeGracefully);
process.on('SIGTERM', closeGracefully);

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000', 10);
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    
    fastify.log.info(`Server listening on ${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
