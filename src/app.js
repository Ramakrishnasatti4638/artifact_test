const express = require('express');
const path = require('path');
const store = require('./store');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// POST /api/shorten - Create a shortened URL
app.post('/api/shorten', (req, res) => {
  const { url, customAlias } = req.body;

  // Validate URL is provided
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL format
  if (!store.isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Create link (returns error object if alias taken)
  const link = store.createLink(url, customAlias);
  if (link.error) {
    return res.status(link.code).json({ error: link.error });
  }

  // Return created link with full short URL
  const shortUrl = `${req.protocol}://${req.get('host')}/${link.shortCode}`;
  return res.status(201).json({
    shortCode: link.shortCode,
    originalUrl: link.originalUrl,
    shortUrl,
    createdAt: link.createdAt,
  });
});

// GET /:shortCode - Redirect to original URL
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  const link = store.getLink(shortCode);
  if (!link) {
    return res.status(404).json({ error: 'Short code not found' });
  }

  res.redirect(302, link.originalUrl);
});

// GET /api/links - Get all links sorted by clickCount
app.get('/api/links', (req, res) => {
  const links = store.getAllLinks();
  res.status(200).json(links);
});

// DELETE /api/links/:shortCode - Delete a link
app.delete('/api/links/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  const deleted = store.deleteLink(shortCode);
  if (!deleted) {
    return res.status(404).json({ error: 'Short code not found' });
  }

  res.status(204).send();
});

module.exports = app;
