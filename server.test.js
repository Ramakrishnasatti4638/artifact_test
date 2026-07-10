const request = require('supertest');
const app = require('./server');

describe('URL Shortener API', () => {
  
  describe('POST /api/shorten', () => {
    test('should create a shortened URL with auto-generated code', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' })
        .expect(201);

      expect(response.body).toHaveProperty('shortCode');
      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body).toHaveProperty('originalUrl', 'https://example.com');
      expect(response.body.shortCode).toHaveLength(6);
      expect(response.body.shortUrl).toContain(response.body.shortCode);
    });

    test('should create a shortened URL with custom alias', async () => {
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

    test('should return 409 if custom alias is already taken', async () => {
      // Create first link with alias
      await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com',
          customAlias: 'taken'
        })
        .expect(201);

      // Try to create another with same alias
      const response = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://another.com',
          customAlias: 'taken'
        })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Alias already taken');
    });

    test('should return 400 if URL is missing', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'URL is required');
    });

    test('should return 400 if URL format is invalid', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'not-a-valid-url' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });

    test('should accept http URLs', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'http://example.com' })
        .expect(201);

      expect(response.body.originalUrl).toBe('http://example.com');
    });

    test('should reject non-http(s) URLs', async () => {
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
        .send({ 
          url: 'https://example.com',
          customAlias: 'redirect1'
        });

      const { shortCode } = createResponse.body;

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
        .send({ 
          url: 'https://example.com',
          customAlias: 'click1'
        });

      const { shortCode } = createResponse.body;

      // Redirect 3 times
      await request(app).get(`/${shortCode}`).expect(302);
      await request(app).get(`/${shortCode}`).expect(302);
      await request(app).get(`/${shortCode}`).expect(302);

      // Check click count
      const linksResponse = await request(app).get('/api/links');
      const link = linksResponse.body.find(l => l.shortCode === shortCode);
      
      expect(link.clickCount).toBe(3);
    });

    test('should return 404 for unknown short code', async () => {
      await request(app)
        .get('/nonexistent')
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
        .send({ 
          url: 'https://example1.com',
          customAlias: 'link1'
        });

      await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example2.com',
          customAlias: 'link2'
        });

      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(response.body.length).toBeGreaterThanOrEqual(2);
      
      const link = response.body[0];
      expect(link).toHaveProperty('shortCode');
      expect(link).toHaveProperty('originalUrl');
      expect(link).toHaveProperty('createdAt');
      expect(link).toHaveProperty('clickCount');
    });

    test('should sort links by clickCount descending', async () => {
      // Create links
      await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example1.com',
          customAlias: 'sort1'
        });

      await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example2.com',
          customAlias: 'sort2'
        });

      await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example3.com',
          customAlias: 'sort3'
        });

      // Add different click counts
      await request(app).get('/sort1'); // 1 click
      
      await request(app).get('/sort2'); // 3 clicks
      await request(app).get('/sort2');
      await request(app).get('/sort2');

      await request(app).get('/sort3'); // 2 clicks
      await request(app).get('/sort3');

      // Get links
      const response = await request(app).get('/api/links');
      
      const sortLinks = response.body.filter(l => 
        l.shortCode.startsWith('sort')
      );

      expect(sortLinks[0].shortCode).toBe('sort2'); // 3 clicks
      expect(sortLinks[1].shortCode).toBe('sort3'); // 2 clicks
      expect(sortLinks[2].shortCode).toBe('sort1'); // 1 click
    });
  });

  describe('DELETE /api/links/:shortCode', () => {
    test('should delete an existing link', async () => {
      // Create a link
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com',
          customAlias: 'delete1'
        });

      const { shortCode } = createResponse.body;

      // Delete it
      await request(app)
        .delete(`/api/links/${shortCode}`)
        .expect(204);

      // Verify it's gone
      await request(app)
        .get(`/${shortCode}`)
        .expect(404);
    });

    test('should return 404 when deleting non-existent link', async () => {
      const response = await request(app)
        .delete('/api/links/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Short link not found');
    });
  });

  describe('Edge Cases', () => {
    test('should handle URLs with query parameters', async () => {
      const url = 'https://example.com/page?param=value&other=123';
      
      const response = await request(app)
        .post('/api/shorten')
        .send({ url })
        .expect(201);

      expect(response.body.originalUrl).toBe(url);
    });

    test('should handle URLs with fragments', async () => {
      const url = 'https://example.com/page#section';
      
      const response = await request(app)
        .post('/api/shorten')
        .send({ url })
        .expect(201);

      expect(response.body.originalUrl).toBe(url);
    });

    test('should generate unique short codes', async () => {
      const codes = new Set();
      
      // Create 10 links
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .post('/api/shorten')
          .send({ url: `https://example.com/page${i}` });
        
        codes.add(response.body.shortCode);
      }

      // All codes should be unique
      expect(codes.size).toBe(10);
    });
  });
});
