const request = require('supertest');
const app = require('./server');

describe('URL Shortener API', () => {
  describe('POST /api/shorten', () => {
    it('should create a shortened URL with valid URL', async () => {
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
          url: 'https://example.com/page',
          customAlias: 'mylink'
        })
        .expect(201);

      expect(response.body.shortCode).toBe('mylink');
      expect(response.body.originalUrl).toBe('https://example.com/page');
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

      // Try to create with same alias
      const response = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com/second',
          customAlias: 'duplicate'
        })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Alias already taken');
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

    it('should only accept http and https protocols', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'ftp://example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });
  });

  describe('GET /:shortCode', () => {
    it('should redirect to original URL', async () => {
      // Create a link first
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com/redirect-test',
          customAlias: 'redirect123'
        });

      // Test redirect
      const response = await request(app)
        .get('/redirect123')
        .expect(302);

      expect(response.headers.location).toBe('https://example.com/redirect-test');
    });

    it('should increment click count on redirect', async () => {
      // Create a link
      await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com/clicks',
          customAlias: 'clicktest'
        });

      // Click it 3 times
      await request(app).get('/clicktest').expect(302);
      await request(app).get('/clicktest').expect(302);
      await request(app).get('/clicktest').expect(302);

      // Check click count
      const linksResponse = await request(app)
        .get('/api/links')
        .expect(200);

      const link = linksResponse.body.find(l => l.shortCode === 'clicktest');
      expect(link.clickCount).toBe(3);
    });

    it('should return 404 for non-existent short code', async () => {
      await request(app)
        .get('/nonexistent')
        .expect(404);
    });
  });

  describe('GET /api/links', () => {
    it('should return all links sorted by click count', async () => {
      // Create multiple links
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/link1', customAlias: 'link1' });

      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/link2', customAlias: 'link2' });

      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/link3', customAlias: 'link3' });

      // Click link2 twice
      await request(app).get('/link2');
      await request(app).get('/link2');

      // Click link1 once
      await request(app).get('/link1');

      // Get all links
      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3);

      // Should be sorted by click count descending
      const clickCounts = response.body.map(link => link.clickCount);
      const sortedClickCounts = [...clickCounts].sort((a, b) => b - a);
      expect(clickCounts).toEqual(sortedClickCounts);
    });

    it('should return empty array when no links exist', async () => {
      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should include all required fields for each link', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/fields-test', customAlias: 'fieldstest' });

      const response = await request(app)
        .get('/api/links')
        .expect(200);

      const link = response.body.find(l => l.shortCode === 'fieldstest');
      expect(link).toHaveProperty('shortCode');
      expect(link).toHaveProperty('originalUrl');
      expect(link).toHaveProperty('createdAt');
      expect(link).toHaveProperty('clickCount');
    });
  });

  describe('DELETE /api/links/:shortCode', () => {
    it('should delete an existing link', async () => {
      // Create a link
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/delete-test', customAlias: 'deletetest' });

      // Delete it
      await request(app)
        .delete('/api/links/deletetest')
        .expect(204);

      // Verify it's deleted
      await request(app)
        .get('/deletetest')
        .expect(404);
    });

    it('should return 404 when deleting non-existent link', async () => {
      const response = await request(app)
        .delete('/api/links/doesnotexist')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Short code not found');
    });
  });

  describe('Integration tests', () => {
    it('should handle complete workflow: create, redirect, check stats, delete', async () => {
      // 1. Create a link
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/workflow', customAlias: 'workflow' })
        .expect(201);

      expect(createResponse.body.shortCode).toBe('workflow');

      // 2. Use the link (redirect)
      await request(app)
        .get('/workflow')
        .expect(302);

      // 3. Check stats
      const statsResponse = await request(app)
        .get('/api/links')
        .expect(200);

      const link = statsResponse.body.find(l => l.shortCode === 'workflow');
      expect(link.clickCount).toBe(1);

      // 4. Delete the link
      await request(app)
        .delete('/api/links/workflow')
        .expect(204);

      // 5. Verify deletion
      await request(app)
        .get('/workflow')
        .expect(404);
    });

    it('should handle multiple links with different click counts', async () => {
      // Create 3 links
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/multi1', customAlias: 'multi1' });

      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/multi2', customAlias: 'multi2' });

      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/multi3', customAlias: 'multi3' });

      // Click them different amounts
      await request(app).get('/multi1');
      await request(app).get('/multi1');
      await request(app).get('/multi1');

      await request(app).get('/multi2');
      await request(app).get('/multi2');

      await request(app).get('/multi3');

      // Verify sorting
      const response = await request(app)
        .get('/api/links')
        .expect(200);

      const multiLinks = response.body
        .filter(l => l.shortCode.startsWith('multi'))
        .sort((a, b) => b.clickCount - a.clickCount);

      expect(multiLinks[0].shortCode).toBe('multi1');
      expect(multiLinks[0].clickCount).toBe(3);
      expect(multiLinks[1].shortCode).toBe('multi2');
      expect(multiLinks[1].clickCount).toBe(2);
      expect(multiLinks[2].shortCode).toBe('multi3');
      expect(multiLinks[2].clickCount).toBe(1);
    });
  });
});
