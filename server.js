const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store
const linksStore = new Map();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper functions
function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// API Routes

// POST /api/shorten - Create shortened URL
app.post('/api/shorten', (req, res) => {
  const { url, customAlias } = req.body;

  // Validate URL
  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Generate or use custom alias
  let shortCode = customAlias || generateShortCode();

  // Check if alias already exists
  if (linksStore.has(shortCode)) {
    return res.status(409).json({ error: 'Alias already taken' });
  }

  // If no custom alias provided, ensure generated code is unique
  if (!customAlias) {
    while (linksStore.has(shortCode)) {
      shortCode = generateShortCode();
    }
  }

  // Store the link
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

// DELETE /api/links/:shortCode - Delete a link
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
  if (shortCode.startsWith('api') || shortCode.includes('.')) {
    return res.status(404).send('Not Found');
  }

  const linkData = linksStore.get(shortCode);

  if (!linkData) {
    return res.status(404).send('Short code not found');
  }

  // Increment click count
  linkData.clickCount++;
  linksStore.set(shortCode, linkData);

  // Redirect to original URL
  res.redirect(302, linkData.originalUrl);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
});

// Export for testing
module.exports = { app, server, linksStore };
