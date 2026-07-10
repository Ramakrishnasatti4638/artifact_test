'use strict';

const request = require('supertest');
const { app, store } = require('./server');

// Clear the in-memory store before each test
beforeEach(() => store.clear());

// ── POST /api/shorten ─────────────────────────────────────────────────────────

describe('POST /api/shorten', () => {
  test('returns 201 and a record for a valid URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com' })
      .expect(201);

    expect(res.body).toMatchObject({
      originalUrl: 'https://example.com',
      clickCount: 0,
    });
    expect(res.body.shortCode).toHaveLength(6);
    expect(res.body.createdAt).toBeDefined();
  });

  test('generates a 6-character alphanumeric short code', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com' })
      .expect(201);

    expect(res.body.shortCode).toMatch(/^[A-Za-z0-9]{6}$/);
  });

  test('accepts a custom alias', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'mylink' })
      .expect(201);

    expect(res.body.shortCode).toBe('mylink');
  });

  test('returns 409 when custom alias is already taken', async () => {
    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'mylink' })
      .expect(201);

    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://other.com', customAlias: 'mylink' })
      .expect(409);

    expect(res.body.error).toMatch(/already taken/i);
  });

  test('returns 400 for a missing URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({})
      .expect(400);

    expect(res.body.error).toBeDefined();
  });

  test('returns 400 for an invalid URL (no protocol)', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'not-a-url' })
      .expect(400);

    expect(res.body.error).toBeDefined();
  });

  test('returns 400 for a ftp:// URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'ftp://files.example.com' })
      .expect(400);

    expect(res.body.error).toBeDefined();
  });

  test('returns 400 for an invalid custom alias (special chars)', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'bad alias!' })
      .expect(400);

    expect(res.body.error).toBeDefined();
  });
});

// ── GET /:shortCode ───────────────────────────────────────────────────────────

describe('GET /:shortCode', () => {
  test('redirects to the original URL (302)', async () => {
    const { body } = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com' });

    await request(app)
      .get(`/${body.shortCode}`)
      .expect(302)
      .expect('Location', 'https://example.com');
  });

  test('increments clickCount on each redirect', async () => {
    const { body } = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com' });

    // First click
    await request(app).get(`/${body.shortCode}`);
    // Second click
    await request(app).get(`/${body.shortCode}`);

    const links = await request(app).get('/api/links').expect(200);
    const link = links.body.find(l => l.shortCode === body.shortCode);
    expect(link.clickCount).toBe(2);
  });

  test('returns 404 for an unknown short code', async () => {
    const res = await request(app).get('/unknownXYZ').expect(404);
    expect(res.body.error).toBeDefined();
  });
});

// ── GET /api/links ────────────────────────────────────────────────────────────

describe('GET /api/links', () => {
  test('returns an empty array when no links exist', async () => {
    const res = await request(app).get('/api/links').expect(200);
    expect(res.body).toEqual([]);
  });

  test('returns all created links', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://a.com' });
    await request(app).post('/api/shorten').send({ url: 'https://b.com' });

    const res = await request(app).get('/api/links').expect(200);
    expect(res.body).toHaveLength(2);
  });

  test('sorts links by clickCount descending', async () => {
    const r1 = await request(app).post('/api/shorten').send({ url: 'https://low.com' });
    const r2 = await request(app).post('/api/shorten').send({ url: 'https://high.com' });

    // Give r2 two clicks
    await request(app).get(`/${r2.body.shortCode}`);
    await request(app).get(`/${r2.body.shortCode}`);
    // Give r1 one click
    await request(app).get(`/${r1.body.shortCode}`);

    const res = await request(app).get('/api/links').expect(200);
    expect(res.body[0].shortCode).toBe(r2.body.shortCode);
    expect(res.body[0].clickCount).toBe(2);
    expect(res.body[1].clickCount).toBe(1);
  });

  test('each link record has the expected shape', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://example.com' });

    const res = await request(app).get('/api/links').expect(200);
    const link = res.body[0];
    expect(link).toHaveProperty('shortCode');
    expect(link).toHaveProperty('originalUrl', 'https://example.com');
    expect(link).toHaveProperty('createdAt');
    expect(link).toHaveProperty('clickCount', 0);
  });
});

// ── DELETE /api/links/:shortCode ──────────────────────────────────────────────

describe('DELETE /api/links/:shortCode', () => {
  test('deletes an existing link and returns 204', async () => {
    const { body } = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com' });

    await request(app).delete(`/api/links/${body.shortCode}`).expect(204);

    const links = await request(app).get('/api/links');
    expect(links.body).toHaveLength(0);
  });

  test('returns 404 when deleting a non-existent short code', async () => {
    const res = await request(app).delete('/api/links/nope99').expect(404);
    expect(res.body.error).toBeDefined();
  });

  test('deleted link is no longer redirectable (404)', async () => {
    const { body } = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com' });

    await request(app).delete(`/api/links/${body.shortCode}`);
    await request(app).get(`/${body.shortCode}`).expect(404);
  });
});
