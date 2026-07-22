const request = require('supertest');
const app = require('../server');

describe('URL Shortener API', () => {
  // Clear the in-memory store before each test
  beforeEach(() => {
    // Access the links Map through a test endpoint or reset it
    // Since we can't directly access it, we'll work with fresh tests
  });

  describe('POST /api/shorten', () => {
    test('should create a shortened URL with random code', async () => {
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

    test('should return 400 for URL with invalid protocol', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'ftp://example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });

    test('should return 409 if custom alias is already taken', async () => {
      // First request - create link with custom alias
      await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com',
          customAlias: 'duplicate'
        })
        .expect(201);

      // Second request - try to use same alias
      const response = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://another-example.com',
          customAlias: 'duplicate'
        })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Custom alias already taken');
    });

    test('should accept both http and https URLs', async () => {
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

  describe('GET /api/links', () => {
    test('should return empty array when no links exist', async () => {
      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should return all created links', async () => {
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

      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(response.body[0]).toHaveProperty('shortCode');
      expect(response.body[0]).toHaveProperty('originalUrl');
      expect(response.body[0]).toHaveProperty('createdAt');
      expect(response.body[0]).toHaveProperty('clickCount');
    });

    test('should return links sorted by clickCount descending', async () => {
      // Create links
      const link1 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example1.com', customAlias: 'link1' });

      const link2 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example2.com', customAlias: 'link2' });

      // Click link2 twice
      await request(app).get('/link2');
      await request(app).get('/link2');

      // Click link1 once
      await request(app).get('/link1');

      const response = await request(app)
        .get('/api/links')
        .expect(200);

      // Find our test links
      const links = response.body.filter(l => l.shortCode === 'link1' || l.shortCode === 'link2');
      const link1Data = links.find(l => l.shortCode === 'link1');
      const link2Data = links.find(l => l.shortCode === 'link2');

      expect(link2Data.clickCount).toBe(2);
      expect(link1Data.clickCount).toBe(1);
      
      // Check if link2 comes before link1 in the sorted array
      const link1Index = response.body.findIndex(l => l.shortCode === 'link1');
      const link2Index = response.body.findIndex(l => l.shortCode === 'link2');
      expect(link2Index).toBeLessThan(link1Index);
    });
  });

  describe('DELETE /api/links/:shortCode', () => {
    test('should delete an existing link', async () => {
      // Create a link
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com', customAlias: 'to-delete' });

      // Delete the link
      await request(app)
        .delete('/api/links/to-delete')
        .expect(204);

      // Verify it's deleted by trying to access it
      await request(app)
        .get('/to-delete')
        .expect(404);
    });

    test('should return 404 for non-existent short code', async () => {
      const response = await request(app)
        .delete('/api/links/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Short code not found');
    });
  });

  describe('GET /:shortCode', () => {
    test('should redirect to original URL', async () => {
      // Create a link
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com', customAlias: 'redirect-test' });

      // Access the short link
      const response = await request(app)
        .get('/redirect-test')
        .expect(302);

      expect(response.headers.location).toBe('https://example.com');
    });

    test('should increment click count on each access', async () => {
      // Create a link
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com', customAlias: 'click-test' });

      // Access it 3 times
      await request(app).get('/click-test').expect(302);
      await request(app).get('/click-test').expect(302);
      await request(app).get('/click-test').expect(302);

      // Check click count
      const linksResponse = await request(app)
        .get('/api/links')
        .expect(200);

      const link = linksResponse.body.find(l => l.shortCode === 'click-test');
      expect(link.clickCount).toBe(3);
    });

    test('should return 404 for non-existent short code', async () => {
      await request(app)
        .get('/nonexistent')
        .expect(404);
    });

    test('should return 404 for API routes', async () => {
      await request(app)
        .get('/api/something')
        .expect(404);
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete workflow: create, access, check stats, delete', async () => {
      // Create a shortened URL
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://workflow-test.com', customAlias: 'workflow' })
        .expect(201);

      expect(createResponse.body.shortCode).toBe('workflow');

      // Access it twice
      await request(app).get('/workflow').expect(302);
      await request(app).get('/workflow').expect(302);

      // Check stats
      const statsResponse = await request(app)
        .get('/api/links')
        .expect(200);

      const link = statsResponse.body.find(l => l.shortCode === 'workflow');
      expect(link).toBeDefined();
      expect(link.clickCount).toBe(2);
      expect(link.originalUrl).toBe('https://workflow-test.com');

      // Delete the link
      await request(app)
        .delete('/api/links/workflow')
        .expect(204);

      // Verify deletion
      await request(app).get('/workflow').expect(404);
    });

    test('should handle multiple concurrent link creations', async () => {
      const urls = [
        'https://concurrent1.com',
        'https://concurrent2.com',
        'https://concurrent3.com',
        'https://concurrent4.com',
        'https://concurrent5.com'
      ];

      const promises = urls.map(url =>
        request(app)
          .post('/api/shorten')
          .send({ url })
      );

      const responses = await Promise.all(promises);

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('shortCode');
      });

      // All short codes should be unique
      const shortCodes = responses.map(r => r.body.shortCode);
      const uniqueCodes = new Set(shortCodes);
      expect(uniqueCodes.size).toBe(shortCodes.length);
    });
  });
});
