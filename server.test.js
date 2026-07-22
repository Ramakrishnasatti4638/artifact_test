'use strict';

const request = require('supertest');
const createApp = require('./server');
const { isValidUrl, isValidAlias, generateShortCode } = require('./utils');

describe('utils', () => {
  test('isValidUrl accepts http and https URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('https://example.com/path?q=1')).toBe(true);
  });

  test('isValidUrl rejects invalid or non-http URLs', () => {
    expect(isValidUrl('not a url')).toBe(false);
    expect(isValidUrl('ftp://example.com')).toBe(false);
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl(null)).toBe(false);
  });

  test('isValidAlias enforces allowed characters', () => {
    expect(isValidAlias('my-link_1')).toBe(true);
    expect(isValidAlias('bad alias')).toBe(false);
    expect(isValidAlias('bad/alias')).toBe(false);
    expect(isValidAlias('')).toBe(false);
  });

  test('generateShortCode returns a 6-char alphanumeric code', () => {
    const code = generateShortCode();
    expect(code).toHaveLength(6);
    expect(code).toMatch(/^[A-Za-z0-9]{6}$/);
  });
});

describe('URL shortener API', () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  describe('POST /api/shorten', () => {
    test('creates a short link with a random code', async () => {
      const res = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/long/path' });

      expect(res.status).toBe(201);
      expect(res.body.originalUrl).toBe('https://example.com/long/path');
      expect(res.body.shortCode).toMatch(/^[A-Za-z0-9]{6}$/);
      expect(res.body.clickCount).toBe(0);
      expect(res.body.createdAt).toBeDefined();
      expect(res.body.shortUrl).toContain(res.body.shortCode);
    });

    test('honors a custom alias', async () => {
      const res = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com', customAlias: 'my-alias' });

      expect(res.status).toBe(201);
      expect(res.body.shortCode).toBe('my-alias');
    });

    test('returns 400 when url is missing', async () => {
      const res = await request(app).post('/api/shorten').send({});
      expect(res.status).toBe(400);
    });

    test('returns 400 for an invalid url', async () => {
      const res = await request(app)
        .post('/api/shorten')
        .send({ url: 'not-a-valid-url' });
      expect(res.status).toBe(400);
    });

    test('returns 400 for a non-http protocol', async () => {
      const res = await request(app)
        .post('/api/shorten')
        .send({ url: 'ftp://example.com' });
      expect(res.status).toBe(400);
    });

    test('returns 400 for an invalid custom alias', async () => {
      const res = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com', customAlias: 'bad alias!' });
      expect(res.status).toBe(400);
    });

    test('returns 409 when alias is already taken', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com', customAlias: 'taken' });

      const res = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://another.com', customAlias: 'taken' });

      expect(res.status).toBe(409);
    });
  });

  describe('GET /:shortCode', () => {
    test('redirects (302) and increments click count', async () => {
      const created = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com', customAlias: 'go' });

      const redirect = await request(app).get('/go');
      expect(redirect.status).toBe(302);
      expect(redirect.headers.location).toBe('https://example.com');

      const links = await request(app).get('/api/links');
      const link = links.body.find((l) => l.shortCode === 'go');
      expect(link.clickCount).toBe(1);
      expect(created.body.shortCode).toBe('go');
    });

    test('returns 404 for an unknown code', async () => {
      const res = await request(app).get('/does-not-exist');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/links', () => {
    test('returns links sorted by click count descending', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://a.com', customAlias: 'a' });
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://b.com', customAlias: 'b' });

      // Give "b" two clicks, "a" none.
      await request(app).get('/b');
      await request(app).get('/b');

      const res = await request(app).get('/api/links');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].shortCode).toBe('b');
      expect(res.body[0].clickCount).toBe(2);
      expect(res.body[1].shortCode).toBe('a');
    });
  });

  describe('DELETE /api/links/:shortCode', () => {
    test('deletes an existing link', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com', customAlias: 'del' });

      const del = await request(app).delete('/api/links/del');
      expect(del.status).toBe(204);

      const res = await request(app).get('/api/links');
      expect(res.body).toHaveLength(0);
    });

    test('returns 404 when deleting an unknown code', async () => {
      const res = await request(app).delete('/api/links/nope');
      expect(res.status).toBe(404);
    });
  });

  test('supports a full create -> redirect -> stats -> delete workflow', async () => {
    const created = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://workflow.com' });
    const { shortCode } = created.body;

    await request(app).get(`/${shortCode}`);
    await request(app).get(`/${shortCode}`);

    const links = await request(app).get('/api/links');
    expect(links.body[0].clickCount).toBe(2);

    await request(app).delete(`/api/links/${shortCode}`);
    const after = await request(app).get('/api/links');
    expect(after.body).toHaveLength(0);
  });
});
