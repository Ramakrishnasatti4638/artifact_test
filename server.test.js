const request = require('supertest');
const { app, links } = require('./server');

describe('URL Shortener API', () => {
  beforeEach(() => {
    links.clear();
  });

  describe('POST /api/shorten', () => {
    it('should shorten a valid URL', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' })
        .expect(201);

      expect(response.body).toHaveProperty('shortCode');
      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body).toHaveProperty('originalUrl', 'https://example.com');
      expect(response.body.shortCode).toHaveLength(6);
    });

    it('should accept a custom alias', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com', customAlias: 'custom' })
        .expect(201);

      expect(response.body.shortCode).toBe('custom');
    });

    it('should return 409 if custom alias already exists', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com', customAlias: 'custom' })
        .expect(201);

      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://another.com', customAlias: 'custom' })
        .expect(409);

      expect(response.body.error).toBe('Custom alias already taken');
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

    it('should reject non-http(s) protocols', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'ftp://example.com' })
        .expect(400);

      expect(response.body.error).toBe('Invalid URL format');
    });
  });

  describe('GET /:shortCode', () => {
    it('should redirect to original URL', async () => {
      const shortenResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com', customAlias: 'test' });

      const response = await request(app)
        .get('/test')
        .expect(302);

      expect(response.headers.location).toBe('https://example.com');
    });

    it('should increment click count', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com', customAlias: 'test' });

      await request(app).get('/test');
      await request(app).get('/test');
      await request(app).get('/test');

      const linksResponse = await request(app).get('/api/links');
      const link = linksResponse.body.find(l => l.shortCode === 'test');
      expect(link.clickCount).toBe(3);
    });

    it('should return 404 for unknown short code', async () => {
      const response = await request(app)
        .get('/unknown')
        .expect(404);

      expect(response.body.error).toBe('Short code not found');
    });

    it('should handle favicon.ico gracefully', async () => {
      await request(app)
        .get('/favicon.ico')
        .expect(204);
    });
  });

  describe('GET /api/links', () => {
    it('should return empty array when no links exist', async () => {
      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all shortened links', async () => {
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
      expect(response.body[0]).toHaveProperty('clickCount');
    });

    it('should return links sorted by click count descending', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example1.com', customAlias: 'link1' });

      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example2.com', customAlias: 'link2' });

      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example3.com', customAlias: 'link3' });

      await request(app).get('/link1');
      
      await request(app).get('/link2');
      await request(app).get('/link2');

      await request(app).get('/link3');
      await request(app).get('/link3');
      await request(app).get('/link3');

      const response = await request(app).get('/api/links');

      expect(response.body[0].shortCode).toBe('link3');
      expect(response.body[0].clickCount).toBe(3);
      expect(response.body[1].shortCode).toBe('link2');
      expect(response.body[1].clickCount).toBe(2);
      expect(response.body[2].shortCode).toBe('link1');
      expect(response.body[2].clickCount).toBe(1);
    });
  });

  describe('DELETE /api/links/:shortCode', () => {
    it('should delete a shortened link', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com', customAlias: 'test' });

      await request(app)
        .delete('/api/links/test')
        .expect(204);

      const response = await request(app).get('/api/links');
      expect(response.body).toHaveLength(0);
    });

    it('should return 404 for non-existent short code', async () => {
      const response = await request(app)
        .delete('/api/links/nonexistent')
        .expect(404);

      expect(response.body.error).toBe('Short code not found');
    });

    it('should prevent access to deleted link', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com', customAlias: 'test' });

      await request(app).delete('/api/links/test');

      await request(app)
        .get('/test')
        .expect(404);
    });
  });

  describe('Edge cases', () => {
    it('should handle URLs with query parameters', async () => {
      const url = 'https://example.com/page?param=value&other=123';
      const response = await request(app)
        .post('/api/shorten')
        .send({ url })
        .expect(201);

      expect(response.body.originalUrl).toBe(url);
    });

    it('should handle URLs with fragments', async () => {
      const url = 'https://example.com/page#section';
      const response = await request(app)
        .post('/api/shorten')
        .send({ url })
        .expect(201);

      expect(response.body.originalUrl).toBe(url);
    });

    it('should generate unique random codes', async () => {
      const codes = new Set();
      
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .post('/api/shorten')
          .send({ url: `https://example${i}.com` });
        codes.add(response.body.shortCode);
      }

      expect(codes.size).toBe(10);
    });
  });
});
