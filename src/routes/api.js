export default async function apiRoutes(fastify, options) {
  
  // Example route with global rate limit
  fastify.get('/data', async (request, reply) => {
    return {
      message: 'This endpoint uses global rate limiting',
      timestamp: new Date().toISOString(),
    };
  });

  // Example route with custom rate limit (stricter)
  fastify.post('/create', {
    config: {
      rateLimit: {
        max: 10,
        windowMs: 60000, // 10 requests per minute
        routeKey: 'create',
      },
    },
  }, async (request, reply) => {
    return {
      message: 'Resource created',
      timestamp: new Date().toISOString(),
    };
  });

  // Example route with custom rate limit (more permissive)
  fastify.get('/public', {
    config: {
      rateLimit: {
        max: 1000,
        windowMs: 60000, // 1000 requests per minute
        routeKey: 'public',
      },
    },
  }, async (request, reply) => {
    return {
      message: 'Public endpoint with high rate limit',
      timestamp: new Date().toISOString(),
    };
  });

  // Example route with rate limiting disabled
  fastify.get('/health', {
    config: {
      rateLimit: false,
    },
  }, async (request, reply) => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  });

  // Get current rate limit status
  fastify.get('/rate-limit-status', async (request, reply) => {
    const key = request.ip;
    const info = await fastify.getRateLimitInfo(key);
    
    return {
      ip: key,
      ...info,
    };
  });
}
