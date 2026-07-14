const request = require('supertest');
const app = require('../src/app');

describe('URL Shortener API', () => {
  beforeEach(() => {
    app.locals.links.clear();
  });

  const testUrl = 'https://example.com';
  const testUrl2 = 'https://example.org';

  it('POST /api/shorten creates a short link for a valid URL', async () => {
    const res = await request(app).post('/api/shorten').send({ url: testUrl });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('shortCode');
    expect(res.body).toHaveProperty('shortUrl');
    expect(res.body.originalUrl).toBe(testUrl);
    expect(res.body.shortCode).toHaveLength(6);
  });

  it('POST /api/shorten rejects an invalid URL', async () => {
    const res = await request(app).post('/api/shorten').send({ url: 'not-a-url' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('POST /api/shorten uses customAlias when provided', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: testUrl, customAlias: 'myalias' });
    expect(res.statusCode).toBe(201);
    expect(res.body.shortCode).toBe('myalias');
  });

  it('POST /api/shorten returns 409 for duplicate customAlias', async () => {
    await request(app).post('/api/shorten').send({ url: testUrl, customAlias: 'dupalias' });
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: testUrl2, customAlias: 'dupalias' });
    expect(res.statusCode).toBe(409);
  });

  it('GET /:shortCode redirects to original URL and increments clickCount', async () => {
    const create = await request(app).post('/api/shorten').send({ url: testUrl });
    const shortCode = create.body.shortCode;

    const res = await request(app).get(`/${shortCode}`);
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe(testUrl);

    const links = await request(app).get('/api/links');
    const link = links.body.find((l) => l.shortCode === shortCode);
    expect(link.clickCount).toBe(1);
  });

  it('GET /:shortCode returns 404 for unknown code', async () => {
    const res = await request(app).get('/unknown');
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/links returns all links sorted by clickCount desc', async () => {
    await request(app).post('/api/shorten').send({ url: testUrl, customAlias: 'link1' });
    await request(app).post('/api/shorten').send({ url: testUrl2, customAlias: 'link2' });

    await request(app).get('/link1');
    await request(app).get('/link1');
    await request(app).get('/link2');

    const res = await request(app).get('/api/links');
    expect(res.statusCode).toBe(200);
    expect(res.body[0].shortCode).toBe('link1');
    expect(res.body[1].shortCode).toBe('link2');
  });

  it('DELETE /api/links/:shortCode removes a link', async () => {
    await request(app).post('/api/shorten').send({ url: testUrl, customAlias: 'delete-me' });

    const del = await request(app).delete('/api/links/delete-me');
    expect(del.statusCode).toBe(204);

    const get = await request(app).get('/delete-me');
    expect(get.statusCode).toBe(404);
  });

  it('DELETE /api/links/:shortCode returns 404 for unknown code', async () => {
    const res = await request(app).delete('/api/links/unknown');
    expect(res.statusCode).toBe(404);
  });
});
