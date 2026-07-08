const express = require('express');

const app = express();
app.use(express.json());

const startTime = Date.now();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: Math.floor((Date.now() - startTime) / 1000) });
});

// Product routes
const productRouter = require('./routes');
app.use('/api/products', productRouter);

module.exports = app;
