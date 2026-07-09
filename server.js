const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

let nextProductId = 5;
const products = [
  {
    id: 1,
    sku: 'MED-001',
    name: 'Nitrile Gloves',
    category: 'Medical Supplies',
    quantity: 42,
    minStock: 50,
    unitPrice: 12.5,
    supplier: 'HealthPro Supply',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 2,
    sku: 'OFF-104',
    name: 'Printer Paper',
    category: 'Office',
    quantity: 120,
    minStock: 35,
    unitPrice: 5.75,
    supplier: 'Office Depot',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 3,
    sku: 'IT-220',
    name: 'USB-C Dock',
    category: 'IT Equipment',
    quantity: 8,
    minStock: 10,
    unitPrice: 89.99,
    supplier: 'TechBridge',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 4,
    sku: 'FAC-018',
    name: 'Disinfectant Wipes',
    category: 'Facilities',
    quantity: 64,
    minStock: 40,
    unitPrice: 8.25,
    supplier: 'CleanCo',
    lastUpdated: new Date().toISOString(),
  },
];
const stockMovements = [];

function normalizeProduct(input, existingId) {
  const errors = [];
  const sku = typeof input.sku === 'string' ? input.sku.trim() : '';
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const category = typeof input.category === 'string' ? input.category.trim() : '';
  const supplier = typeof input.supplier === 'string' ? input.supplier.trim() : '';
  const quantity = Number(input.quantity);
  const minStock = Number(input.minStock);
  const unitPrice = Number(input.unitPrice);

  if (!sku) errors.push('sku is required');
  if (!name) errors.push('name is required');
  if (!category) errors.push('category is required');
  if (!supplier) errors.push('supplier is required');
  if (!Number.isFinite(quantity) || quantity < 0) errors.push('quantity must be a non-negative number');
  if (!Number.isFinite(minStock) || minStock < 0) errors.push('minStock must be a non-negative number');
  if (!Number.isFinite(unitPrice) || unitPrice < 0) errors.push('unitPrice must be a non-negative number');

  if (errors.length) return { errors };

  return {
    product: {
      id: existingId,
      sku,
      name,
      category,
      quantity,
      minStock,
      unitPrice,
      supplier,
      lastUpdated: new Date().toISOString(),
    },
    errors: [],
  };
}

function findProduct(id) {
  return products.find((product) => product.id === Number(id));
}

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const { product, errors } = normalizeProduct(req.body, nextProductId);
  if (errors.length) return res.status(400).json({ errors });
  products.push(product);
  nextProductId += 1;
  res.status(201).json(product);
});

app.get('/api/products/low-stock', (req, res) => {
  res.json(
    products
      .filter((product) => product.quantity <= product.minStock)
      .sort((a, b) => a.quantity - a.minStock - (b.quantity - b.minStock))
  );
});

app.get('/api/products/:id', (req, res) => {
  const product = findProduct(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.put('/api/products/:id', (req, res) => {
  const product = findProduct(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const { product: updatedProduct, errors } = normalizeProduct(req.body, product.id);
  if (errors.length) return res.status(400).json({ errors });
  Object.assign(product, updatedProduct);
  res.json(product);
});

app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex((product) => product.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Product not found' });
  const [deleted] = products.splice(index, 1);
  res.json(deleted);
});

app.post('/api/products/bulk-import', (req, res) => {
  if (!Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Request body must be a JSON array of products' });
  }

  const errors = [];
  let imported = 0;
  let skipped = 0;

  req.body.forEach((row, index) => {
    const { product, errors: rowErrors } = normalizeProduct(row || {}, nextProductId);
    if (rowErrors.length) {
      skipped += 1;
      errors.push({ index, errors: rowErrors });
      return;
    }
    products.push(product);
    nextProductId += 1;
    imported += 1;
  });

  res.json({ imported, skipped, errors });
});

app.post('/api/products/:id/adjust', (req, res) => {
  const product = findProduct(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const adjustment = Number(req.body.adjustment);
  const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : '';
  if (!Number.isFinite(adjustment) || adjustment === 0) {
    return res.status(400).json({ error: 'adjustment must be a non-zero number' });
  }
  if (!reason) return res.status(400).json({ error: 'reason is required' });
  if (product.quantity + adjustment < 0) {
    return res.status(400).json({ error: 'adjustment would make quantity negative' });
  }

  product.quantity += adjustment;
  product.lastUpdated = new Date().toISOString();
  const movement = {
    productId: product.id,
    adjustment,
    reason,
    timestamp: product.lastUpdated,
  };
  stockMovements.unshift(movement);
  res.json({ product, movement });
});

app.get('/api/stock-movements', (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100);
  const productId = req.query.productId ? Number(req.query.productId) : null;
  const filtered = productId
    ? stockMovements.filter((movement) => movement.productId === productId)
    : stockMovements;
  const start = (page - 1) * limit;

  res.json({
    page,
    limit,
    total: filtered.length,
    data: filtered.slice(start, start + limit),
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Inventory app running at http://localhost:${PORT}`);
  });
}

module.exports = app;
