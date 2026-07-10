const request = require('supertest');
const app = require('./server');

describe('URL Shortener API', () => {
  let testShortCode;

  describe('POST /api/shorten', () => {
    test('should shorten a valid URL', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com' })
        .expect(201);

      expect(response.body).toHaveProperty('shortCode');
      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body).toHaveProperty('originalUrl', 'https://www.example.com');
      expect(response.body.shortCode).toHaveLength(6);
      
      testShortCode = response.body.shortCode;
    });

    test('should accept a custom alias', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com', customAlias: 'mycustom' })
        .expect(201);

      expect(response.body.shortCode).toBe('mycustom');
    });

    test('should return 409 if custom alias already exists', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com', customAlias: 'duplicate' });

      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.other.com', customAlias: 'duplicate' })
        .expect(409);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 if URL is missing', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 if URL format is invalid', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'not-a-valid-url' })
        .expect(400);

      expect(response.body.error).toContain('Invalid URL');
    });

    test('should reject non-http(s) protocols', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'ftp://example.com' })
        .expect(400);

      expect(response.body.error).toContain('Invalid URL');
    });
  });

  describe('GET /:shortCode', () => {
    test('should redirect to original URL', async () => {
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.redirect-test.com' });

      const shortCode = createResponse.body.shortCode;

      const response = await request(app)
        .get(`/${shortCode}`)
        .expect(302);

      expect(response.headers.location).toBe('https://www.redirect-test.com');
    });

    test('should increment click count', async () => {
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.click-test.com' });

      const shortCode = createResponse.body.shortCode;

      await request(app).get(`/${shortCode}`);
      await request(app).get(`/${shortCode}`);

      const linksResponse = await request(app).get('/api/links');
      const link = linksResponse.body.find(l => l.shortCode === shortCode);

      expect(link.clickCount).toBe(2);
    });

    test('should return 404 for unknown short code', async () => {
      const response = await request(app)
        .get('/XXXXXX')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('should handle favicon.ico gracefully', async () => {
      await request(app)
        .get('/favicon.ico')
        .expect(204);
    });
  });

  describe('GET /api/links', () => {
    test('should return empty array when no links exist', async () => {
      const app2 = require('./server');
      const response = await request(app2)
        .get('/api/links')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should return all shortened links', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.test1.com' });

      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.test2.com' });

      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    test('should return links sorted by click count descending', async () => {
      const link1 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.sort1.com' });

      const link2 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.sort2.com' });

      await request(app).get(`/${link2.body.shortCode}`);
      await request(app).get(`/${link2.body.shortCode}`);
      await request(app).get(`/${link2.body.shortCode}`);

      await request(app).get(`/${link1.body.shortCode}`);

      const response = await request(app).get('/api/links');

      const idx1 = response.body.findIndex(l => l.shortCode === link1.body.shortCode);
      const idx2 = response.body.findIndex(l => l.shortCode === link2.body.shortCode);

      expect(idx2).toBeLessThan(idx1);
    });
  });

  describe('DELETE /api/links/:shortCode', () => {
    test('should delete a shortened link', async () => {
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.delete-test.com' });

      const shortCode = createResponse.body.shortCode;

      await request(app)
        .delete(`/api/links/${shortCode}`)
        .expect(204);

      await request(app)
        .get(`/${shortCode}`)
        .expect(404);
    });

    test('should return 404 for non-existent short code', async () => {
      const response = await request(app)
        .delete('/api/links/NONEXIST')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('should prevent access to deleted link', async () => {
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.delete-access.com' });

      const shortCode = createResponse.body.shortCode;

      await request(app).delete(`/api/links/${shortCode}`);

      await request(app)
        .get(`/${shortCode}`)
        .expect(404);
    });
  });

  describe('Edge cases', () => {
    test('should handle URLs with query parameters', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com?param=value&other=123' })
        .expect(201);

      expect(response.body.originalUrl).toBe('https://www.example.com?param=value&other=123');
    });

    test('should handle URLs with fragments', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com#section' })
        .expect(201);

      expect(response.body.originalUrl).toBe('https://www.example.com#section');
    });

    test('should generate unique random codes', async () => {
      const codes = new Set();
      
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .post('/api/shorten')
          .send({ url: `https://www.test${i}.com` });
        
        codes.add(response.body.shortCode);
      }

      expect(codes.size).toBe(10);
    });
  });
});
