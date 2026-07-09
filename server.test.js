const request = require('supertest');
const app = require('./server');

describe('URL Shortener API', () => {
  // Clear the in-memory store before each test
  beforeEach(() => {
    // Access the links Map from the module
    const links = require('./server').links;
    if (links) {
      links.clear();
    }
  });

  describe('POST /api/shorten', () => {
    it('should create a short URL with auto-generated code', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' })
        .expect(201);

      expect(response.body).toHaveProperty('shortCode');
      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body).toHaveProperty('originalUrl', 'https://example.com');
      expect(response.body.shortCode).toHaveLength(6);
    });

    it('should create a short URL with custom alias', async () => {
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

    it('should return 409 if custom alias already exists', async () => {
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
          url: 'https://another.com',
          customAlias: 'duplicate'
        })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Custom alias already taken');
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

    it('should accept URLs with http protocol', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'http://example.com' })
        .expect(201);

      expect(response.body.originalUrl).toBe('http://example.com');
    });

    it('should accept URLs with https protocol', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' })
        .expect(201);

      expect(response.body.originalUrl).toBe('https://example.com');
    });

    it('should reject URLs with invalid protocol', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'ftp://example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });
  });

  describe('GET /:shortCode', () => {
    it('should redirect to original URL', async () => {
      // Create a short URL
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com',
          customAlias: 'test123'
        });

      // Follow the redirect
      const response = await request(app)
        .get('/test123')
        .expect(302);

      expect(response.headers.location).toBe('https://example.com');
    });

    it('should increment click count on redirect', async () => {
      // Create a short URL
      await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com',
          customAlias: 'click-test'
        });

      // Click the link twice
      await request(app).get('/click-test').expect(302);
      await request(app).get('/click-test').expect(302);

      // Check click count
      const linksResponse = await request(app).get('/api/links');
      const link = linksResponse.body.find(l => l.shortCode === 'click-test');
      expect(link.clickCount).toBe(2);
    });

    it('should return 404 for non-existent short code', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.text).toContain('not found');
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
      expect(response.body[0]).toHaveProperty('clickCount', 0);
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

      // Click link2 three times
      await request(app).get('/link2');
      await request(app).get('/link2');
      await request(app).get('/link2');

      // Click link3 once
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
        .send({ 
          url: 'https://example.com',
          customAlias: 'delete-test'
        });

      // Delete the link
      await request(app)
        .delete('/api/links/delete-test')
        .expect(204);

      // Verify it's deleted
      const linksResponse = await request(app).get('/api/links');
      expect(linksResponse.body).toHaveLength(0);
    });

    it('should return 404 when deleting non-existent link', async () => {
      const response = await request(app)
        .delete('/api/links/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Short code not found');
    });

    it('should not allow accessing deleted link', async () => {
      // Create a link
      await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com',
          customAlias: 'temp-link'
        });

      // Delete it
      await request(app)
        .delete('/api/links/temp-link')
        .expect(204);

      // Try to access it
      await request(app)
        .get('/temp-link')
        .expect(404);
    });
  });

  describe('Integration tests', () => {
    it('should handle complete workflow', async () => {
      // 1. Create a link
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://github.com' })
        .expect(201);

      const { shortCode } = createResponse.body;

      // 2. Get all links
      let linksResponse = await request(app).get('/api/links');
      expect(linksResponse.body).toHaveLength(1);
      expect(linksResponse.body[0].clickCount).toBe(0);

      // 3. Click the link
      await request(app).get(`/${shortCode}`).expect(302);

      // 4. Verify click count increased
      linksResponse = await request(app).get('/api/links');
      expect(linksResponse.body[0].clickCount).toBe(1);

      // 5. Delete the link
      await request(app).delete(`/api/links/${shortCode}`).expect(204);

      // 6. Verify it's gone
      linksResponse = await request(app).get('/api/links');
      expect(linksResponse.body).toHaveLength(0);
    });
  });
});
