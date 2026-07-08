const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const store = require('./store');

const router = express.Router();
const JWT_SECRET = 'DEMO_SECRET';
const SALT_ROUNDS = 10;

// POST /auth/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  if (store.findByEmail(email)) {
    return res.status(409).json({ error: 'Email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = store.createUser(email, passwordHash);

  return res.status(201).json({ id: user.id, email: user.email });
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = store.findByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '1h' });
  return res.status(200).json({ token, id: user.id });
});

// GET /auth/me — protected
router.get('/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.slice(7);
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const user = store.findById(payload.sub);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  return res.status(200).json({ id: user.id, email: user.email });
});

module.exports = router;
