const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store
const linkStore = new Map();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Generate random 6-character alphanumeric code
function generateShortCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Validate URL format
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// POST /api/shorten - Create shortened URL
app.post('/api/shorten', (req, res) => {
  const { url, customAlias } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const shortCode = customAlias || generateShortCode();

  if (linkStore.has(shortCode)) {
    return res.status(409).json({ error: 'Alias already taken' });
  }

  const link = {
    shortCode,
    originalUrl: url,
    createdAt: new Date().toISOString(),
    clickCount: 0
  };

  linkStore.set(shortCode, link);

  res.status(201).json({
    shortCode,
    originalUrl: url,
    shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
    createdAt: link.createdAt
  });
});

// GET /api/links - Get all links with stats
app.get('/api/links', (req, res) => {
  const links = Array.from(linkStore.values())
    .sort((a, b) => b.clickCount - a.clickCount);
  
  res.json(links);
});

// DELETE /api/links/:shortCode - Delete a link
app.delete('/api/links/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  if (!linkStore.has(shortCode)) {
    return res.status(404).json({ error: 'Link not found' });
  }

  linkStore.delete(shortCode);
  res.status(204).send();
});

// GET /:shortCode - Redirect to original URL
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  const link = linkStore.get(shortCode);

  if (!link) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  link.clickCount++;
  linkStore.set(shortCode, link);

  res.redirect(302, link.originalUrl);
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`URL Shortener running on http://localhost:${PORT}`);
  });
}

module.exports = app;
