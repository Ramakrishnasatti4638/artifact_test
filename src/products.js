const { v4: uuidv4 } = require('crypto').webcrypto
  ? (() => { try { return require('crypto'); } catch { return null; } })()
  : null;

// Simple UUID v4 without external deps
function generateId() {
  return require('crypto').randomUUID
    ? require('crypto').randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const products = [];

function validateProduct(body, requireAll = true) {
  const errors = [];

  if (requireAll || body.name !== undefined) {
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      errors.push('name is required and must be a non-empty string');
    }
  }

  if (body.price !== undefined) {
    const price = Number(body.price);
    if (isNaN(price) || price <= 0) {
      errors.push('price must be a positive number');
    }
  } else if (requireAll) {
    errors.push('price is required');
  }

  if (body.stock !== undefined) {
    const stock = Number(body.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      errors.push('stock must be an integer >= 0');
    }
  } else if (requireAll) {
    errors.push('stock is required');
  }

  return errors;
}

function createProduct(body) {
  const product = {
    id: generateId(),
    name: body.name.trim(),
    description: body.description || '',
    price: Number(body.price),
    category: body.category || '',
    stock: Number(body.stock),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  products.push(product);
  return product;
}

function listProducts(filters = {}) {
  let result = [...products];

  if (filters.category) {
    result = result.filter(
      (p) => p.category.toLowerCase() === filters.category.toLowerCase()
    );
  }

  if (filters.inStock === 'true') {
    result = result.filter((p) => p.stock > 0);
  }

  return result;
}

function getProduct(id) {
  return products.find((p) => p.id === id) || null;
}

function updateProduct(id, body) {
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  const current = products[idx];
  const updated = {
    ...current,
    name: body.name !== undefined ? body.name.trim() : current.name,
    description: body.description !== undefined ? body.description : current.description,
    price: body.price !== undefined ? Number(body.price) : current.price,
    category: body.category !== undefined ? body.category : current.category,
    stock: body.stock !== undefined ? Number(body.stock) : current.stock,
    updatedAt: new Date().toISOString(),
  };
  products[idx] = updated;
  return updated;
}

function deleteProduct(id) {
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  products.splice(idx, 1);
  return true;
}

// Exposed for test teardown
function _reset() {
  products.splice(0, products.length);
}

module.exports = {
  validateProduct,
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  _reset,
};
