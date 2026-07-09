const request = require('supertest');
const { app, server, linksStore } = require('./server');

// Close server after all tests
afterAll((done) => {
  server.close(done);
});

// Clear store before each test
beforeEach(() => {
  linksStore.clear();
});

describe('URL Shortener API', () => {
  describe('POST /api/shorten', () => {
    it('should create a shortened URL with auto-generated code', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' })
        .expect(201);

      expect(response.body).toHaveProperty('shortCode');
      expect(response.body).toHaveProperty('originalUrl', 'https://example.com');
      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body.shortCode).toHaveLength(6);
    });

    it('should create a shortened URL with custom alias', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com',
          customAlias: 'mylink'
        })
        .expect(201);

      expect(response.body.shortCode).toBe('mylink');
      expect(response.body.originalUrl).toBe('https://example.com');
    });

    it('should return 400 for invalid URL', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'not-a-valid-url' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });

    it('should return 400 for missing URL', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });

    it('should return 409 for duplicate custom alias', async () => {
      // Create first link
      await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com',
          customAlias: 'duplicate'
        })
        .expect(201);

      // Try to create another with same alias
      const response = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://another.com',
          customAlias: 'duplicate'
        })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Alias already taken');
    });

    it('should accept URLs with http protocol', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'http://example.com' })
        .expect(201);

      expect(response.body.originalUrl).toBe('http://example.com');
    });

    it('should reject URLs without valid protocol', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'ftp://example.com' })
        .expect(400);
    });
  });

  describe('GET /:shortCode', () => {
    it('should redirect to original URL', async () => {
      // Create a link
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com',
          customAlias: 'test123'
        });

      // Test redirect
      const response = await request(app)
        .get('/test123')
        .expect(302);

      expect(response.headers.location).toBe('https://example.com');
    });

    it('should increment click count on redirect', async () => {
      // Create a link
      await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com',
          customAlias: 'clicks'
        });

      // Click it multiple times
      await request(app).get('/clicks').expect(302);
      await request(app).get('/clicks').expect(302);
      await request(app).get('/clicks').expect(302);

      // Check click count
      const linksResponse = await request(app).get('/api/links');
      const link = linksResponse.body.find(l => l.shortCode === 'clicks');
      expect(link.clickCount).toBe(3);
    });

    it('should return 404 for unknown short code', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.text).toContain('Short code not found');
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
      expect(response.body[0]).toHaveProperty('clickCount');
      expect(response.body[0]).toHaveProperty('createdAt');
    });

    it('should return links sorted by clickCount descending', async () => {
      // Create links
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example1.com', customAlias: 'low' });

      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example2.com', customAlias: 'high' });

      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example3.com', customAlias: 'medium' });

      // Generate clicks
      await request(app).get('/high');
      await request(app).get('/high');
      await request(app).get('/high');
      await request(app).get('/medium');
      await request(app).get('/medium');

      const response = await request(app).get('/api/links');
      
      expect(response.body[0].shortCode).toBe('high');
      expect(response.body[0].clickCount).toBe(3);
      expect(response.body[1].shortCode).toBe('medium');
      expect(response.body[1].clickCount).toBe(2);
      expect(response.body[2].shortCode).toBe('low');
      expect(response.body[2].clickCount).toBe(0);
    });
  });

  describe('DELETE /api/links/:shortCode', () => {
    it('should delete an existing link', async () => {
      // Create a link
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com', customAlias: 'todelete' });

      // Delete it
      await request(app)
        .delete('/api/links/todelete')
        .expect(204);

      // Verify it's gone
      const response = await request(app).get('/api/links');
      expect(response.body).toHaveLength(0);
    });

    it('should return 404 for non-existent short code', async () => {
      const response = await request(app)
        .delete('/api/links/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Short code not found');
    });

    it('should not affect other links when deleting', async () => {
      // Create multiple links
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example1.com', customAlias: 'keep1' });

      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example2.com', customAlias: 'delete' });

      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example3.com', customAlias: 'keep2' });

      // Delete one
      await request(app).delete('/api/links/delete').expect(204);

      // Check remaining links
      const response = await request(app).get('/api/links');
      expect(response.body).toHaveLength(2);
      expect(response.body.find(l => l.shortCode === 'keep1')).toBeDefined();
      expect(response.body.find(l => l.shortCode === 'keep2')).toBeDefined();
      expect(response.body.find(l => l.shortCode === 'delete')).toBeUndefined();
    });
  });
});
