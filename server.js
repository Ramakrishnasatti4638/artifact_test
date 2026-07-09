'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── In-memory store ────────────────────────────────────────────────────────

let products = [
  { id: uuidv4(), sku: 'SKU-001', name: 'Widget Alpha',     category: 'Widgets',     quantity: 12, minStock: 20,  unitPrice:  4.99, supplier: 'Acme Corp',    lastUpdated: new Date().toISOString() },
  { id: uuidv4(), sku: 'SKU-002', name: 'Gadget Pro',       category: 'Gadgets',     quantity: 45, minStock: 10,  unitPrice: 29.99, supplier: 'TechSource',   lastUpdated: new Date().toISOString() },
  { id: uuidv4(), sku: 'SKU-003', name: 'Bolt 5mm',         category: 'Fasteners',   quantity:  3, minStock: 50,  unitPrice:  0.15, supplier: 'HardwarePlus', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), sku: 'SKU-004', name: 'Wrench Set',       category: 'Tools',       quantity:  8, minStock:  5,  unitPrice: 34.50, supplier: 'ToolMart',     lastUpdated: new Date().toISOString() },
  { id: uuidv4(), sku: 'SKU-005', name: 'Safety Gloves',    category: 'Safety',      quantity:  2, minStock: 15,  unitPrice: 12.00, supplier: 'SafetyFirst',  lastUpdated: new Date().toISOString() },
  { id: uuidv4(), sku: 'SKU-006', name: 'Circuit Board X1', category: 'Electronics', quantity: 60, minStock: 25,  unitPrice: 89.00, supplier: 'ElectroParts', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), sku: 'SKU-007', name: 'PVC Pipe 2in',     category: 'Plumbing',    quantity: 19, minStock: 20,  unitPrice:  6.75, supplier: 'PipeCo',       lastUpdated: new Date().toISOString() },
  { id: uuidv4(), sku: 'SKU-008', name: 'Drill Bit Set',    category: 'Tools',       quantity:  7, minStock: 10,  unitPrice: 18.99, supplier: 'ToolMart',     lastUpdated: new Date().toISOString() },
];

let stockMovements = [];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function validateProduct(p) {
  const errors = [];
  if (!p || typeof p !== 'object')                                           errors.push('body must be an object');
  if (!p.sku      || typeof p.sku !== 'string'      || !String(p.sku).trim())      errors.push('sku is required');
  if (!p.name     || typeof p.name !== 'string'     || !String(p.name).trim())     errors.push('name is required');
  if (!p.category || typeof p.category !== 'string' || !String(p.category).trim()) errors.push('category is required');
  if (!p.supplier || typeof p.supplier !== 'string' || !String(p.supplier).trim()) errors.push('supplier is required');
  if (p.quantity  === undefined || p.quantity  === null || isNaN(Number(p.quantity))  || Number(p.quantity)  < 0) errors.push('quantity must be a non-negative number');
  if (p.minStock  === undefined || p.minStock  === null || isNaN(Number(p.minStock))  || Number(p.minStock)  < 0) errors.push('minStock must be a non-negative number');
  if (p.unitPrice === undefined || p.unitPrice === null || isNaN(Number(p.unitPrice)) || Number(p.unitPrice) < 0) errors.push('unitPrice must be a non-negative number');
  return errors;
}

function sanitizeProduct(p) {
  return {
    sku:       String(p.sku).trim(),
    name:      String(p.name).trim(),
    category:  String(p.category).trim(),
    supplier:  String(p.supplier).trim(),
    quantity:  Number(p.quantity),
    minStock:  Number(p.minStock),
    unitPrice: Number(p.unitPrice),
  };
}

// ─── Products — static sub-paths first ───────────────────────────────────────

// GET /api/products/low-stock  (must be BEFORE /:id)
app.get('/api/products/low-stock', (req, res) => {
  const low = products
    .filter(p => p.quantity <= p.minStock)
    .sort((a, b) => (a.quantity - a.minStock) - (b.quantity - b.minStock));
  res.json(low);
});

// POST /api/products/bulk-import  (must be BEFORE /:id)
app.post('/api/products/bulk-import', (req, res) => {
  const body = req.body;
  if (!Array.isArray(body)) return res.status(400).json({ error: 'Body must be a JSON array' });

  let imported = 0, skipped = 0;
  const errors = [];

  for (let i = 0; i < body.length; i++) {
    const row = body[i];
    const rowErrors = validateProduct(row);

    if (rowErrors.length) {
      skipped++;
      errors.push({ row: i + 1, sku: row.sku || null, errors: rowErrors });
      continue;
    }

    const sku = String(row.sku).trim();
    if (products.some(p => p.sku === sku)) {
      skipped++;
      errors.push({ row: i + 1, sku, errors: ['SKU already exists'] });
      continue;
    }

    products.push({ id: uuidv4(), ...sanitizeProduct(row), lastUpdated: new Date().toISOString() });
    imported++;
  }

  res.json({ imported, skipped, errors });
});

// ─── CRUD ─────────────────────────────────────────────────────────────────────

// GET all products
app.get('/api/products', (req, res) => res.json(products));

// GET single product
app.get('/api/products/:id', (req, res) => {
  const p = products.find(p => p.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json(p);
});

// POST create product
app.post('/api/products', (req, res) => {
  const errors = validateProduct(req.body);
  if (errors.length) return res.status(400).json({ errors });

  if (products.some(p => p.sku === String(req.body.sku).trim()))
    return res.status(400).json({ errors: ['SKU already exists'] });

  const product = { id: uuidv4(), ...sanitizeProduct(req.body), lastUpdated: new Date().toISOString() };
  products.push(product);
  res.status(201).json(product);
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });

  const errors = validateProduct(req.body);
  if (errors.length) return res.status(400).json({ errors });

  if (products.some(p => p.sku === String(req.body.sku).trim() && p.id !== req.params.id))
    return res.status(400).json({ errors: ['SKU already used by another product'] });

  products[idx] = { ...products[idx], ...sanitizeProduct(req.body), lastUpdated: new Date().toISOString() };
  res.json(products[idx]);
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  products.splice(idx, 1);
  res.json({ success: true });
});

// ─── Stock Adjustment ────────────────────────────────────────────────────────

app.post('/api/products/:id/adjust', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const { adjustment, reason } = req.body;
  const adj = Number(adjustment);

  if (!adjustment || isNaN(adj) || adj === 0)
    return res.status(400).json({ error: 'adjustment must be a non-zero number' });
  if (!reason || typeof reason !== 'string' || !reason.trim())
    return res.status(400).json({ error: 'reason is required' });

  const newQty = product.quantity + adj;
  if (newQty < 0) return res.status(400).json({ error: 'Adjustment would result in negative stock' });

  product.quantity    = newQty;
  product.lastUpdated = new Date().toISOString();

  const movement = {
    id:          uuidv4(),
    productId:   product.id,
    productName: product.name,
    sku:         product.sku,
    adjustment:  adj,
    reason:      reason.trim(),
    timestamp:   new Date().toISOString(),
  };
  stockMovements.unshift(movement);
  res.json({ product, movement });
});

// ─── Stock Movements ─────────────────────────────────────────────────────────

app.get('/api/stock-movements', (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const { productId } = req.query;

  let data = productId
    ? stockMovements.filter(m => m.productId === productId)
    : stockMovements;

  const total = data.length;
  const offset = (page - 1) * limit;
  data = data.slice(offset, offset + limit);

  res.json({ total, page, limit, data });
});

// ─── SPA fallback ─────────────────────────────────────────────────────────────

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`InvenTrack running on http://localhost:${PORT}`));
