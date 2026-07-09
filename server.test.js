const request = require('supertest');
const app     = require('./server');
const links   = require('./store');

// Wipe the in-memory store before every test so tests are fully independent
beforeEach(() => links.clear());

// ── POST /api/shorten ────────────────────────────────────────────────────────

describe('POST /api/shorten', () => {
  it('creates a short link and returns 201 with the entry', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      originalUrl: 'https://example.com',
      clickCount:  0,
    });
    expect(res.body.shortCode).toMatch(/^[A-Za-z0-9]{6}$/);
    expect(typeof res.body.createdAt).toBe('string');
  });

  it('accepts a customAlias', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'my-link' });

    expect(res.status).toBe(201);
    expect(res.body.shortCode).toBe('my-link');
  });

  it('returns 409 when customAlias is already taken', async () => {
    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'dup' });

    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://other.com', customAlias: 'dup' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already taken/i);
  });

  it('returns 400 for a missing URL', async () => {
    const res = await request(app).post('/api/shorten').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 for a non-URL string', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'not-a-url' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for a URL without http/https protocol', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'ftp://files.example.com' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for an invalid customAlias (special chars)', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'bad alias!' });
    expect(res.status).toBe(400);
  });
});

// ── GET /:shortCode (redirect) ───────────────────────────────────────────────

describe('GET /:shortCode', () => {
  it('redirects (302) to the original URL and increments clickCount', async () => {
    const create = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'redir' });

    const res = await request(app).get('/redir');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('https://example.com');

    // Verify clickCount was incremented in the store
    expect(links.get('redir').clickCount).toBe(1);
  });

  it('increments clickCount on each visit', async () => {
    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'multi' });

    await request(app).get('/multi');
    await request(app).get('/multi');
    await request(app).get('/multi');

    expect(links.get('multi').clickCount).toBe(3);
  });

  it('returns 404 for an unknown short code', async () => {
    const res = await request(app).get('/doesnotexist');
    expect(res.status).toBe(404);
  });
});

// ── GET /api/links ───────────────────────────────────────────────────────────

describe('GET /api/links', () => {
  it('returns an empty array when no links exist', async () => {
    const res = await request(app).get('/api/links');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all links', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://a.com', customAlias: 'aaa' });
    await request(app).post('/api/shorten').send({ url: 'https://b.com', customAlias: 'bbb' });

    const res = await request(app).get('/api/links');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('sorts links by clickCount descending', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://a.com', customAlias: 'low' });
    await request(app).post('/api/shorten').send({ url: 'https://b.com', customAlias: 'high' });

    // Give 'high' three clicks
    await request(app).get('/high');
    await request(app).get('/high');
    await request(app).get('/high');

    const res = await request(app).get('/api/links');
    expect(res.body[0].shortCode).toBe('high');
    expect(res.body[1].shortCode).toBe('low');
  });

  it('includes all required fields per link', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://example.com' });
    const res = await request(app).get('/api/links');
    const [link] = res.body;
    expect(link).toHaveProperty('shortCode');
    expect(link).toHaveProperty('originalUrl');
    expect(link).toHaveProperty('createdAt');
    expect(link).toHaveProperty('clickCount');
  });
});

// ── DELETE /api/links/:shortCode ─────────────────────────────────────────────

describe('DELETE /api/links/:shortCode', () => {
  it('deletes an existing link and returns 200', async () => {
    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'del-me' });

    const res = await request(app).delete('/api/links/del-me');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
    expect(links.has('del-me')).toBe(false);
  });

  it('returns 404 when deleting a non-existent code', async () => {
    const res = await request(app).delete('/api/links/ghost');
    expect(res.status).toBe(404);
  });

  it('makes the redirect return 404 after deletion', async () => {
    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'gone' });

    await request(app).delete('/api/links/gone');

    const res = await request(app).get('/gone');
    expect(res.status).toBe(404);
  });
});
