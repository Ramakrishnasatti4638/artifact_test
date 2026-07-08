const request = require('supertest');
const app = require('../src/app');
const store = require('../src/store');

// Reset in-memory store before every test so tests are fully isolated
beforeEach(() => {
  store.reset();
});

// ─── Registration ────────────────────────────────────────────────────────────

describe('POST /auth/register', () => {
  it('registers a new user and returns 201 with id and email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'alice@example.com', password: 'secret123' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: expect.any(Number), email: 'alice@example.com' });
    // Password hash must never be exposed
    expect(res.body.password).toBeUndefined();
    expect(res.body.passwordHash).toBeUndefined();
  });

  it('returns 409 when email is already registered', async () => {
    await request(app)
      .post('/auth/register')
      .send({ email: 'alice@example.com', password: 'secret123' });

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'alice@example.com', password: 'different' });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when email or password is missing', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'alice@example.com' }); // no password

    expect(res.status).toBe(400);
  });
});

// ─── Login ───────────────────────────────────────────────────────────────────

describe('POST /auth/login', () => {
  beforeEach(async () => {
    // Pre-register a user for login tests
    await request(app)
      .post('/auth/register')
      .send({ email: 'bob@example.com', password: 'mypassword' });
  });

  it('returns 200 with a JWT token and user id on valid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'bob@example.com', password: 'mypassword' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ token: expect.any(String), id: expect.any(Number) });
  });

  it('returns 401 when the password is wrong', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'bob@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 when the email does not exist', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'anything' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

// ─── /auth/me ────────────────────────────────────────────────────────────────

describe('GET /auth/me', () => {
  let token;
  let userId;

  beforeEach(async () => {
    // Register then login to obtain a valid token
    await request(app)
      .post('/auth/register')
      .send({ email: 'carol@example.com', password: 'pass456' });

    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'carol@example.com', password: 'pass456' });

    token = loginRes.body.token;
    userId = loginRes.body.id;
  });

  it('returns 200 with id and email when a valid Bearer token is provided', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: userId, email: 'carol@example.com' });
    expect(res.body.passwordHash).toBeUndefined();
  });

  it('returns 401 when no Authorization header is sent', async () => {
    const res = await request(app).get('/auth/me');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 when the token is invalid / tampered', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer this.is.not.a.valid.token');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 when Authorization header is present but missing Bearer prefix', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', token); // no "Bearer " prefix

    expect(res.status).toBe(401);
  });
});
