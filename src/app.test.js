const request = require('supertest');
const app = require('../src/app');
const store = require('../src/store');

describe('URL Shortener API', () => {
  beforeEach(() => {
    store.clearAll();
  });

  // POST /api/shorten tests
  describe('POST /api/shorten', () => {
    it('should create a shortened URL with a valid URL', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' })
        .expect(201);

      expect(response.body).toHaveProperty('shortCode');
      expect(response.body).toHaveProperty('originalUrl', 'https://example.com');
      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body.shortCode).toMatch(/^[A-Za-z0-9]{6}$/);
    });

    it('should create a shortened URL with a custom alias', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com', customAlias: 'mylink' })
        .expect(201);

      expect(response.body.shortCode).toBe('mylink');
      expect(response.body.originalUrl).toBe('https://example.com');
    });

    it('should return 400 if URL is missing', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'URL is required');
    });

    it('should return 400 if URL format is invalid', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'not-a-valid-url' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });

    it('should return 409 if custom alias is already taken', async () => {
      // Create first link with alias
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com', customAlias: 'taken' });

      // Try to create another with same alias
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://another.com', customAlias: 'taken' })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Alias already taken');
    });

    it('should generate unique short codes for different URLs', async () => {
      const res1 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' });

      const res2 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://another.com' });

      expect(res1.body.shortCode).not.toBe(res2.body.shortCode);
    });

    it('should include the correct host in shortUrl', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' })
        .expect(201);

      expect(response.body.shortUrl).toMatch(/^http:\/\/.*\/[A-Za-z0-9]{6}$/);
    });
  });

  // GET /:shortCode tests
  describe('GET /:shortCode', () => {
    it('should redirect to the original URL with 302 status', async () => {
      // Create a shortened link first
      const createRes = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/target' });

      const shortCode = createRes.body.shortCode;

      // Redirect request
      const response = await request(app)
        .get(`/${shortCode}`)
        .expect(302);

      expect(response.headers.location).toBe('https://example.com/target');
    });

    it('should increment the click count when redirecting', async () => {
      // Create link
      const createRes = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' });

      const shortCode = createRes.body.shortCode;

      // First click
      await request(app).get(`/${shortCode}`).expect(302);

      // Get links and verify clickCount
      let linksRes = await request(app).get('/api/links');
      expect(linksRes.body[0].clickCount).toBe(1);

      // Second click
      await request(app).get(`/${shortCode}`).expect(302);

      // Verify clickCount incremented
      linksRes = await request(app).get('/api/links');
      expect(linksRes.body[0].clickCount).toBe(2);
    });

    it('should return 404 for unknown short code', async () => {
      const response = await request(app)
        .get('/unknown123')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Short code not found');
    });

    it('should handle complex URLs correctly', async () => {
      const complexUrl = 'https://example.com/path?query=value&foo=bar#anchor';

      const createRes = await request(app)
        .post('/api/shorten')
        .send({ url: complexUrl });

      const shortCode = createRes.body.shortCode;

      const redirectRes = await request(app)
        .get(`/${shortCode}`)
        .expect(302);

      expect(redirectRes.headers.location).toBe(complexUrl);
    });
  });

  // GET /api/links tests
  describe('GET /api/links', () => {
    it('should return an empty array initially', async () => {
      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should return all created links', async () => {
      // Create multiple links
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' });

      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://another.com' });

      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('shortCode');
      expect(response.body[0]).toHaveProperty('originalUrl');
      expect(response.body[0]).toHaveProperty('createdAt');
      expect(response.body[0]).toHaveProperty('clickCount', 0);
    });

    it('should return links sorted by clickCount descending', async () => {
      // Create three links
      const res1 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example1.com' });

      const res2 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example2.com' });

      const res3 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example3.com' });

      // Click on them different number of times
      await request(app).get(`/${res1.body.shortCode}`);
      await request(app).get(`/${res1.body.shortCode}`);
      await request(app).get(`/${res1.body.shortCode}`); // 3 clicks

      await request(app).get(`/${res2.body.shortCode}`); // 1 click

      // 0 clicks for res3

      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(response.body[0].originalUrl).toBe('https://example1.com');
      expect(response.body[0].clickCount).toBe(3);
      expect(response.body[1].originalUrl).toBe('https://example2.com');
      expect(response.body[1].clickCount).toBe(1);
      expect(response.body[2].originalUrl).toBe('https://example3.com');
      expect(response.body[2].clickCount).toBe(0);
    });
  });

  // DELETE /api/links/:shortCode tests
  describe('DELETE /api/links/:shortCode', () => {
    it('should delete a shortened link', async () => {
      // Create link
      const createRes = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com', customAlias: 'delete-me' });

      // Delete it
      await request(app)
        .delete('/api/links/delete-me')
        .expect(204);

      // Verify it's gone
      const getLinksRes = await request(app).get('/api/links');
      expect(getLinksRes.body.length).toBe(0);
    });

    it('should return 404 when deleting non-existent link', async () => {
      const response = await request(app)
        .delete('/api/links/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Short code not found');
    });

    it('should allow the alias to be reused after deletion', async () => {
      // Create and delete a link
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com', customAlias: 'reuse' });

      await request(app).delete('/api/links/reuse');

      // Create another link with the same alias
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://newexample.com', customAlias: 'reuse' })
        .expect(201);

      expect(response.body.shortCode).toBe('reuse');
      expect(response.body.originalUrl).toBe('https://newexample.com');
    });

    it('should update getAllLinks after deletion', async () => {
      // Create multiple links
      const res1 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example1.com' });

      const res2 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example2.com' });

      // Delete one
      await request(app)
        .delete(`/api/links/${res1.body.shortCode}`)
        .expect(204);

      // Verify only one remains
      const response = await request(app).get('/api/links');
      expect(response.body.length).toBe(1);
      expect(response.body[0].originalUrl).toBe('https://example2.com');
    });
  });

  // Integration tests
  describe('Integration Tests', () => {
    it('should handle complete workflow: create, click, view, delete', async () => {
      // 1. Create a shortened link
      const createRes = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://github.com', customAlias: 'gh' })
        .expect(201);

      expect(createRes.body.shortCode).toBe('gh');

      // 2. Click the link multiple times
      await request(app).get('/gh').expect(302);
      await request(app).get('/gh').expect(302);
      await request(app).get('/gh').expect(302);

      // 3. View all links and verify click count
      const linksRes = await request(app).get('/api/links').expect(200);
      expect(linksRes.body[0].clickCount).toBe(3);

      // 4. Delete the link
      await request(app).delete('/api/links/gh').expect(204);

      // 5. Verify deletion
      const finalRes = await request(app).get('/api/links');
      expect(finalRes.body.length).toBe(0);
    });

    it('should track multiple links independently', async () => {
      // Create two links
      const res1 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://google.com', customAlias: 'g' });

      const res2 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://github.com', customAlias: 'gh' });

      // Click first link 5 times
      for (let i = 0; i < 5; i++) {
        await request(app).get('/g');
      }

      // Click second link 2 times
      for (let i = 0; i < 2; i++) {
        await request(app).get('/gh');
      }

      // Get links and verify independent tracking
      const linksRes = await request(app).get('/api/links');
      expect(linksRes.body[0].shortCode).toBe('g');
      expect(linksRes.body[0].clickCount).toBe(5);
      expect(linksRes.body[1].shortCode).toBe('gh');
      expect(linksRes.body[1].clickCount).toBe(2);
    });
  });
});
