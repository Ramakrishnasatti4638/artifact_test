const request = require('supertest');
const { clearStore } = require('./server');
const app = require('./server');

describe('URL Shortener API', () => {
  beforeEach(() => {
    // Clear the in-memory store before each test
    clearStore();
  });

  describe('POST /api/shorten', () => {
    test('should shorten a valid URL without custom alias', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com' })
        .expect(201);

      expect(response.body).toHaveProperty('shortCode');
      expect(response.body).toHaveProperty('originalUrl', 'https://www.example.com');
      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body.shortCode).toHaveLength(6);
      expect(response.body.shortUrl).toContain(response.body.shortCode);
    });

    test('should shorten a valid URL with custom alias', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://www.example.com',
          customAlias: 'mylink'
        })
        .expect(201);

      expect(response.body.shortCode).toBe('mylink');
      expect(response.body.originalUrl).toBe('https://www.example.com');
      expect(response.body.shortUrl).toContain('mylink');
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

    test('should return 400 for non-http(s) protocol', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'ftp://example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });

    test('should return 409 for duplicate custom alias', async () => {
      // Create first link with alias
      await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://www.example.com',
          customAlias: 'duplicate'
        })
        .expect(201);

      // Try to create second link with same alias
      const response = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://www.another.com',
          customAlias: 'duplicate'
        })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Alias already taken');
    });

    test('should generate unique short codes', async () => {
      const response1 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example1.com' })
        .expect(201);

      const response2 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example2.com' })
        .expect(201);

      expect(response1.body.shortCode).not.toBe(response2.body.shortCode);
    });
  });

  describe('GET /:shortCode', () => {
    test('should redirect to original URL', async () => {
      // Create a shortened URL
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com' });

      const { shortCode } = createResponse.body;

      // Access the short code
      const response = await request(app)
        .get(`/${shortCode}`)
        .expect(302);

      expect(response.headers.location).toBe('https://www.example.com');
    });

    test('should increment click count on each access', async () => {
      // Create a shortened URL
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com' });

      const { shortCode } = createResponse.body;

      // Access the short code twice
      await request(app).get(`/${shortCode}`).expect(302);
      await request(app).get(`/${shortCode}`).expect(302);

      // Check click count
      const linksResponse = await request(app)
        .get('/api/links')
        .expect(200);

      const link = linksResponse.body.find(l => l.shortCode === shortCode);
      expect(link.clickCount).toBe(2);
    });

    test('should return 404 for non-existent short code', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Short code not found');
    });

    test('should handle favicon.ico request', async () => {
      await request(app)
        .get('/favicon.ico')
        .expect(404);
    });
  });

  describe('GET /api/links', () => {
    test('should return empty array when no links exist', async () => {
      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    test('should return all shortened links', async () => {
      // Create multiple links
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example1.com' });

      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example2.com' });

      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('shortCode');
      expect(response.body[0]).toHaveProperty('originalUrl');
      expect(response.body[0]).toHaveProperty('createdAt');
      expect(response.body[0]).toHaveProperty('clickCount', 0);
    });

    test('should return links sorted by click count descending', async () => {
      // Create three links
      const response1 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example1.com' });

      const response2 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example2.com' });

      const response3 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example3.com' });

      // Access them different numbers of times
      await request(app).get(`/${response1.body.shortCode}`); // 1 click
      await request(app).get(`/${response2.body.shortCode}`); // 3 clicks
      await request(app).get(`/${response2.body.shortCode}`);
      await request(app).get(`/${response2.body.shortCode}`);
      await request(app).get(`/${response3.body.shortCode}`); // 2 clicks
      await request(app).get(`/${response3.body.shortCode}`);

      const linksResponse = await request(app)
        .get('/api/links')
        .expect(200);

      expect(linksResponse.body[0].shortCode).toBe(response2.body.shortCode);
      expect(linksResponse.body[0].clickCount).toBe(3);
      expect(linksResponse.body[1].shortCode).toBe(response3.body.shortCode);
      expect(linksResponse.body[1].clickCount).toBe(2);
      expect(linksResponse.body[2].shortCode).toBe(response1.body.shortCode);
      expect(linksResponse.body[2].clickCount).toBe(1);
    });
  });

  describe('DELETE /api/links/:shortCode', () => {
    test('should delete an existing link', async () => {
      // Create a link
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com' });

      const { shortCode } = createResponse.body;

      // Delete the link
      await request(app)
        .delete(`/api/links/${shortCode}`)
        .expect(204);

      // Verify it's deleted
      const linksResponse = await request(app)
        .get('/api/links')
        .expect(200);

      expect(linksResponse.body.find(l => l.shortCode === shortCode)).toBeUndefined();
    });

    test('should return 404 when deleting non-existent link', async () => {
      const response = await request(app)
        .delete('/api/links/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Short code not found');
    });

    test('should not be accessible via GET after deletion', async () => {
      // Create a link
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com' });

      const { shortCode } = createResponse.body;

      // Delete the link
      await request(app)
        .delete(`/api/links/${shortCode}`)
        .expect(204);

      // Try to access it
      await request(app)
        .get(`/${shortCode}`)
        .expect(404);
    });
  });

  describe('Integration tests', () => {
    test('complete workflow: create, access, view stats, delete', async () => {
      // Create a link
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://www.github.com',
          customAlias: 'github'
        })
        .expect(201);

      expect(createResponse.body.shortCode).toBe('github');

      // Access it twice
      await request(app).get('/github').expect(302);
      await request(app).get('/github').expect(302);

      // View all links
      const linksResponse = await request(app)
        .get('/api/links')
        .expect(200);

      expect(linksResponse.body).toHaveLength(1);
      expect(linksResponse.body[0].clickCount).toBe(2);

      // Delete it
      await request(app)
        .delete('/api/links/github')
        .expect(204);

      // Verify deletion
      const finalLinksResponse = await request(app)
        .get('/api/links')
        .expect(200);

      expect(finalLinksResponse.body).toHaveLength(0);
    });

    test('should handle multiple concurrent link creations', async () => {
      const urls = [
        'https://www.google.com',
        'https://www.facebook.com',
        'https://www.twitter.com',
        'https://www.linkedin.com',
        'https://www.instagram.com'
      ];

      const promises = urls.map(url =>
        request(app).post('/api/shorten').send({ url })
      );

      const responses = await Promise.all(promises);

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // All short codes should be unique
      const shortCodes = responses.map(r => r.body.shortCode);
      const uniqueShortCodes = new Set(shortCodes);
      expect(uniqueShortCodes.size).toBe(urls.length);
    });
  });
});
