const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// In-memory store: { [shortCode]: { originalUrl, createdAt, clickCount } }
const store = {};

// POST /api/shorten — create a shortened URL
app.post('/api/shorten', (req, res) => {
  const { url, customAlias } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'url is required' });
  }

  try {
    new URL(url); // validates URL format
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const shortCode = customAlias || crypto.randomBytes(3).toString('hex');

  if (store[shortCode]) {
    return res.status(409).json({ error: 'Alias already taken' });
  }

  store[shortCode] = { originalUrl: url, createdAt: new Date().toISOString(), clickCount: 0 };

  return res.status(201).json({
    shortCode,
    originalUrl: url,
    shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
    createdAt: store[shortCode].createdAt,
  });
});

// GET /api/links — list all links sorted by click count (desc)
app.get('/api/links', (req, res) => {
  const links = Object.entries(store)
    .map(([shortCode, data]) => ({ shortCode, ...data }))
    .sort((a, b) => b.clickCount - a.clickCount);

  return res.json(links);
});

// DELETE /api/links/:shortCode — delete a link
app.delete('/api/links/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  if (!store[shortCode]) {
    return res.status(404).json({ error: 'Short code not found' });
  }

  delete store[shortCode];
  return res.status(200).json({ message: 'Deleted successfully' });
});

// GET /:shortCode — redirect to original URL
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const entry = store[shortCode];

  if (!entry) {
    return res.status(404).json({ error: 'Short code not found' });
  }

  entry.clickCount += 1;
  return res.redirect(302, entry.originalUrl);
});

module.exports = { app, store };
