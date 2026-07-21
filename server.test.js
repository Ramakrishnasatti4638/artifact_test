const request = require('supertest');
const { app, linksStore } = require('./server');

describe('URL Shortener API', () => {
  beforeEach(() => {
    linksStore.clear();
  });

  describe('POST /api/shorten', () => {
    it('should create a shortened URL with random code', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' })
        .expect(201);

      expect(response.body).toHaveProperty('shortCode');
      expect(response.body).toHaveProperty('originalUrl', 'https://example.com');
      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body.shortCode).toHaveLength(6);
      expect(response.body.shortUrl).toContain(response.body.shortCode);
    });

    it('should create a shortened URL with custom alias', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com',
          customAlias: 'mycustom'
        })
        .expect(201);

      expect(response.body.shortCode).toBe('mycustom');
      expect(response.body.originalUrl).toBe('https://example.com');
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

    it('should return 400 for non-http/https URLs', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'ftp://example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });

    it('should return 409 if custom alias already exists', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com',
          customAlias: 'taken'
        });

      const response = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://another.com',
          customAlias: 'taken'
        })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Alias already taken');
    });

    it('should handle multiple URLs with random codes', async () => {
      const response1 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example1.com' })
        .expect(201);

      const response2 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example2.com' })
        .expect(201);

      expect(response1.body.shortCode).not.toBe(response2.body.shortCode);
      expect(linksStore.size).toBe(2);
    });
  });

  describe('GET /:shortCode', () => {
    it('should redirect to original URL and increment click count', async () => {
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' });

      const shortCode = createResponse.body.shortCode;

      const response = await request(app)
        .get(`/${shortCode}`)
        .expect(302);

      expect(response.headers.location).toBe('https://example.com');

      const linkData = linksStore.get(shortCode);
      expect(linkData.clickCount).toBe(1);
    });

    it('should increment click count on multiple redirects', async () => {
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' });

      const shortCode = createResponse.body.shortCode;

      await request(app).get(`/${shortCode}`).expect(302);
      await request(app).get(`/${shortCode}`).expect(302);
      await request(app).get(`/${shortCode}`).expect(302);

      const linkData = linksStore.get(shortCode);
      expect(linkData.clickCount).toBe(3);
    });

    it('should return 404 for unknown short code', async () => {
      await request(app)
        .get('/nonexistent')
        .expect(404);
    });

    it('should not interfere with API routes', async () => {
      await request(app)
        .get('/api')
        .expect(404);
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
        .send({ url: 'https://example1.com' });

      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example2.com' });

      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('shortCode');
      expect(response.body[0]).toHaveProperty('originalUrl');
      expect(response.body[0]).toHaveProperty('createdAt');
      expect(response.body[0]).toHaveProperty('clickCount');
    });

    it('should return links sorted by click count desc', async () => {
      const response1 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example1.com' });

      const response2 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example2.com' });

      const response3 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example3.com' });

      await request(app).get(`/${response1.body.shortCode}`);
      await request(app).get(`/${response2.body.shortCode}`);
      await request(app).get(`/${response2.body.shortCode}`);
      await request(app).get(`/${response3.body.shortCode}`);
      await request(app).get(`/${response3.body.shortCode}`);
      await request(app).get(`/${response3.body.shortCode}`);

      const linksResponse = await request(app)
        .get('/api/links')
        .expect(200);

      expect(linksResponse.body[0].clickCount).toBe(3);
      expect(linksResponse.body[1].clickCount).toBe(2);
      expect(linksResponse.body[2].clickCount).toBe(1);
    });
  });

  describe('DELETE /api/links/:shortCode', () => {
    it('should delete a shortened link', async () => {
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' });

      const shortCode = createResponse.body.shortCode;

      await request(app)
        .delete(`/api/links/${shortCode}`)
        .expect(204);

      expect(linksStore.has(shortCode)).toBe(false);
    });

    it('should return 404 when deleting non-existent link', async () => {
      const response = await request(app)
        .delete('/api/links/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Short code not found');
    });

    it('should remove link from GET /api/links after deletion', async () => {
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' });

      const shortCode = createResponse.body.shortCode;

      let linksResponse = await request(app)
        .get('/api/links')
        .expect(200);
      expect(linksResponse.body).toHaveLength(1);

      await request(app)
        .delete(`/api/links/${shortCode}`)
        .expect(204);

      linksResponse = await request(app)
        .get('/api/links')
        .expect(200);
      expect(linksResponse.body).toHaveLength(0);
    });

    it('should return 404 when accessing deleted short code', async () => {
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' });

      const shortCode = createResponse.body.shortCode;

      await request(app)
        .delete(`/api/links/${shortCode}`)
        .expect(204);

      await request(app)
        .get(`/${shortCode}`)
        .expect(404);
    });
  });

  describe('Integration tests', () => {
    it('should handle complete workflow: create, redirect, view stats, delete', async () => {
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com', customAlias: 'test123' })
        .expect(201);

      expect(createResponse.body.shortCode).toBe('test123');

      await request(app)
        .get('/test123')
        .expect(302);

      await request(app)
        .get('/test123')
        .expect(302);

      const linksResponse = await request(app)
        .get('/api/links')
        .expect(200);

      expect(linksResponse.body).toHaveLength(1);
      expect(linksResponse.body[0].clickCount).toBe(2);

      await request(app)
        .delete('/api/links/test123')
        .expect(204);

      const emptyLinksResponse = await request(app)
        .get('/api/links')
        .expect(200);

      expect(emptyLinksResponse.body).toHaveLength(0);
    });
  });
});
