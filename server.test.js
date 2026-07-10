const request = require('supertest');
const app = require('./server');

describe('URL Shortener API', () => {
  describe('POST /api/shorten', () => {
    it('should create a shortened URL with auto-generated code', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/test' })
        .expect(201);

      expect(response.body).toHaveProperty('shortCode');
      expect(response.body).toHaveProperty('originalUrl', 'https://example.com/test');
      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body.shortCode).toHaveLength(6);
    });

    it('should create a shortened URL with custom alias', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com/custom',
          customAlias: 'mylink'
        })
        .expect(201);

      expect(response.body.shortCode).toBe('mylink');
      expect(response.body.originalUrl).toBe('https://example.com/custom');
    });

    it('should return 400 if URL is missing', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('URL is required');
    });

    it('should return 400 if URL is invalid', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'not-a-valid-url' })
        .expect(400);

      expect(response.body.error).toBe('Invalid URL format');
    });

    it('should return 409 if custom alias already exists', async () => {
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

      expect(response.body.error).toBe('Short code already exists');
    });

    it('should accept URLs with http protocol', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'http://example.com/test' })
        .expect(201);

      expect(response.body.originalUrl).toBe('http://example.com/test');
    });

    it('should reject URLs with invalid protocols', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'ftp://example.com/test' })
        .expect(400);

      expect(response.body.error).toBe('Invalid URL format');
    });
  });

  describe('GET /:shortCode', () => {
    it('should redirect to original URL and increment click count', async () => {
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com/redirect-test',
          customAlias: 'redirect1'
        })
        .expect(201);

      const shortCode = createResponse.body.shortCode;

      const redirectResponse = await request(app)
        .get(`/${shortCode}`)
        .expect(302);

      expect(redirectResponse.headers.location).toBe('https://example.com/redirect-test');

      const linksResponse = await request(app)
        .get('/api/links')
        .expect(200);

      const link = linksResponse.body.find(l => l.shortCode === shortCode);
      expect(link.clickCount).toBe(1);
    });

    it('should return 404 for non-existent short code', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.body.error).toBe('Short code not found');
    });

    it('should increment click count on multiple visits', async () => {
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com/multi-click',
          customAlias: 'multiclick'
        })
        .expect(201);

      const shortCode = createResponse.body.shortCode;

      await request(app).get(`/${shortCode}`).expect(302);
      await request(app).get(`/${shortCode}`).expect(302);
      await request(app).get(`/${shortCode}`).expect(302);

      const linksResponse = await request(app)
        .get('/api/links')
        .expect(200);

      const link = linksResponse.body.find(l => l.shortCode === shortCode);
      expect(link.clickCount).toBe(3);
    });
  });

  describe('GET /api/links', () => {
    it('should return empty array when no links exist', async () => {
      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return all links sorted by click count', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com/link1',
          customAlias: 'link1'
        });

      await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com/link2',
          customAlias: 'link2'
        });

      await request(app).get('/link2');
      await request(app).get('/link2');
      await request(app).get('/link1');

      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(response.body.length).toBeGreaterThanOrEqual(2);
      
      const link1 = response.body.find(l => l.shortCode === 'link1');
      const link2 = response.body.find(l => l.shortCode === 'link2');
      
      expect(link1.clickCount).toBe(1);
      expect(link2.clickCount).toBe(2);
      
      expect(response.body[0].clickCount).toBeGreaterThanOrEqual(response.body[1].clickCount);
    });

    it('should include all required fields for each link', async () => {
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/fields-test' });

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
    it('should delete an existing link', async () => {
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com/to-delete',
          customAlias: 'todelete'
        })
        .expect(201);

      const shortCode = createResponse.body.shortCode;

      await request(app)
        .delete(`/api/links/${shortCode}`)
        .expect(204);

      await request(app)
        .get(`/${shortCode}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent link', async () => {
      const response = await request(app)
        .delete('/api/links/nonexistent')
        .expect(404);

      expect(response.body.error).toBe('Short code not found');
    });

    it('should actually remove the link from storage', async () => {
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ 
          url: 'https://example.com/remove-test',
          customAlias: 'removetest'
        })
        .expect(201);

      const shortCode = createResponse.body.shortCode;

      const beforeDelete = await request(app)
        .get('/api/links')
        .expect(200);

      const beforeCount = beforeDelete.body.length;

      await request(app)
        .delete(`/api/links/${shortCode}`)
        .expect(204);

      const afterDelete = await request(app)
        .get('/api/links')
        .expect(200);

      const afterCount = afterDelete.body.length;
      expect(afterCount).toBe(beforeCount - 1);
    });
  });
});
