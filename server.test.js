const request = require('supertest');
const app = require('./server');

describe('URL Shortener API', () => {
  describe('POST /api/shorten', () => {
    it('should create a shortened URL with valid URL', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com' })
        .expect(201);

      expect(response.body).toHaveProperty('shortCode');
      expect(response.body).toHaveProperty('originalUrl', 'https://www.example.com');
      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body.shortCode).toHaveLength(6);
    });

    it('should create a shortened URL with custom alias', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com', customAlias: 'custom' })
        .expect(201);

      expect(response.body.shortCode).toBe('custom');
    });

    it('should return 400 for missing URL', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'URL is required');
    });

    it('should return 400 for invalid URL format', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'not-a-valid-url' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });

    it('should return 400 for non-http(s) protocols', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'ftp://example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });

    it('should return 409 when custom alias already exists', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com', customAlias: 'duplicate' })
        .expect(201);

      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.google.com', customAlias: 'duplicate' })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Alias already taken');
    });
  });

  describe('GET /:shortCode', () => {
    it('should redirect to original URL', async () => {
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com', customAlias: 'redirect1' });

      const response = await request(app)
        .get('/redirect1')
        .expect(302);

      expect(response.header.location).toBe('https://www.example.com');
    });

    it('should increment click count on redirect', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com', customAlias: 'clicks1' });

      await request(app).get('/clicks1').expect(302);
      await request(app).get('/clicks1').expect(302);

      const linksResponse = await request(app).get('/api/links');
      const link = linksResponse.body.find(l => l.shortCode === 'clicks1');
      
      expect(link.clickCount).toBe(2);
    });

    it('should return 404 for unknown short code', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Short URL not found');
    });
  });

  describe('GET /api/links', () => {
    it('should return all links sorted by click count', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com', customAlias: 'link1' });

      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.google.com', customAlias: 'link2' });

      await request(app).get('/link2').expect(302);
      await request(app).get('/link2').expect(302);
      await request(app).get('/link1').expect(302);

      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      
      const link1 = response.body.find(l => l.shortCode === 'link1');
      const link2 = response.body.find(l => l.shortCode === 'link2');
      
      expect(link1).toBeDefined();
      expect(link2).toBeDefined();
      expect(link1.clickCount).toBe(1);
      expect(link2.clickCount).toBe(2);

      // Verify sorted by click count descending
      const link2Index = response.body.findIndex(l => l.shortCode === 'link2');
      const link1Index = response.body.findIndex(l => l.shortCode === 'link1');
      expect(link2Index).toBeLessThan(link1Index);
    });

    it('should return empty array when no links exist', async () => {
      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('DELETE /api/links/:shortCode', () => {
    it('should delete an existing link', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com', customAlias: 'todelete' });

      await request(app)
        .delete('/api/links/todelete')
        .expect(204);

      await request(app)
        .get('/todelete')
        .expect(404);
    });

    it('should return 404 when deleting non-existent link', async () => {
      const response = await request(app)
        .delete('/api/links/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Link not found');
    });
  });

  describe('Link data structure', () => {
    it('should store all required fields', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com', customAlias: 'structure' });

      const response = await request(app).get('/api/links');
      const link = response.body.find(l => l.shortCode === 'structure');

      expect(link).toHaveProperty('shortCode', 'structure');
      expect(link).toHaveProperty('originalUrl', 'https://www.example.com');
      expect(link).toHaveProperty('createdAt');
      expect(link).toHaveProperty('clickCount', 0);
      expect(new Date(link.createdAt)).toBeInstanceOf(Date);
    });
  });
});
