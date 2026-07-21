const express = require('express');
const path = require('path');
const { validateUrl, generateShortCode } = require('./utils');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store
const linksStore = new Map();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// POST /api/shorten - Create shortened URL
app.post('/api/shorten', (req, res) => {
  const { url, customAlias } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!validateUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const shortCode = customAlias || generateShortCode();

  if (linksStore.has(shortCode)) {
    return res.status(409).json({ error: 'Alias already taken' });
  }

  const linkData = {
    shortCode,
    originalUrl: url,
    createdAt: new Date().toISOString(),
    clickCount: 0
  };

  linksStore.set(shortCode, linkData);

  res.status(201).json({
    shortCode,
    originalUrl: url,
    shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
    createdAt: linkData.createdAt
  });
});

// GET /api/links - Get all links with stats
app.get('/api/links', (req, res) => {
  const links = Array.from(linksStore.values())
    .sort((a, b) => b.clickCount - a.clickCount);
  
  res.json(links);
});

// DELETE /api/links/:shortCode - Delete a shortened link
app.delete('/api/links/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  if (!linksStore.has(shortCode)) {
    return res.status(404).json({ error: 'Short code not found' });
  }

  linksStore.delete(shortCode);
  res.status(204).send();
});

// GET /:shortCode - Redirect to original URL
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  // Skip API routes and static files
  if (shortCode === 'api' || shortCode.includes('.')) {
    return res.status(404).send('Not found');
  }

  const linkData = linksStore.get(shortCode);

  if (!linkData) {
    return res.status(404).send('Short code not found');
  }

  linkData.clickCount++;
  res.redirect(302, linkData.originalUrl);
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server (only if not in test mode)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`URL Shortener running on http://localhost:${PORT}`);
  });
}

// Export for testing
module.exports = { app, linksStore };
