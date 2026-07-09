const request = require('supertest');
const app = require('./server');

const server = require('./server');

describe('URL Shortener API', () => {
  beforeEach(() => {
    // Clear the links map before each test
    server.links.clear();
  });

  describe('POST /api/shorten', () => {
    it('should create a shortened URL with auto-generated code', async () => {
      const response = await request(server)
        .post('/api/shorten')
        .send({ url: 'https://example.com/very-long-url' })
        .expect(201);

      expect(response.body).toHaveProperty('shortCode');
      expect(response.body).toHaveProperty('originalUrl', 'https://example.com/very-long-url');
      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body.shortCode).toHaveLength(6);
    });

    it('should create a shortened URL with custom alias', async () => {
      const response = await request(server)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com/custom',
          customAlias: 'mycustom'
        })
        .expect(201);

      expect(response.body.shortCode).toBe('mycustom');
      expect(response.body.originalUrl).toBe('https://example.com/custom');
    });

    it('should return 409 if custom alias already exists', async () => {
      await request(server)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com/first',
          customAlias: 'taken'
        })
        .expect(201);

      const response = await request(server)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com/second',
          customAlias: 'taken'
        })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Alias already taken');
    });

    it('should return 400 if URL is missing', async () => {
      const response = await request(server)
        .post('/api/shorten')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'URL is required');
    });

    it('should return 400 if URL format is invalid', async () => {
      const response = await request(server)
        .post('/api/shorten')
        .send({ url: 'not-a-valid-url' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });

    it('should reject URLs with invalid protocols', async () => {
      const response = await request(server)
        .post('/api/shorten')
        .send({ url: 'ftp://example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });
  });

  describe('GET /:shortCode', () => {
    it('should redirect to original URL and increment click count', async () => {
      const createResponse = await request(server)
        .post('/api/shorten')
        .send({ url: 'https://example.com/target' });

      const shortCode = createResponse.body.shortCode;

      const response = await request(server)
        .get(`/${shortCode}`)
        .expect(302);

      expect(response.headers.location).toBe('https://example.com/target');

      // Verify click count incremented
      const linksResponse = await request(server)
        .get('/api/links')
        .expect(200);

      const link = linksResponse.body.find(l => l.shortCode === shortCode);
      expect(link.clickCount).toBe(1);
    });

    it('should return 404 for non-existent short code', async () => {
      await request(server)
        .get('/nonexistent')
        .expect(404);
    });

    it('should increment click count on multiple visits', async () => {
      const createResponse = await request(server)
        .post('/api/shorten')
        .send({ url: 'https://example.com/multi' });

      const shortCode = createResponse.body.shortCode;

      await request(server).get(`/${shortCode}`).expect(302);
      await request(server).get(`/${shortCode}`).expect(302);
      await request(server).get(`/${shortCode}`).expect(302);

      const linksResponse = await request(server).get('/api/links');
      const link = linksResponse.body.find(l => l.shortCode === shortCode);
      expect(link.clickCount).toBe(3);
    });
  });

  describe('GET /api/links', () => {
    it('should return empty array when no links exist', async () => {
      const response = await request(server)
        .get('/api/links')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all links with stats', async () => {
      await request(server)
        .post('/api/shorten')
        .send({ url: 'https://example.com/first' });

      await request(server)
        .post('/api/shorten')
        .send({ url: 'https://example.com/second' });

      const response = await request(server)
        .get('/api/links')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('shortCode');
      expect(response.body[0]).toHaveProperty('originalUrl');
      expect(response.body[0]).toHaveProperty('clickCount');
      expect(response.body[0]).toHaveProperty('createdAt');
    });

    it('should return links sorted by click count descending', async () => {
      const res1 = await request(server)
        .post('/api/shorten')
        .send({ url: 'https://example.com/one' });

      const res2 = await request(server)
        .post('/api/shorten')
        .send({ url: 'https://example.com/two' });

      const res3 = await request(server)
        .post('/api/shorten')
        .send({ url: 'https://example.com/three' });

      // Click links different amounts
      await request(server).get(`/${res1.body.shortCode}`);
      
      await request(server).get(`/${res2.body.shortCode}`);
      await request(server).get(`/${res2.body.shortCode}`);
      await request(server).get(`/${res2.body.shortCode}`);
      
      await request(server).get(`/${res3.body.shortCode}`);
      await request(server).get(`/${res3.body.shortCode}`);

      const response = await request(server).get('/api/links');

      expect(response.body[0].clickCount).toBe(3);
      expect(response.body[1].clickCount).toBe(2);
      expect(response.body[2].clickCount).toBe(1);
    });
  });

  describe('DELETE /api/links/:shortCode', () => {
    it('should delete an existing link', async () => {
      const createResponse = await request(server)
        .post('/api/shorten')
        .send({ url: 'https://example.com/delete-me' });

      const shortCode = createResponse.body.shortCode;

      await request(server)
        .delete(`/api/links/${shortCode}`)
        .expect(204);

      // Verify link is gone
      const linksResponse = await request(server).get('/api/links');
      const link = linksResponse.body.find(l => l.shortCode === shortCode);
      expect(link).toBeUndefined();
    });

    it('should return 404 when deleting non-existent link', async () => {
      const response = await request(server)
        .delete('/api/links/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Short code not found');
    });

    it('should not allow accessing deleted link', async () => {
      const createResponse = await request(server)
        .post('/api/shorten')
        .send({ url: 'https://example.com/gone' });

      const shortCode = createResponse.body.shortCode;

      await request(server)
        .delete(`/api/links/${shortCode}`)
        .expect(204);

      await request(server)
        .get(`/${shortCode}`)
        .expect(404);
    });
  });
});
