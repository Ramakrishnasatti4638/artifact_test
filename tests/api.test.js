const request = require('supertest');
const app = require('../src/app');
const store = require('../src/store');

beforeEach(() => {
  store.clear();
});

// ─── POST /api/shorten ───────────────────────────────────────────────────────

describe('POST /api/shorten', () => {
  test('returns 201 with entry for a valid URL', async () => {
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

  test('generates a 6-character alphanumeric shortCode', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com' });

    expect(res.body.shortCode).toMatch(/^[A-Za-z0-9]{6}$/);
  });

  test('accepts a valid customAlias', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'myalias' });

    expect(res.status).toBe(201);
    expect(res.body.shortCode).toBe('myalias');
  });

  test('returns 400 for a missing URL', async () => {
    const res = await request(app).post('/api/shorten').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('returns 400 for an invalid URL (no protocol)', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'not-a-url' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('returns 400 for a non-http/https URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'ftp://example.com' });
    expect(res.status).toBe(400);
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

  test('returns 400 for an invalid customAlias (special chars)', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'bad alias!' });
    expect(res.status).toBe(400);
  });
});

// ─── GET /:shortCode ─────────────────────────────────────────────────────────

describe('GET /:shortCode', () => {
  test('redirects (302) to the original URL', async () => {
    const { body } = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com' });

    const res = await request(app).get(`/${body.shortCode}`);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('https://example.com');
  });

  test('increments clickCount on each visit', async () => {
    const { body } = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com' });

    await request(app).get(`/${body.shortCode}`);
    await request(app).get(`/${body.shortCode}`);
    await request(app).get(`/${body.shortCode}`);

    const links = await request(app).get('/api/links');
    const entry = links.body.find(l => l.shortCode === body.shortCode);
    expect(entry.clickCount).toBe(3);
  });

  test('returns 404 for an unknown shortCode', async () => {
    const res = await request(app).get('/doesnotexist');
    expect(res.status).toBe(404);
  });
});

// ─── GET /api/links ──────────────────────────────────────────────────────────

describe('GET /api/links', () => {
  test('returns an empty array when no links exist', async () => {
    const res = await request(app).get('/api/links');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns all created links', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://a.com' });
    await request(app).post('/api/shorten').send({ url: 'https://b.com' });

    const res = await request(app).get('/api/links');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('sorts links by clickCount descending', async () => {
    const r1 = await request(app).post('/api/shorten').send({ url: 'https://a.com', customAlias: 'aaa' });
    const r2 = await request(app).post('/api/shorten').send({ url: 'https://b.com', customAlias: 'bbb' });

    // Give 'bbb' 3 clicks, 'aaa' 1 click
    await request(app).get('/bbb');
    await request(app).get('/bbb');
    await request(app).get('/bbb');
    await request(app).get('/aaa');

    const res = await request(app).get('/api/links');
    expect(res.body[0].shortCode).toBe('bbb');
    expect(res.body[1].shortCode).toBe('aaa');
  });

  test('each link has the expected shape', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://example.com' });
    const res = await request(app).get('/api/links');
    const link = res.body[0];
    expect(link).toHaveProperty('shortCode');
    expect(link).toHaveProperty('originalUrl');
    expect(link).toHaveProperty('createdAt');
    expect(link).toHaveProperty('clickCount');
  });
});

// ─── DELETE /api/links/:shortCode ────────────────────────────────────────────

describe('DELETE /api/links/:shortCode', () => {
  test('deletes a link and returns 200', async () => {
    const { body } = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'todel' });

    const del = await request(app).delete(`/api/links/${body.shortCode}`);
    expect(del.status).toBe(200);

    const links = await request(app).get('/api/links');
    expect(links.body.find(l => l.shortCode === 'todel')).toBeUndefined();
  });

  test('returns 404 when deleting a non-existent shortCode', async () => {
    const res = await request(app).delete('/api/links/ghost');
    expect(res.status).toBe(404);
  });

  test('deleted link is no longer redirectable', async () => {
    const { body } = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'gone' });

    await request(app).delete(`/api/links/${body.shortCode}`);
    const res = await request(app).get('/gone');
    expect(res.status).toBe(404);
  });
});
