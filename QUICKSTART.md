# Quick Start

## 1. Install & Start

```bash
npm install
docker-compose up redis
npm start
```

## 2. Test It

```bash
npm run demo
```

## 3. Configure

Edit route limits in `src/routes/api.js`:
```javascript
fastify.post('/api/create', {
  config: {
    rateLimit: {
      max: 10,
      windowMs: 60000,
    },
  },
}, handler);
```

See `README.md` for full documentation.
