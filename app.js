'use strict';

const express = require('express');

const app = express();

const products = [
  { id: 1, name: 'Wireless Mouse',      price: 29.99 },
  { id: 2, name: 'Mechanical Keyboard', price: 89.99 },
  { id: 3, name: 'USB-C Hub',           price: 49.99 },
  { id: 4, name: 'Monitor Stand',       price: 39.99 },
  { id: 5, name: 'Webcam HD',           price: 69.99 },
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

module.exports = app;
