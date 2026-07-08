'use strict';

const request = require('supertest');
const app = require('../app');

describe('GET /api/health', () => {
  it('returns 200 with { status: "ok" }', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('GET /api/products', () => {
  it('returns 200 with a JSON array', async () => {
    const res = await request(app).get('/api/products');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns exactly 5 products', async () => {
    const res = await request(app).get('/api/products');

    expect(res.body).toHaveLength(5);
  });

  it('each product has id (number), name (string), and price (number)', async () => {
    const res = await request(app).get('/api/products');

    res.body.forEach((product) => {
      expect(typeof product.id).toBe('number');
      expect(typeof product.name).toBe('string');
      expect(typeof product.price).toBe('number');
    });
  });

  it('product ids are unique', async () => {
    const res = await request(app).get('/api/products');

    const ids = res.body.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all prices are positive numbers', async () => {
    const res = await request(app).get('/api/products');

    res.body.forEach((product) => {
      expect(product.price).toBeGreaterThan(0);
    });
  });
});
