const request = require('supertest');
const app = require('./server');

describe('URL Shortener API', () => {
  let testShortCode;

  describe('POST /api/shorten', () => {
    it('should create a shortened URL with a generated code', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com' })
        .expect(201);

      expect(response.body).toHaveProperty('shortCode');
      expect(response.body).toHaveProperty('originalUrl', 'https://www.example.com');
      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body.shortCode).toHaveLength(6);

      testShortCode = response.body.shortCode;
    });

    it('should create a shortened URL with a custom alias', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://www.google.com',
          customAlias: 'google'
        })
        .expect(201);

      expect(response.body.shortCode).toBe('google');
      expect(response.body.originalUrl).toBe('https://www.google.com');
    });

    it('should return 409 if custom alias is already taken', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://www.test.com',
          customAlias: 'duplicate'
        })
        .expect(201);

      const response = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://www.another.com',
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

    it('should return 400 if URL format is invalid', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'not-a-valid-url' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });

    it('should reject non-http(s) protocols', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'ftp://example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });

    it('should accept http URLs', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'http://www.example.com' })
        .expect(201);

      expect(response.body.originalUrl).toBe('http://www.example.com');
    });

    it('should accept https URLs', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com/path?query=value' })
        .expect(201);

      expect(response.body.originalUrl).toBe('https://www.example.com/path?query=value');
    });
  });

  describe('GET /:shortCode', () => {
    let redirectShortCode;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.redirect-test.com' });
      redirectShortCode = response.body.shortCode;
    });

    it('should redirect to the original URL', async () => {
      const response = await request(app)
        .get(`/${redirectShortCode}`)
        .expect(302);

      expect(response.headers.location).toBe('https://www.redirect-test.com');
    });

    it('should increment click count on redirect', async () => {
      await request(app)
        .get(`/${redirectShortCode}`)
        .expect(302);

      await request(app)
        .get(`/${redirectShortCode}`)
        .expect(302);

      const linksResponse = await request(app)
        .get('/api/links')
        .expect(200);

      const link = linksResponse.body.find(l => l.shortCode === redirectShortCode);
      expect(link.clickCount).toBeGreaterThanOrEqual(2);
    });

    it('should return 404 for unknown short code', async () => {
      const response = await request(app)
        .get('/XXXXXX')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Short code not found');
    });
  });

  describe('GET /api/links', () => {
    it('should return all links', async () => {
      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return links sorted by clickCount descending', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.sort-test1.com', customAlias: 'sort1' });

      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.sort-test2.com', customAlias: 'sort2' });

      await request(app).get('/sort1');
      await request(app).get('/sort1');
      await request(app).get('/sort1');
      
      await request(app).get('/sort2');

      const response = await request(app)
        .get('/api/links')
        .expect(200);

      const sort1Index = response.body.findIndex(l => l.shortCode === 'sort1');
      const sort2Index = response.body.findIndex(l => l.shortCode === 'sort2');

      expect(sort1Index).toBeLessThan(sort2Index);
    });

    it('should include all link properties', async () => {
      const response = await request(app)
        .get('/api/links')
        .expect(200);

      const link = response.body[0];
      expect(link).toHaveProperty('shortCode');
      expect(link).toHaveProperty('originalUrl');
      expect(link).toHaveProperty('createdAt');
      expect(link).toHaveProperty('clickCount');
    });
  });

  describe('DELETE /api/links/:shortCode', () => {
    let deleteTestCode;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.delete-test.com' });
      deleteTestCode = response.body.shortCode;
    });

    it('should delete a shortened link', async () => {
      await request(app)
        .delete(`/api/links/${deleteTestCode}`)
        .expect(204);

      await request(app)
        .get(`/${deleteTestCode}`)
        .expect(404);
    });

    it('should return 404 for non-existent short code', async () => {
      const response = await request(app)
        .delete('/api/links/NONEXISTENT')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Short code not found');
    });

    it('should not be accessible after deletion', async () => {
      await request(app)
        .delete(`/api/links/${deleteTestCode}`)
        .expect(204);

      const linksResponse = await request(app)
        .get('/api/links')
        .expect(200);

      const deletedLink = linksResponse.body.find(l => l.shortCode === deleteTestCode);
      expect(deletedLink).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle URLs with special characters', async () => {
      const complexUrl = 'https://example.com/path?query=value&other=test#fragment';
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: complexUrl })
        .expect(201);

      expect(response.body.originalUrl).toBe(complexUrl);
    });

    it('should handle long URLs', async () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(1000);
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: longUrl })
        .expect(201);

      expect(response.body.originalUrl).toBe(longUrl);
    });

    it('should handle custom aliases with special characters', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com',
          customAlias: 'test-123_ABC'
        })
        .expect(201);

      expect(response.body.shortCode).toBe('test-123_ABC');
    });
  });
});
