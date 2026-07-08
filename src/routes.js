const express = require('express');
const router = express.Router();
const store = require('./products');

// POST /api/products
router.post('/', (req, res) => {
  const errors = store.validateProduct(req.body, true);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  const product = store.createProduct(req.body);
  return res.status(201).json(product);
});

// GET /api/products
router.get('/', (req, res) => {
  const { category, inStock } = req.query;
  const products = store.listProducts({ category, inStock });
  return res.json(products);
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = store.getProduct(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json(product);
});

// PUT /api/products/:id
router.put('/:id', (req, res) => {
  const errors = store.validateProduct(req.body, false);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  const product = store.updateProduct(req.params.id, req.body);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json(product);
});

// DELETE /api/products/:id
router.delete('/:id', (req, res) => {
  const deleted = store.deleteProduct(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.status(204).send();
});

module.exports = router;
