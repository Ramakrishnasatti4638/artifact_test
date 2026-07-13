'use strict';

const request = require('supertest');
const app     = require('../src/app');
const store   = require('../src/store');

beforeEach(() => store.clear());

// ────────────────────────────────────────────────────────────────────────────
// POST /api/shorten
// ────────────────────────────────────────────────────────────────────────────
describe('POST /api/shorten', () => {
  test('returns 201 with a valid URL and generates a 6-char shortCode', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      originalUrl: 'https://example.com',
      clickCount: 0,
    });
    expect(res.body.shortCode).toHaveLength(6);
    expect(res.body.createdAt).toBeDefined();
  });

  test('accepts a valid customAlias', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'my-link' });

    expect(res.status).toBe(201);
    expect(res.body.shortCode).toBe('my-link');
  });

  test('returns 409 when customAlias is already taken', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://a.com', customAlias: 'taken' });
    const res = await request(app).post('/api/shorten').send({ url: 'https://b.com', customAlias: 'taken' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already taken/i);
  });

  test('returns 400 for a missing URL', async () => {
    const res = await request(app).post('/api/shorten').send({});
    expect(res.status).toBe(400);
  });

  test('returns 400 for a non-http URL (ftp)', async () => {
    const res = await request(app).post('/api/shorten').send({ url: 'ftp://files.example.com' });
    expect(res.status).toBe(400);
  });

  test('returns 400 for a plain string that is not a URL', async () => {
    const res = await request(app).post('/api/shorten').send({ url: 'not-a-url' });
    expect(res.status).toBe(400);
  });

  test('returns 400 when customAlias contains invalid characters', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'bad alias!' });
    expect(res.status).toBe(400);
  });

  test('returns 400 when customAlias is too short (< 2 chars)', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'x' });
    expect(res.status).toBe(400);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// GET /:shortCode  (redirect)
// ────────────────────────────────────────────────────────────────────────────
describe('GET /:shortCode', () => {
  test('redirects (302) to the original URL', async () => {
    const create = await request(app).post('/api/shorten').send({ url: 'https://redirect.example.com' });
    const { shortCode } = create.body;

    const res = await request(app).get(`/${shortCode}`);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('https://redirect.example.com');
  });

  test('increments clickCount on each redirect', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://click.example.com', customAlias: 'clickme' });

    await request(app).get('/clickme');
    await request(app).get('/clickme');

    const links = await request(app).get('/api/links');
    const link  = links.body.find(l => l.shortCode === 'clickme');
    expect(link.clickCount).toBe(2);
  });

  test('returns 404 for an unknown shortCode', async () => {
    const res = await request(app).get('/doesNotExist99');
    expect(res.status).toBe(404);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// GET /api/links
// ────────────────────────────────────────────────────────────────────────────
describe('GET /api/links', () => {
  test('returns empty array when there are no links', async () => {
    const res = await request(app).get('/api/links');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns all created links', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://a.com', customAlias: 'aa' });
    await request(app).post('/api/shorten').send({ url: 'https://b.com', customAlias: 'bb' });

    const res = await request(app).get('/api/links');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('sorts by clickCount descending', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://low.com',  customAlias: 'low'  });
    await request(app).post('/api/shorten').send({ url: 'https://high.com', customAlias: 'high' });

    // Give 'high' 3 clicks
    await request(app).get('/high');
    await request(app).get('/high');
    await request(app).get('/high');

    const res = await request(app).get('/api/links');
    expect(res.body[0].shortCode).toBe('high');
    expect(res.body[0].clickCount).toBe(3);
    expect(res.body[1].shortCode).toBe('low');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// DELETE /api/links/:shortCode
// ────────────────────────────────────────────────────────────────────────────
describe('DELETE /api/links/:shortCode', () => {
  test('returns 204 and removes the link', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://delete.me', customAlias: 'del1' });

    const del = await request(app).delete('/api/links/del1');
    expect(del.status).toBe(204);

    const links = await request(app).get('/api/links');
    expect(links.body.find(l => l.shortCode === 'del1')).toBeUndefined();
  });

  test('returns 404 when shortCode does not exist', async () => {
    const res = await request(app).delete('/api/links/nonexistent');
    expect(res.status).toBe(404);
  });

  test('deleted link now returns 404 on redirect', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://gone.com', customAlias: 'gone' });
    await request(app).delete('/api/links/gone');

    const res = await request(app).get('/gone');
    expect(res.status).toBe(404);
  });
});
