const request = require('supertest');

describe('URL Shortener API', () => {
  let app;
  
  beforeEach(() => {
    // Clear the module cache and get a fresh app instance
    jest.resetModules();
    app = require('./server');
  });

  describe('POST /api/shorten', () => {
    test('should shorten a valid URL', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' })
        .expect(201);

      expect(response.body).toHaveProperty('shortCode');
      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body).toHaveProperty('originalUrl', 'https://example.com');
      expect(response.body.shortCode).toHaveLength(6);
    });

    test('should accept custom alias', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com',
          customAlias: 'github'
        })
        .expect(201);

      expect(response.body.shortCode).toBe('github');
    });

    test('should return 409 if custom alias already taken', async () => {
      // Create first link with custom alias
      await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com',
          customAlias: 'test123'
        })
        .expect(201);

      // Try to create another with same alias
      const response = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://another.com',
          customAlias: 'test123'
        })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Alias already taken');
    });

    test('should return 400 for missing URL', async () => {
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

    test('should reject non-http(s) protocols', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'ftp://example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });
  });

  describe('GET /:shortCode', () => {
    test('should redirect to original URL', async () => {
      // Create a shortened URL
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
      // Create a shortened URL
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' });

      const shortCode = createResponse.body.shortCode;

      // Click the link twice
      await request(app).get(`/${shortCode}`).expect(302);
      await request(app).get(`/${shortCode}`).expect(302);

      // Check click count
      const linksResponse = await request(app)
        .get('/api/links')
        .expect(200);

      const link = linksResponse.body.find(l => l.shortCode === shortCode);
      expect(link.clickCount).toBe(2);
    });

    test('should return 404 for unknown short code', async () => {
      const response = await request(app)
        .get('/unknown123')
        .expect(404);

      expect(response.text).toContain('Short URL not found');
    });
  });

  describe('GET /api/links', () => {
    test('should return empty array when no links exist', async () => {
      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    test('should return all links', async () => {
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
      expect(response.body[0]).toHaveProperty('shortCode');
      expect(response.body[0]).toHaveProperty('originalUrl');
      expect(response.body[0]).toHaveProperty('createdAt');
      expect(response.body[0]).toHaveProperty('clickCount');
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

      // Click them different amounts
      await request(app).get(`/${link1.body.shortCode}`); // 1 click
      await request(app).get(`/${link2.body.shortCode}`); // 3 clicks
      await request(app).get(`/${link2.body.shortCode}`);
      await request(app).get(`/${link2.body.shortCode}`);
      await request(app).get(`/${link3.body.shortCode}`); // 2 clicks
      await request(app).get(`/${link3.body.shortCode}`);

      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(response.body[0].clickCount).toBe(3); // link2
      expect(response.body[1].clickCount).toBe(2); // link3
      expect(response.body[2].clickCount).toBe(1); // link1
    });
  });

  describe('DELETE /api/links/:shortCode', () => {
    test('should delete an existing link', async () => {
      // Create a link
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' });

      const shortCode = createResponse.body.shortCode;

      // Delete it
      await request(app)
        .delete(`/api/links/${shortCode}`)
        .expect(204);

      // Verify it's gone
      const linksResponse = await request(app)
        .get('/api/links')
        .expect(200);

      expect(linksResponse.body).toHaveLength(0);
    });

    test('should return 404 when deleting non-existent link', async () => {
      const response = await request(app)
        .delete('/api/links/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Short code not found');
    });

    test('should not allow access to deleted short code', async () => {
      // Create a link
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' });

      const shortCode = createResponse.body.shortCode;

      // Delete it
      await request(app)
        .delete(`/api/links/${shortCode}`)
        .expect(204);

      // Try to access it
      await request(app)
        .get(`/${shortCode}`)
        .expect(404);
    });
  });

  describe('Edge cases', () => {
    test('should handle very long URLs', async () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(1000);
      
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: longUrl })
        .expect(201);

      expect(response.body.originalUrl).toBe(longUrl);
    });

    test('should handle URLs with special characters', async () => {
      const urlWithParams = 'https://example.com/search?q=test&lang=en&special=!@#$%';
      
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: urlWithParams })
        .expect(201);

      expect(response.body.originalUrl).toBe(urlWithParams);
    });

    test('should generate unique codes for multiple URLs', async () => {
      const codes = new Set();
      
      // Create 10 URLs and collect their codes
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .post('/api/shorten')
          .send({ url: `https://example${i}.com` });
        
        codes.add(response.body.shortCode);
      }

      // All codes should be unique
      expect(codes.size).toBe(10);
    });
  });
});
