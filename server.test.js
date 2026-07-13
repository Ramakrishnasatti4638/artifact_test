const request = require('supertest');

// Re-import a fresh app for each test file (store is module-level)
let app, store;

beforeEach(() => {
  // Clear module cache so each test file gets a fresh in-memory store
  jest.resetModules();
  ({ app, store } = require('./server'));
});

describe('POST /api/shorten', () => {
  test('shortens a valid URL and returns 201 with entry', async () => {
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

  test('uses customAlias when provided', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'mylink' });

    expect(res.status).toBe(201);
    expect(res.body.shortCode).toBe('mylink');
  });

  test('returns 409 when customAlias is already taken', async () => {
    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'taken' });

    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://other.com', customAlias: 'taken' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/taken/i);
  });

  test('returns 400 for missing URL', async () => {
    const res = await request(app).post('/api/shorten').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('returns 400 for invalid URL (no protocol)', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'not-a-url' });
    expect(res.status).toBe(400);
  });

  test('returns 400 for ftp:// URL (only http/https allowed)', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'ftp://example.com/file' });
    expect(res.status).toBe(400);
  });

  test('returns 400 for customAlias with invalid characters', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'bad alias!' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('generated short codes are 6 alphanumeric characters', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com/page' });
    expect(res.body.shortCode).toMatch(/^[A-Za-z0-9]{6}$/);
  });
});

describe('GET /:shortCode', () => {
  test('redirects to original URL with 302 and increments clickCount', async () => {
    const createRes = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'redir' });

    expect(createRes.status).toBe(201);

    const redirectRes = await request(app)
      .get('/redir')
      .redirects(0);

    expect(redirectRes.status).toBe(302);
    expect(redirectRes.headers.location).toBe('https://example.com');

    // Verify clickCount was incremented via the store directly
    expect(store.get('redir').clickCount).toBe(1);
  });

  test('increments clickCount on each visit', async () => {
    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'multi' });

    await request(app).get('/multi').redirects(0);
    await request(app).get('/multi').redirects(0);
    await request(app).get('/multi').redirects(0);

    expect(store.get('multi').clickCount).toBe(3);
  });

  test('returns 404 for unknown shortCode', async () => {
    const res = await request(app).get('/doesnotexist').redirects(0);
    expect(res.status).toBe(404);
  });
});

describe('GET /api/links', () => {
  test('returns empty array initially', async () => {
    const res = await request(app).get('/api/links');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns all created links', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://a.com', customAlias: 'aaa' });
    await request(app).post('/api/shorten').send({ url: 'https://b.com', customAlias: 'bbb' });

    const res = await request(app).get('/api/links');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('sorts links by clickCount descending', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://a.com', customAlias: 'low' });
    await request(app).post('/api/shorten').send({ url: 'https://b.com', customAlias: 'high' });

    // Give 'high' 3 clicks, 'low' 1 click
    await request(app).get('/high').redirects(0);
    await request(app).get('/high').redirects(0);
    await request(app).get('/high').redirects(0);
    await request(app).get('/low').redirects(0);

    const res = await request(app).get('/api/links');
    expect(res.body[0].shortCode).toBe('high');
    expect(res.body[1].shortCode).toBe('low');
  });

  test('each link has the expected fields', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://example.com', customAlias: 'chk' });
    const res = await request(app).get('/api/links');
    const link = res.body[0];
    expect(link).toHaveProperty('shortCode', 'chk');
    expect(link).toHaveProperty('originalUrl', 'https://example.com');
    expect(link).toHaveProperty('clickCount', 0);
    expect(link).toHaveProperty('createdAt');
  });
});

describe('DELETE /api/links/:shortCode', () => {
  test('deletes an existing link and returns 200', async () => {
    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'del' });

    const res = await request(app).delete('/api/links/del');
    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();

    // Link should be gone
    const list = await request(app).get('/api/links');
    expect(list.body.find(l => l.shortCode === 'del')).toBeUndefined();
  });

  test('returns 404 for a non-existent short code', async () => {
    const res = await request(app).delete('/api/links/phantom');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  test('redirect returns 404 after deletion', async () => {
    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'gone' });

    await request(app).delete('/api/links/gone');

    const res = await request(app).get('/gone').redirects(0);
    expect(res.status).toBe(404);
  });
});
