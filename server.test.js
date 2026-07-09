const request = require('supertest');
const app = require('./server');

describe('URL Shortener API', () => {
  
  // Clear the in-memory store before each test
  beforeEach(() => {
    app._clearLinks();
  });
  
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
          url: 'https://example.com/custom',
          customAlias: 'mylink'
        })
        .expect(201);

      expect(response.body.shortCode).toBe('mylink');
      expect(response.body.originalUrl).toBe('https://example.com/custom');
    });

    it('should return 409 if custom alias already exists', async () => {
      // Create first link
      await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com/first',
          customAlias: 'duplicate'
        })
        .expect(201);

      // Try to create second link with same alias
      const response = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com/second',
          customAlias: 'duplicate'
        })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Custom alias already taken');
    });

    it('should return 400 if URL is missing', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'URL is required');
    });

    it('should return 400 if URL is invalid', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'not-a-valid-url' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });

    it('should accept http:// URLs', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'http://example.com' })
        .expect(201);

      expect(response.body.originalUrl).toBe('http://example.com');
    });

    it('should accept https:// URLs', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' })
        .expect(201);

      expect(response.body.originalUrl).toBe('https://example.com');
    });

    it('should reject URLs without protocol', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'example.com' })
        .expect(400);
    });

    it('should reject ftp:// URLs', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'ftp://example.com' })
        .expect(400);
    });
  });

  describe('GET /api/links', () => {
    
    it('should return empty array when no links exist', async () => {
      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return all links sorted by clickCount desc', async () => {
      // Create multiple links
      const link1 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/1', customAlias: 'link1' });

      const link2 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/2', customAlias: 'link2' });

      const link3 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/3', customAlias: 'link3' });

      // Click link2 twice
      await request(app).get('/link2').expect(302);
      await request(app).get('/link2').expect(302);

      // Click link1 once
      await request(app).get('/link1').expect(302);

      // Get all links
      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(response.body).toHaveLength(3);
      
      // Should be sorted by clickCount desc
      expect(response.body[0].shortCode).toBe('link2');
      expect(response.body[0].clickCount).toBe(2);
      expect(response.body[1].shortCode).toBe('link1');
      expect(response.body[1].clickCount).toBe(1);
      expect(response.body[2].shortCode).toBe('link3');
      expect(response.body[2].clickCount).toBe(0);

      // Each link should have required fields
      response.body.forEach(link => {
        expect(link).toHaveProperty('shortCode');
        expect(link).toHaveProperty('originalUrl');
        expect(link).toHaveProperty('createdAt');
        expect(link).toHaveProperty('clickCount');
      });
    });
  });

  describe('GET /:shortCode', () => {
    
    it('should redirect to original URL', async () => {
      // Create a link
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com/redirect-test',
          customAlias: 'redir'
        })
        .expect(201);

      // Access the short URL
      const response = await request(app)
        .get('/redir')
        .expect(302);

      expect(response.headers.location).toBe('https://example.com/redirect-test');
    });

    it('should increment click count on each access', async () => {
      // Create a link
      await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com/clicks',
          customAlias: 'clicks'
        })
        .expect(201);

      // Click 3 times
      await request(app).get('/clicks').expect(302);
      await request(app).get('/clicks').expect(302);
      await request(app).get('/clicks').expect(302);

      // Check click count
      const linksResponse = await request(app)
        .get('/api/links')
        .expect(200);

      const link = linksResponse.body.find(l => l.shortCode === 'clicks');
      expect(link.clickCount).toBe(3);
    });

    it('should return 404 for non-existent short code', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.text).toContain('Short URL not found');
    });
  });

  describe('DELETE /api/links/:shortCode', () => {
    
    it('should delete an existing link', async () => {
      // Create a link
      await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com/to-delete',
          customAlias: 'todelete'
        })
        .expect(201);

      // Delete the link
      await request(app)
        .delete('/api/links/todelete')
        .expect(204);

      // Verify it's gone
      await request(app)
        .get('/todelete')
        .expect(404);
    });

    it('should return 404 when deleting non-existent link', async () => {
      const response = await request(app)
        .delete('/api/links/doesnotexist')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Short code not found');
    });

    it('should remove link from stats', async () => {
      // Create two links
      await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com/keep',
          customAlias: 'keep'
        })
        .expect(201);

      await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com/remove',
          customAlias: 'remove'
        })
        .expect(201);

      // Verify both exist
      let linksResponse = await request(app).get('/api/links').expect(200);
      expect(linksResponse.body).toHaveLength(2);

      // Delete one
      await request(app)
        .delete('/api/links/remove')
        .expect(204);

      // Verify only one remains
      linksResponse = await request(app).get('/api/links').expect(200);
      expect(linksResponse.body).toHaveLength(1);
      expect(linksResponse.body[0].shortCode).toBe('keep');
    });
  });

  describe('Edge cases', () => {
    
    it('should handle very long URLs', async () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(1000);
      
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: longUrl })
        .expect(201);

      expect(response.body.originalUrl).toBe(longUrl);
    });

    it('should handle URLs with special characters', async () => {
      const specialUrl = 'https://example.com/path?query=value&foo=bar#anchor';
      
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: specialUrl })
        .expect(201);

      expect(response.body.originalUrl).toBe(specialUrl);
    });

    it('should handle custom aliases with alphanumeric characters', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com',
          customAlias: 'Custom123'
        })
        .expect(201);

      expect(response.body.shortCode).toBe('Custom123');
    });
  });
});
