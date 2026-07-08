const request = require('supertest');
const app = require('../src/app');
const store = require('../src/products');

beforeEach(() => {
  store._reset();
});

// ─── /health ───────────────────────────────────────────────────────────────

describe('GET /health', () => {
  it('returns status ok with uptime', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptime).toBe('number');
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });
});

// ─── POST /api/products ────────────────────────────────────────────────────

describe('POST /api/products', () => {
  const validPayload = {
    name: 'Widget',
    description: 'A fine widget',
    price: 9.99,
    category: 'tools',
    stock: 10,
  };

  it('creates a product and returns 201', async () => {
    const res = await request(app).post('/api/products').send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: 'Widget',
      description: 'A fine widget',
      price: 9.99,
      category: 'tools',
      stock: 10,
    });
    expect(res.body.id).toBeDefined();
    expect(res.body.createdAt).toBeDefined();
    expect(res.body.updatedAt).toBeDefined();
  });

  it('returns 400 when name is missing', async () => {
    const { name, ...body } = validPayload;
    const res = await request(app).post('/api/products').send(body);
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.stringContaining('name')])
    );
  });

  it('returns 400 when name is empty string', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ ...validPayload, name: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.stringContaining('name')])
    );
  });

  it('returns 400 when price is missing', async () => {
    const { price, ...body } = validPayload;
    const res = await request(app).post('/api/products').send(body);
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.stringContaining('price')])
    );
  });

  it('returns 400 when price is zero', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ ...validPayload, price: 0 });
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.stringContaining('price')])
    );
  });

  it('returns 400 when price is negative', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ ...validPayload, price: -5 });
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.stringContaining('price')])
    );
  });

  it('returns 400 when stock is missing', async () => {
    const { stock, ...body } = validPayload;
    const res = await request(app).post('/api/products').send(body);
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.stringContaining('stock')])
    );
  });

  it('returns 400 when stock is negative', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ ...validPayload, stock: -1 });
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.stringContaining('stock')])
    );
  });

  it('accepts stock of 0 (out of stock)', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ ...validPayload, stock: 0 });
    expect(res.status).toBe(201);
    expect(res.body.stock).toBe(0);
  });

  it('accumulates multiple validation errors', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ description: 'orphan' });
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThanOrEqual(3);
  });
});

// ─── GET /api/products ─────────────────────────────────────────────────────

describe('GET /api/products', () => {
  beforeEach(async () => {
    await request(app).post('/api/products').send({ name: 'Hammer', price: 15, category: 'tools', stock: 5 });
    await request(app).post('/api/products').send({ name: 'Screwdriver', price: 8, category: 'tools', stock: 0 });
    await request(app).post('/api/products').send({ name: 'T-shirt', price: 20, category: 'apparel', stock: 12 });
  });

  it('lists all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });

  it('filters by category', async () => {
    const res = await request(app).get('/api/products?category=tools');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    res.body.forEach((p) => expect(p.category).toBe('tools'));
  });

  it('category filter is case-insensitive', async () => {
    const res = await request(app).get('/api/products?category=TOOLS');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('filters inStock=true (stock > 0)', async () => {
    const res = await request(app).get('/api/products?inStock=true');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    res.body.forEach((p) => expect(p.stock).toBeGreaterThan(0));
  });

  it('combines category and inStock filters', async () => {
    const res = await request(app).get('/api/products?category=tools&inStock=true');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Hammer');
  });

  it('returns empty array when no products match', async () => {
    const res = await request(app).get('/api/products?category=nonexistent');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

// ─── GET /api/products/:id ─────────────────────────────────────────────────

describe('GET /api/products/:id', () => {
  let productId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Gadget', price: 99, category: 'electronics', stock: 3 });
    productId = res.body.id;
  });

  it('returns the product by id', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(productId);
    expect(res.body.name).toBe('Gadget');
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/products/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});

// ─── PUT /api/products/:id ─────────────────────────────────────────────────

describe('PUT /api/products/:id', () => {
  let productId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Old Name', price: 10, category: 'misc', stock: 5 });
    productId = res.body.id;
  });

  it('updates specified fields', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .send({ name: 'New Name', price: 25 });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New Name');
    expect(res.body.price).toBe(25);
    expect(res.body.stock).toBe(5);   // unchanged
    expect(res.body.category).toBe('misc'); // unchanged
  });

  it('persists the update (GET after PUT)', async () => {
    await request(app).put(`/api/products/${productId}`).send({ price: 99 });
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.body.price).toBe(99);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app)
      .put('/api/products/does-not-exist')
      .send({ name: 'X' });
    expect(res.status).toBe(404);
  });

  it('returns 400 when update values are invalid', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .send({ price: -1 });
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.stringContaining('price')])
    );
  });

  it('returns 400 when stock is negative on update', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .send({ stock: -5 });
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.stringContaining('stock')])
    );
  });
});

// ─── DELETE /api/products/:id ──────────────────────────────────────────────

describe('DELETE /api/products/:id', () => {
  let productId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Disposable', price: 1, stock: 1 });
    productId = res.body.id;
  });

  it('deletes the product and returns 204', async () => {
    const res = await request(app).delete(`/api/products/${productId}`);
    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });

  it('product is gone after deletion', async () => {
    await request(app).delete(`/api/products/${productId}`);
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.status).toBe(404);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).delete('/api/products/does-not-exist');
    expect(res.status).toBe(404);
  });

  it('double-delete returns 404', async () => {
    await request(app).delete(`/api/products/${productId}`);
    const res = await request(app).delete(`/api/products/${productId}`);
    expect(res.status).toBe(404);
  });
});
