const request = require('supertest');
const { clearLinks } = require('./server');
const app = require('./server');

describe('URL Shortener API', () => {
  // Clear the in-memory store before each test
  beforeEach(() => {
    clearLinks();
  });

  describe('POST /api/shorten', () => {
    it('should create a shortened URL with auto-generated code', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com' })
        .expect(201);

      expect(response.body).toHaveProperty('shortCode');
      expect(response.body).toHaveProperty('originalUrl', 'https://www.example.com');
      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body.shortCode).toHaveLength(6);
    });

    it('should create a shortened URL with custom alias', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://www.example.com',
          customAlias: 'custom123'
        })
        .expect(201);

      expect(response.body.shortCode).toBe('custom123');
      expect(response.body.originalUrl).toBe('https://www.example.com');
    });

    it('should return 409 if custom alias already exists', async () => {
      // First request - should succeed
      await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://www.example.com',
          customAlias: 'duplicate'
        })
        .expect(201);

      // Second request with same alias - should fail
      const response = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://www.example.com',
          customAlias: 'duplicate'
        })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Custom alias already taken');
    });

    it('should return 400 for invalid URL format', async () => {
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

    it('should accept http and https URLs', async () => {
      const httpResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'http://www.example.com' })
        .expect(201);

      expect(httpResponse.body.originalUrl).toBe('http://www.example.com');

      const httpsResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com' })
        .expect(201);

      expect(httpsResponse.body.originalUrl).toBe('https://www.example.com');
    });
  });

  describe('GET /:shortCode', () => {
    it('should redirect to original URL and increment click count', async () => {
      // Create a shortened URL
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com', customAlias: 'test123' })
        .expect(201);

      // Access the shortened URL
      const redirectResponse = await request(app)
        .get('/test123')
        .expect(302);

      expect(redirectResponse.headers.location).toBe('https://www.example.com');

      // Verify click count incremented
      const linksResponse = await request(app)
        .get('/api/links')
        .expect(200);

      const link = linksResponse.body.find(l => l.shortCode === 'test123');
      expect(link.clickCount).toBe(1);
    });

    it('should increment click count on multiple visits', async () => {
      // Create a shortened URL
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com', customAlias: 'multi123' })
        .expect(201);

      // Visit 3 times
      await request(app).get('/multi123').expect(302);
      await request(app).get('/multi123').expect(302);
      await request(app).get('/multi123').expect(302);

      // Check click count
      const linksResponse = await request(app)
        .get('/api/links')
        .expect(200);

      const link = linksResponse.body.find(l => l.shortCode === 'multi123');
      expect(link.clickCount).toBe(3);
    });

    it('should return 404 for unknown short code', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.text).toContain('Short URL not found');
    });
  });

  describe('GET /api/links', () => {
    it('should return empty array when no links exist', async () => {
      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return all shortened links', async () => {
      // Create multiple links
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example1.com', customAlias: 'link1' });

      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example2.com', customAlias: 'link2' });

      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('shortCode');
      expect(response.body[0]).toHaveProperty('originalUrl');
      expect(response.body[0]).toHaveProperty('clickCount');
      expect(response.body[0]).toHaveProperty('createdAt');
    });

    it('should return links sorted by click count descending', async () => {
      // Create links
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example1.com', customAlias: 'sort1' });

      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example2.com', customAlias: 'sort2' });

      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example3.com', customAlias: 'sort3' });

      // Generate different click counts
      await request(app).get('/sort1'); // 1 click
      await request(app).get('/sort2'); // 2 clicks
      await request(app).get('/sort2');
      await request(app).get('/sort3'); // 3 clicks
      await request(app).get('/sort3');
      await request(app).get('/sort3');

      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(response.body[0].shortCode).toBe('sort3');
      expect(response.body[0].clickCount).toBe(3);
      expect(response.body[1].shortCode).toBe('sort2');
      expect(response.body[1].clickCount).toBe(2);
      expect(response.body[2].shortCode).toBe('sort1');
      expect(response.body[2].clickCount).toBe(1);
    });
  });

  describe('DELETE /api/links/:shortCode', () => {
    it('should delete a shortened link', async () => {
      // Create a link
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com', customAlias: 'delete1' })
        .expect(201);

      // Delete the link
      await request(app)
        .delete('/api/links/delete1')
        .expect(204);

      // Verify it's deleted by trying to access it
      await request(app)
        .get('/delete1')
        .expect(404);

      // Verify it's not in the links list
      const linksResponse = await request(app)
        .get('/api/links')
        .expect(200);

      const link = linksResponse.body.find(l => l.shortCode === 'delete1');
      expect(link).toBeUndefined();
    });

    it('should return 404 when deleting non-existent link', async () => {
      const response = await request(app)
        .delete('/api/links/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Short code not found');
    });
  });

  describe('Edge cases', () => {
    it('should handle URLs with query parameters', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com?param=value&other=test' })
        .expect(201);

      expect(response.body.originalUrl).toBe('https://www.example.com?param=value&other=test');
    });

    it('should handle URLs with fragments', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com#section' })
        .expect(201);

      expect(response.body.originalUrl).toBe('https://www.example.com#section');
    });

    it('should generate unique random codes', async () => {
      const codes = new Set();
      
      // Create 10 links
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .post('/api/shorten')
          .send({ url: `https://www.example${i}.com` })
          .expect(201);
        
        codes.add(response.body.shortCode);
      }

      // All codes should be unique
      expect(codes.size).toBe(10);
    });
  });
});
