const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

function startServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

async function request(server, path, options = {}) {
  const port = server.address().port;
  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await response.json();
  return { response, data };
}

test('bulk import skips invalid products and imports valid products', async () => {
  const server = await startServer();
  try {
    const { response, data } = await request(server, '/api/products/bulk-import', {
      method: 'POST',
      body: JSON.stringify([
        { sku: 'TST-1', name: 'Test Item', category: 'QA', quantity: 2, minStock: 1, unitPrice: 3, supplier: 'Test Supplier' },
        { sku: '', name: 'Broken', quantity: -1 },
      ]),
    });

    assert.equal(response.status, 200);
    assert.equal(data.imported, 1);
    assert.equal(data.skipped, 1);
    assert.equal(data.errors.length, 1);
  } finally {
    server.close();
  }
});

test('stock adjustment updates quantity and records movement', async () => {
  const server = await startServer();
  try {
    const { data: products } = await request(server, '/api/products');
    const target = products[0];
    const { response, data } = await request(server, `/api/products/${target.id}/adjust`, {
      method: 'POST',
      body: JSON.stringify({ adjustment: 5, reason: 'Cycle count correction' }),
    });

    assert.equal(response.status, 200);
    assert.equal(data.product.quantity, target.quantity + 5);
    assert.equal(data.movement.reason, 'Cycle count correction');

    const { data: movements } = await request(server, `/api/stock-movements?productId=${target.id}`);
    assert.equal(movements.total >= 1, true);
    assert.equal(movements.data[0].productId, target.id);
  } finally {
    server.close();
  }
});

test('low stock endpoint returns critical items first', async () => {
  const server = await startServer();
  try {
    const { data } = await request(server, '/api/products/low-stock');
    assert.equal(data.every((product) => product.quantity <= product.minStock), true);
    for (let index = 1; index < data.length; index += 1) {
      assert.equal(data[index - 1].quantity - data[index - 1].minStock <= data[index].quantity - data[index].minStock, true);
    }
  } finally {
    server.close();
  }
});
