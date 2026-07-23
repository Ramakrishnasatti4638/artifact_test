const request = require('supertest');
const { app, store } = require('./app');

// Reset in-memory store before each test
beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
});

describe('POST /api/shorten', () => {
  test('creates a short link and returns 201', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      originalUrl: 'https://example.com',
      shortCode: expect.any(String),
      shortUrl: expect.stringContaining('/'),
      createdAt: expect.any(String),
    });
  });

  test('uses a custom alias when provided', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'my-link' });

    expect(res.status).toBe(201);
    expect(res.body.shortCode).toBe('my-link');
  });

  test('returns 400 when url is missing', async () => {
    const res = await request(app).post('/api/shorten').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('url is required');
  });

  test('returns 400 for an invalid URL format', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'not-a-url' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid URL format');
  });

  test('returns 409 when custom alias is already taken', async () => {
    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'taken' });

    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://other.com', customAlias: 'taken' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Alias already taken');
  });
});

describe('GET /api/links', () => {
  test('returns empty array when no links exist', async () => {
    const res = await request(app).get('/api/links');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns all links', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://a.com', customAlias: 'a' });
    await request(app).post('/api/shorten').send({ url: 'https://b.com', customAlias: 'b' });

    const res = await request(app).get('/api/links');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('sorts links by click count descending', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://a.com', customAlias: 'low' });
    await request(app).post('/api/shorten').send({ url: 'https://b.com', customAlias: 'high' });

    // Give 'high' 2 clicks
    await request(app).get('/high');
    await request(app).get('/high');
    // Give 'low' 1 click
    await request(app).get('/low');

    const res = await request(app).get('/api/links');
    expect(res.body[0].shortCode).toBe('high');
    expect(res.body[0].clickCount).toBe(2);
  });
});

describe('DELETE /api/links/:shortCode', () => {
  test('deletes an existing link and returns 200', async () => {
    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'del-me' });

    const res = await request(app).delete('/api/links/del-me');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Deleted successfully');
  });

  test('returns 404 for a non-existent short code', async () => {
    const res = await request(app).delete('/api/links/ghost');
    expect(res.status).toBe(404);
  });

  test('link is no longer returned after deletion', async () => {
    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'gone' });
    await request(app).delete('/api/links/gone');

    const res = await request(app).get('/api/links');
    expect(res.body.find((l) => l.shortCode === 'gone')).toBeUndefined();
  });
});

describe('GET /:shortCode (redirect)', () => {
  test('redirects to the original URL (302)', async () => {
    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'go' });

    const res = await request(app).get('/go').redirects(0);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('https://example.com');
  });

  test('increments click count on each redirect', async () => {
    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'click-me' });

    await request(app).get('/click-me').redirects(0);
    await request(app).get('/click-me').redirects(0);

    const res = await request(app).get('/api/links');
    const link = res.body.find((l) => l.shortCode === 'click-me');
    expect(link.clickCount).toBe(2);
  });

  test('returns 404 for an unknown short code', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
  });
});
