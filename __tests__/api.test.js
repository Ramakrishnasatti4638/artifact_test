const request = require('supertest');
const app = require('../server');

describe('URL Shortener API', () => {
  
  describe('POST /api/shorten', () => {
    
    test('should create a shortened URL with random code', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('shortCode');
      expect(response.body).toHaveProperty('originalUrl', 'https://example.com');
      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body.shortCode).toHaveLength(6);
    });

    test('should create a shortened URL with custom alias', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com', customAlias: 'my-link' });

      expect(response.status).toBe(201);
      expect(response.body.shortCode).toBe('my-link');
      expect(response.body.originalUrl).toBe('https://example.com');
    });

    test('should return 400 if URL is missing', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'URL is required');
    });

    test('should return 400 if URL format is invalid', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'not-a-valid-url' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });

    test('should return 400 for non-http(s) protocols', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'ftp://example.com' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });

    test('should return 409 if custom alias is already taken', async () => {
      // Create first link with alias
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com', customAlias: 'taken-alias' });

      // Try to create second link with same alias
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://another.com', customAlias: 'taken-alias' });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error', 'Custom alias already taken');
    });

    test('should accept valid HTTP URL', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'http://example.com' });

      expect(response.status).toBe(201);
      expect(response.body.originalUrl).toBe('http://example.com');
    });

    test('should accept valid HTTPS URL', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/path?query=value' });

      expect(response.status).toBe(201);
      expect(response.body.originalUrl).toBe('https://example.com/path?query=value');
    });
  });

  describe('GET /:shortCode', () => {
    
    test('should redirect to original URL', async () => {
      // Create a shortened URL first
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://redirect-test.com', customAlias: 'redirect-me' });

      const shortCode = createResponse.body.shortCode;

      // Test redirect
      const response = await request(app)
        .get(`/${shortCode}`)
        .redirects(0);

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('https://redirect-test.com');
    });

    test('should increment click count on redirect', async () => {
      // Create a shortened URL
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://click-test.com', customAlias: 'click-me' });

      const shortCode = createResponse.body.shortCode;

      // Get initial click count (should be 0)
      let linksResponse = await request(app).get('/api/links');
      let link = linksResponse.body.find(l => l.shortCode === shortCode);
      expect(link.clickCount).toBe(0);

      // Click the link twice
      await request(app).get(`/${shortCode}`).redirects(0);
      await request(app).get(`/${shortCode}`).redirects(0);

      // Check updated click count
      linksResponse = await request(app).get('/api/links');
      link = linksResponse.body.find(l => l.shortCode === shortCode);
      expect(link.clickCount).toBe(2);
    });

    test('should return 404 for unknown short code', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .redirects(0);

      expect(response.status).toBe(404);
      expect(response.text).toBe('Short code not found');
    });

    test('should not treat api routes as short codes', async () => {
      const response = await request(app)
        .get('/api')
        .redirects(0);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/links', () => {
    
    test('should return all links', async () => {
      // Create multiple links
      await request(app).post('/api/shorten').send({ url: 'https://link1.com', customAlias: 'link1' });
      await request(app).post('/api/shorten').send({ url: 'https://link2.com', customAlias: 'link2' });

      const response = await request(app).get('/api/links');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    test('should return links sorted by click count descending', async () => {
      // Create links with different click counts
      await request(app).post('/api/shorten').send({ url: 'https://low-clicks.com', customAlias: 'low-clicks' });
      await request(app).post('/api/shorten').send({ url: 'https://high-clicks.com', customAlias: 'high-clicks' });

      // Click the second link multiple times
      await request(app).get('/high-clicks').redirects(0);
      await request(app).get('/high-clicks').redirects(0);
      await request(app).get('/high-clicks').redirects(0);

      const response = await request(app).get('/api/links');

      expect(response.status).toBe(200);
      const links = response.body;
      
      // Find our test links
      const highClicksLink = links.find(l => l.shortCode === 'high-clicks');
      const lowClicksLink = links.find(l => l.shortCode === 'low-clicks');
      
      // High clicks link should appear before low clicks link
      const highClicksIndex = links.indexOf(highClicksLink);
      const lowClicksIndex = links.indexOf(lowClicksLink);
      expect(highClicksIndex).toBeLessThan(lowClicksIndex);
    });

    test('should return link objects with all required fields', async () => {
      await request(app).post('/api/shorten').send({ url: 'https://full-fields.com', customAlias: 'full-fields' });

      const response = await request(app).get('/api/links');
      const link = response.body.find(l => l.shortCode === 'full-fields');

      expect(link).toHaveProperty('shortCode');
      expect(link).toHaveProperty('originalUrl');
      expect(link).toHaveProperty('createdAt');
      expect(link).toHaveProperty('clickCount');
      expect(typeof link.clickCount).toBe('number');
    });
  });

  describe('DELETE /api/links/:shortCode', () => {
    
    test('should delete a shortened link', async () => {
      // Create a link
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://delete-me.com', customAlias: 'delete-me' });

      const shortCode = createResponse.body.shortCode;

      // Delete the link
      const deleteResponse = await request(app)
        .delete(`/api/links/${shortCode}`);

      expect(deleteResponse.status).toBe(204);

      // Verify it's deleted
      const getResponse = await request(app).get(`/${shortCode}`).redirects(0);
      expect(getResponse.status).toBe(404);
    });

    test('should return 404 when deleting non-existent link', async () => {
      const response = await request(app)
        .delete('/api/links/does-not-exist');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Short code not found');
    });

    test('should remove link from links list after deletion', async () => {
      // Create a link
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://remove-from-list.com', customAlias: 'remove-list' });

      // Verify it exists in list
      let linksResponse = await request(app).get('/api/links');
      let link = linksResponse.body.find(l => l.shortCode === 'remove-list');
      expect(link).toBeDefined();

      // Delete it
      await request(app).delete('/api/links/remove-list');

      // Verify it's removed from list
      linksResponse = await request(app).get('/api/links');
      link = linksResponse.body.find(l => l.shortCode === 'remove-list');
      expect(link).toBeUndefined();
    });
  });
});
