const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store
const linksStore = new Map();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Helper function to generate random 6-character alphanumeric code
function generateShortCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Helper function to validate URL format
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// POST /api/shorten - Create a shortened URL
app.post('/api/shorten', (req, res) => {
  const { url, customAlias } = req.body;

  // Validate URL
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Determine short code
  let shortCode;
  if (customAlias) {
    if (linksStore.has(customAlias)) {
      return res.status(409).json({ error: 'Alias already taken' });
    }
    shortCode = customAlias;
  } else {
    // Generate unique short code
    do {
      shortCode = generateShortCode();
    } while (linksStore.has(shortCode));
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
    shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`
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

  // Skip if it's a known static path
  if (shortCode === 'favicon.ico') {
    return res.status(404).send();
  }

  const linkData = linksStore.get(shortCode);

  if (!linkData) {
    return res.status(404).json({ error: 'Short code not found' });
  }

  // Increment click count
  linkData.clickCount++;
  linksStore.set(shortCode, linkData);

  // Redirect to original URL
  res.redirect(302, linkData.originalUrl);
});

// Export for testing
module.exports = app;
module.exports.linksStore = linksStore;
module.exports.clearStore = () => linksStore.clear();

// Start server only if not in test environment
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`URL Shortener running on http://localhost:${PORT}`);
  });
}
