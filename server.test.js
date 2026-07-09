const request = require('supertest');
const { app, links } = require('./server');

// Clear links before each test
beforeEach(() => {
  links.clear();
});

describe('POST /api/shorten', () => {
  it('should create a shortened link with auto-generated code', async () => {
    const response = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com' })
      .expect(201);

    expect(response.body).toHaveProperty('shortCode');
    expect(response.body.shortCode).toHaveLength(6);
    expect(response.body.originalUrl).toBe('https://example.com');
    expect(response.body).toHaveProperty('shortUrl');
    expect(response.body).toHaveProperty('createdAt');
  });

  it('should create a shortened link with custom alias', async () => {
    const response = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'mylink' })
      .expect(201);

    expect(response.body.shortCode).toBe('mylink');
    expect(response.body.originalUrl).toBe('https://example.com');
  });

  it('should return 400 for missing URL', async () => {
    const response = await request(app)
      .post('/api/shorten')
      .send({})
      .expect(400);

    expect(response.body.error).toBe('URL is required');
  });

  it('should return 400 for invalid URL format', async () => {
    const response = await request(app)
      .post('/api/shorten')
      .send({ url: 'not-a-valid-url' })
      .expect(400);

    expect(response.body.error).toBe('Invalid URL format');
  });

  it('should return 400 for URL without http/https protocol', async () => {
    const response = await request(app)
      .post('/api/shorten')
      .send({ url: 'ftp://example.com' })
      .expect(400);

    expect(response.body.error).toBe('Invalid URL format');
  });

  it('should return 409 if custom alias already exists', async () => {
    // Create first link
    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'mylink' })
      .expect(201);

    // Try to create another with same alias
    const response = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://another.com', customAlias: 'mylink' })
      .expect(409);

    expect(response.body.error).toBe('Custom alias already taken');
  });

  it('should accept URLs with different protocols', async () => {
    const httpResponse = await request(app)
      .post('/api/shorten')
      .send({ url: 'http://example.com' })
      .expect(201);

    expect(httpResponse.body.originalUrl).toBe('http://example.com');

    const httpsResponse = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com' })
      .expect(201);

    expect(httpsResponse.body.originalUrl).toBe('https://example.com');
  });
});

describe('GET /:shortCode', () => {
  it('should redirect to original URL', async () => {
    // Create a link first
    const createResponse = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'test123' });

    // Access the short link
    const response = await request(app)
      .get('/test123')
      .expect(302);

    expect(response.headers.location).toBe('https://example.com');
  });

  it('should increment click count on redirect', async () => {
    // Create a link
    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'test456' });

    // Click it twice
    await request(app).get('/test456').expect(302);
    await request(app).get('/test456').expect(302);

    // Check click count
    const linksResponse = await request(app).get('/api/links');
    const link = linksResponse.body.find(l => l.shortCode === 'test456');
    expect(link.clickCount).toBe(2);
  });

  it('should return 404 for non-existent short code', async () => {
    const response = await request(app)
      .get('/nonexistent')
      .expect(404);

    expect(response.text).toBe('Short code not found');
  });
});

describe('GET /api/links', () => {
  it('should return empty array when no links exist', async () => {
    const response = await request(app)
      .get('/api/links')
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it('should return all links', async () => {
    // Create multiple links
    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example1.com', customAlias: 'link1' });

    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example2.com', customAlias: 'link2' });

    const response = await request(app)
      .get('/api/links')
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty('shortCode');
    expect(response.body[0]).toHaveProperty('originalUrl');
    expect(response.body[0]).toHaveProperty('createdAt');
    expect(response.body[0]).toHaveProperty('clickCount');
  });

  it('should return links sorted by click count descending', async () => {
    // Create links
    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example1.com', customAlias: 'link1' });

    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example2.com', customAlias: 'link2' });

    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example3.com', customAlias: 'link3' });

    // Click link2 three times, link3 once
    await request(app).get('/link2');
    await request(app).get('/link2');
    await request(app).get('/link2');
    await request(app).get('/link3');

    const response = await request(app).get('/api/links');

    expect(response.body[0].shortCode).toBe('link2');
    expect(response.body[0].clickCount).toBe(3);
    expect(response.body[1].shortCode).toBe('link3');
    expect(response.body[1].clickCount).toBe(1);
    expect(response.body[2].shortCode).toBe('link1');
    expect(response.body[2].clickCount).toBe(0);
  });
});

describe('DELETE /api/links/:shortCode', () => {
  it('should delete a link', async () => {
    // Create a link
    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'deleteMe' });

    // Delete it
    await request(app)
      .delete('/api/links/deleteMe')
      .expect(204);

    // Verify it's gone
    const response = await request(app).get('/api/links');
    expect(response.body).toHaveLength(0);
  });

  it('should return 404 when deleting non-existent link', async () => {
    const response = await request(app)
      .delete('/api/links/nonexistent')
      .expect(404);

    expect(response.body.error).toBe('Short code not found');
  });

  it('should not affect other links when deleting one', async () => {
    // Create multiple links
    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example1.com', customAlias: 'link1' });

    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example2.com', customAlias: 'link2' });

    // Delete one
    await request(app).delete('/api/links/link1').expect(204);

    // Check remaining links
    const response = await request(app).get('/api/links');
    expect(response.body).toHaveLength(1);
    expect(response.body[0].shortCode).toBe('link2');
  });
});

describe('Edge cases', () => {
  it('should handle URLs with query parameters', async () => {
    const response = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com/page?param1=value1&param2=value2' })
      .expect(201);

    expect(response.body.originalUrl).toBe('https://example.com/page?param1=value1&param2=value2');
  });

  it('should handle URLs with fragments', async () => {
    const response = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com/page#section' })
      .expect(201);

    expect(response.body.originalUrl).toBe('https://example.com/page#section');
  });

  it('should handle very long URLs', async () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(1000);
    const response = await request(app)
      .post('/api/shorten')
      .send({ url: longUrl })
      .expect(201);

    expect(response.body.originalUrl).toBe(longUrl);
  });
});
