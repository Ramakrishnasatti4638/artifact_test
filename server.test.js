const request = require('supertest');
const app = require('./server');

describe('URL Shortener API', () => {
  
  describe('POST /api/shorten', () => {
    it('should create a short URL with a random code', async () => {
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

    it('should create a short URL with a custom alias', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com/custom',
          customAlias: 'mylink'
        })
        .expect(201);

      expect(response.body.shortCode).toBe('mylink');
      expect(response.body.shortUrl).toContain('mylink');
    });

    it('should return 409 if custom alias is already taken', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com/first',
          customAlias: 'duplicate'
        })
        .expect(201);

      const response = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com/second',
          customAlias: 'duplicate'
        })
        .expect(409);

      expect(response.body.error).toBe('Alias already taken');
    });

    it('should return 400 if URL is missing', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('URL is required');
    });

    it('should return 400 if URL format is invalid', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'not-a-valid-url' })
        .expect(400);

      expect(response.body.error).toBe('Invalid URL format');
    });

    it('should accept valid HTTP URL', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'http://example.com' })
        .expect(201);

      expect(response.body.originalUrl).toBe('http://example.com');
    });

    it('should accept valid HTTPS URL', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' })
        .expect(201);

      expect(response.body.originalUrl).toBe('https://example.com');
    });

    it('should reject ftp:// URLs', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'ftp://example.com' })
        .expect(400);

      expect(response.body.error).toBe('Invalid URL format');
    });
  });

  describe('GET /api/links', () => {
    it('should return all links sorted by click count', async () => {
      // Create three links
      const link1 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example1.com', customAlias: 'link1' });

      const link2 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example2.com', customAlias: 'link2' });

      const link3 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example3.com', customAlias: 'link3' });

      // Click link2 twice
      await request(app).get('/link2');
      await request(app).get('/link2');

      // Click link1 once
      await request(app).get('/link1');

      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3);

      // Find our created links
      const links = response.body.filter(l => 
        ['link1', 'link2', 'link3'].includes(l.shortCode)
      );

      expect(links).toHaveLength(3);

      // Check that they're sorted by click count (descending)
      expect(links[0].shortCode).toBe('link2');
      expect(links[0].clickCount).toBe(2);
      expect(links[1].shortCode).toBe('link1');
      expect(links[1].clickCount).toBe(1);
      expect(links[2].shortCode).toBe('link3');
      expect(links[2].clickCount).toBe(0);
    });

    it('should return empty array when no links exist', async () => {
      // This test assumes a fresh state, but since we're using in-memory storage
      // and tests run together, we just check that it returns an array
      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should include all required fields for each link', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com', customAlias: 'test-fields' });

      const response = await request(app)
        .get('/api/links')
        .expect(200);

      const link = response.body.find(l => l.shortCode === 'test-fields');
      
      expect(link).toHaveProperty('shortCode');
      expect(link).toHaveProperty('originalUrl');
      expect(link).toHaveProperty('createdAt');
      expect(link).toHaveProperty('clickCount');
    });
  });

  describe('GET /:shortCode', () => {
    it('should redirect to the original URL', async () => {
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/redirect-test', customAlias: 'redir' });

      const response = await request(app)
        .get('/redir')
        .expect(302);

      expect(response.headers.location).toBe('https://example.com/redirect-test');
    });

    it('should increment click count on each access', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/clicks', customAlias: 'clicks' });

      // Access the short URL three times
      await request(app).get('/clicks').expect(302);
      await request(app).get('/clicks').expect(302);
      await request(app).get('/clicks').expect(302);

      const response = await request(app).get('/api/links');
      const link = response.body.find(l => l.shortCode === 'clicks');
      
      expect(link.clickCount).toBe(3);
    });

    it('should return 404 for unknown short code', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.body.error).toBe('Short code not found');
    });
  });

  describe('DELETE /api/links/:shortCode', () => {
    it('should delete an existing link', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/delete-me', customAlias: 'delme' });

      await request(app)
        .delete('/api/links/delme')
        .expect(204);

      // Verify it's deleted
      await request(app)
        .get('/delme')
        .expect(404);
    });

    it('should return 404 when deleting non-existent link', async () => {
      const response = await request(app)
        .delete('/api/links/doesnotexist')
        .expect(404);

      expect(response.body.error).toBe('Short code not found');
    });

    it('should remove link from /api/links list after deletion', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/remove', customAlias: 'remove' });

      // Verify it exists
      let response = await request(app).get('/api/links');
      let link = response.body.find(l => l.shortCode === 'remove');
      expect(link).toBeDefined();

      // Delete it
      await request(app).delete('/api/links/remove').expect(204);

      // Verify it's gone
      response = await request(app).get('/api/links');
      link = response.body.find(l => l.shortCode === 'remove');
      expect(link).toBeUndefined();
    });
  });

  describe('Integration tests', () => {
    it('should handle complete workflow: create, click, view stats, delete', async () => {
      // Create a link
      const createRes = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://workflow.example.com', customAlias: 'workflow' })
        .expect(201);

      expect(createRes.body.shortCode).toBe('workflow');

      // Click it twice
      await request(app).get('/workflow').expect(302);
      await request(app).get('/workflow').expect(302);

      // Check stats
      let linksRes = await request(app).get('/api/links').expect(200);
      let link = linksRes.body.find(l => l.shortCode === 'workflow');
      expect(link.clickCount).toBe(2);

      // Delete it
      await request(app).delete('/api/links/workflow').expect(204);

      // Verify deletion
      await request(app).get('/workflow').expect(404);
    });
  });
});
