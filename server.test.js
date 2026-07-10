const request = require('supertest');
const app = require('./server');

describe('URL Shortener API', () => {
    beforeEach(() => {
        const links = require('./server');
    });

    describe('POST /api/shorten', () => {
        it('should shorten a valid URL', async () => {
            const response = await request(app)
                .post('/api/shorten')
                .send({ url: 'https://www.example.com' });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('shortCode');
            expect(response.body).toHaveProperty('originalUrl', 'https://www.example.com');
            expect(response.body).toHaveProperty('createdAt');
            expect(response.body).toHaveProperty('clickCount', 0);
            expect(response.body.shortCode).toHaveLength(6);
        });

        it('should accept a custom alias', async () => {
            const response = await request(app)
                .post('/api/shorten')
                .send({ url: 'https://www.example.com', customAlias: 'mylink' });

            expect(response.status).toBe(201);
            expect(response.body.shortCode).toBe('mylink');
        });

        it('should return 409 if custom alias already exists', async () => {
            await request(app)
                .post('/api/shorten')
                .send({ url: 'https://www.example.com', customAlias: 'taken' });

            const response = await request(app)
                .post('/api/shorten')
                .send({ url: 'https://www.google.com', customAlias: 'taken' });

            expect(response.status).toBe(409);
            expect(response.body.error).toBe('Custom alias already exists');
        });

        it('should return 400 if URL is missing', async () => {
            const response = await request(app)
                .post('/api/shorten')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('URL is required');
        });

        it('should return 400 if URL format is invalid', async () => {
            const response = await request(app)
                .post('/api/shorten')
                .send({ url: 'not-a-valid-url' });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid URL format');
        });

        it('should reject non-http(s) protocols', async () => {
            const response = await request(app)
                .post('/api/shorten')
                .send({ url: 'ftp://example.com' });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid URL format');
        });
    });

    describe('GET /:shortCode', () => {
        it('should redirect to original URL', async () => {
            const createResponse = await request(app)
                .post('/api/shorten')
                .send({ url: 'https://www.example.com' });

            const shortCode = createResponse.body.shortCode;

            const response = await request(app)
                .get(`/${shortCode}`)
                .redirects(0);

            expect(response.status).toBe(302);
            expect(response.headers.location).toBe('https://www.example.com');
        });

        it('should increment click count', async () => {
            const createResponse = await request(app)
                .post('/api/shorten')
                .send({ url: 'https://www.example.com' });

            const shortCode = createResponse.body.shortCode;

            await request(app).get(`/${shortCode}`).redirects(0);
            await request(app).get(`/${shortCode}`).redirects(0);

            const linksResponse = await request(app).get('/api/links');
            const link = linksResponse.body.find(l => l.shortCode === shortCode);

            expect(link.clickCount).toBe(2);
        });

        it('should return 404 for unknown short code', async () => {
            const response = await request(app)
                .get('/nonexistent')
                .redirects(0);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Short code not found');
        });

        it('should handle favicon.ico gracefully', async () => {
            const response = await request(app).get('/favicon.ico');
            expect(response.status).toBe(204);
        });
    });

    describe('GET /api/links', () => {
        it('should return empty array when no links exist', async () => {
            const response = await request(app).get('/api/links');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should return all shortened links', async () => {
            await request(app).post('/api/shorten').send({ url: 'https://www.example.com' });
            await request(app).post('/api/shorten').send({ url: 'https://www.google.com' });

            const response = await request(app).get('/api/links');

            expect(response.status).toBe(200);
            expect(response.body.length).toBeGreaterThanOrEqual(2);
        });

        it('should return links sorted by click count descending', async () => {
            const link1 = await request(app).post('/api/shorten').send({ url: 'https://one.com' });
            const link2 = await request(app).post('/api/shorten').send({ url: 'https://two.com' });

            await request(app).get(`/${link2.body.shortCode}`).redirects(0);
            await request(app).get(`/${link2.body.shortCode}`).redirects(0);
            await request(app).get(`/${link1.body.shortCode}`).redirects(0);

            const response = await request(app).get('/api/links');

            expect(response.body[0].clickCount).toBeGreaterThanOrEqual(response.body[1].clickCount);
        });
    });

    describe('DELETE /api/links/:shortCode', () => {
        it('should delete a shortened link', async () => {
            const createResponse = await request(app)
                .post('/api/shorten')
                .send({ url: 'https://www.example.com' });

            const shortCode = createResponse.body.shortCode;

            const deleteResponse = await request(app).delete(`/api/links/${shortCode}`);
            expect(deleteResponse.status).toBe(204);

            const getResponse = await request(app).get(`/${shortCode}`).redirects(0);
            expect(getResponse.status).toBe(404);
        });

        it('should return 404 for non-existent short code', async () => {
            const response = await request(app).delete('/api/links/nonexistent');
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Short code not found');
        });

        it('should prevent access to deleted link', async () => {
            const createResponse = await request(app)
                .post('/api/shorten')
                .send({ url: 'https://www.example.com' });

            const shortCode = createResponse.body.shortCode;

            await request(app).delete(`/api/links/${shortCode}`);

            const response = await request(app).get(`/${shortCode}`).redirects(0);
            expect(response.status).toBe(404);
        });
    });

    describe('Edge cases', () => {
        it('should handle URLs with query parameters', async () => {
            const response = await request(app)
                .post('/api/shorten')
                .send({ url: 'https://www.example.com?foo=bar&baz=qux' });

            expect(response.status).toBe(201);
            expect(response.body.originalUrl).toBe('https://www.example.com?foo=bar&baz=qux');
        });

        it('should handle URLs with fragments', async () => {
            const response = await request(app)
                .post('/api/shorten')
                .send({ url: 'https://www.example.com#section' });

            expect(response.status).toBe(201);
            expect(response.body.originalUrl).toBe('https://www.example.com#section');
        });

        it('should generate unique random codes', async () => {
            const codes = new Set();
            for (let i = 0; i < 10; i++) {
                const response = await request(app)
                    .post('/api/shorten')
                    .send({ url: `https://www.example${i}.com` });
                codes.add(response.body.shortCode);
            }
            expect(codes.size).toBe(10);
        });
    });
});
