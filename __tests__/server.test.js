const request = require('supertest');
const app = require('../server');

describe('URL Shortener API', () => {
  // Clear the in-memory store before each test
  beforeEach(() => {
    if (app._clearStore) {
      app._clearStore();
    }
  });

  describe('POST /api/shorten', () => {
    test('should create a shortened URL with auto-generated code', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' })
        .expect(201);

      expect(response.body).toHaveProperty('shortCode');
      expect(response.body).toHaveProperty('originalUrl', 'https://example.com');
      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body.shortCode).toHaveLength(6);
      expect(response.body.shortUrl).toContain(response.body.shortCode);
    });

    test('should create a shortened URL with custom alias', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({
          url: 'https://example.com',
          customAlias: 'my-link'
        })
        .expect(201);

      expect(response.body.shortCode).toBe('my-link');
      expect(response.body.originalUrl).toBe('https://example.com');
    });

    test('should return 400 if URL is missing', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'URL is required');
    });

    test('should return 400 for invalid URL format', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'not-a-valid-url' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });

    test('should return 400 for URL without protocol', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });

    test('should return 400 for URL with invalid protocol', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'ftp://example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });

    test('should return 409 if custom alias already exists', async () => {
      // Create first link
      await request(app)
        .post('/api/shorten')
        .send({
          url: 'https://example.com',
          customAlias: 'duplicate'
        })
        .expect(201);

      // Try to create with same alias
      const response = await request(app)
        .post('/api/shorten')
        .send({
          url: 'https://another-example.com',
          customAlias: 'duplicate'
        })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Custom alias already taken');
    });

    test('should accept http and https URLs', async () => {
      const httpResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'http://example.com' })
        .expect(201);

      const httpsResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' })
        .expect(201);

      expect(httpResponse.body.originalUrl).toBe('http://example.com');
      expect(httpsResponse.body.originalUrl).toBe('https://example.com');
    });
  });

  describe('GET /:shortCode', () => {
    test('should redirect to original URL', async () => {
      // Create a link
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' });

      const shortCode = createResponse.body.shortCode;

      // Test redirect
      const response = await request(app)
        .get(`/${shortCode}`)
        .expect(302);

      expect(response.headers.location).toBe('https://example.com');
    });

    test('should increment click count on redirect', async () => {
      // Create a link
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' });

      const shortCode = createResponse.body.shortCode;

      // Click the link twice
      await request(app).get(`/${shortCode}`).expect(302);
      await request(app).get(`/${shortCode}`).expect(302);

      // Check click count
      const linksResponse = await request(app).get('/api/links');
      const link = linksResponse.body.find(l => l.shortCode === shortCode);

      expect(link.clickCount).toBe(2);
    });

    test('should return 404 for non-existent short code', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.text).toContain('Short code not found');
    });

    test('should not interfere with API routes', async () => {
      await request(app)
        .get('/api/something')
        .expect(404);
    });
  });

  describe('GET /api/links', () => {
    test('should return empty array when no links exist', async () => {
      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should return all links with stats', async () => {
      // Create multiple links
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example1.com' });

      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example2.com' });

      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(response.body).toHaveLength(2);
      response.body.forEach(link => {
        expect(link).toHaveProperty('shortCode');
        expect(link).toHaveProperty('originalUrl');
        expect(link).toHaveProperty('createdAt');
        expect(link).toHaveProperty('clickCount');
      });
    });

    test('should return links sorted by click count descending', async () => {
      // Create three links
      const link1 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example1.com' });

      const link2 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example2.com' });

      const link3 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example3.com' });

      // Click link2 three times
      await request(app).get(`/${link2.body.shortCode}`);
      await request(app).get(`/${link2.body.shortCode}`);
      await request(app).get(`/${link2.body.shortCode}`);

      // Click link3 once
      await request(app).get(`/${link3.body.shortCode}`);

      // Get all links
      const response = await request(app).get('/api/links');

      expect(response.body[0].shortCode).toBe(link2.body.shortCode);
      expect(response.body[0].clickCount).toBe(3);
      expect(response.body[1].shortCode).toBe(link3.body.shortCode);
      expect(response.body[1].clickCount).toBe(1);
      expect(response.body[2].shortCode).toBe(link1.body.shortCode);
      expect(response.body[2].clickCount).toBe(0);
    });
  });

  describe('DELETE /api/links/:shortCode', () => {
    test('should delete an existing link', async () => {
      // Create a link
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' });

      const shortCode = createResponse.body.shortCode;

      // Delete the link
      await request(app)
        .delete(`/api/links/${shortCode}`)
        .expect(204);

      // Verify it's deleted
      const linksResponse = await request(app).get('/api/links');
      const link = linksResponse.body.find(l => l.shortCode === shortCode);

      expect(link).toBeUndefined();
    });

    test('should return 404 when deleting non-existent link', async () => {
      const response = await request(app)
        .delete('/api/links/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Short code not found');
    });

    test('should prevent access to deleted link', async () => {
      // Create a link
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' });

      const shortCode = createResponse.body.shortCode;

      // Delete the link
      await request(app).delete(`/api/links/${shortCode}`).expect(204);

      // Try to access it
      await request(app).get(`/${shortCode}`).expect(404);
    });
  });

  describe('Integration Tests', () => {
    test('complete workflow: create, click, view stats, delete', async () => {
      // Create a link
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({
          url: 'https://example.com/very/long/url',
          customAlias: 'test-link'
        })
        .expect(201);

      expect(createResponse.body.shortCode).toBe('test-link');

      // Click the link
      await request(app).get('/test-link').expect(302);
      await request(app).get('/test-link').expect(302);

      // View stats
      const statsResponse = await request(app).get('/api/links').expect(200);
      const link = statsResponse.body.find(l => l.shortCode === 'test-link');

      expect(link.clickCount).toBe(2);
      expect(link.originalUrl).toBe('https://example.com/very/long/url');

      // Delete the link
      await request(app).delete('/api/links/test-link').expect(204);

      // Verify deletion
      const finalStats = await request(app).get('/api/links').expect(200);
      const deletedLink = finalStats.body.find(l => l.shortCode === 'test-link');

      expect(deletedLink).toBeUndefined();
    });
  });
});
