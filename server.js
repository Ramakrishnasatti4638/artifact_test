const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// In-memory store
const links = new Map();

// Helper: Generate random 6-character alphanumeric code
function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Helper: Validate URL format
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

// POST /api/shorten - Create shortened URL
app.post('/api/shorten', (req, res) => {
  const { url, customAlias } = req.body;

  // Validate URL
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Generate or use custom alias
  let shortCode = customAlias;
  if (customAlias) {
    if (links.has(customAlias)) {
      return res.status(409).json({ error: 'Alias already taken' });
    }
  } else {
    // Generate unique short code
    do {
      shortCode = generateShortCode();
    } while (links.has(shortCode));
  }

  // Store the link
  const linkData = {
    shortCode,
    originalUrl: url,
    createdAt: new Date().toISOString(),
    clickCount: 0
  };

  links.set(shortCode, linkData);

  res.status(201).json({
    shortCode,
    shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
    originalUrl: url
  });
});

// GET /:shortCode - Redirect to original URL
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  // Skip if it's a static file or API route
  if (shortCode.includes('.') || shortCode === 'api') {
    return res.status(404).send('Not found');
  }

  const link = links.get(shortCode);

  if (!link) {
    return res.status(404).send('Short link not found');
  }

  // Increment click count
  link.clickCount++;

  // Redirect
  res.redirect(302, link.originalUrl);
});

// GET /api/links - Get all links with stats
app.get('/api/links', (req, res) => {
  const allLinks = Array.from(links.values())
    .sort((a, b) => b.clickCount - a.clickCount);

  res.json(allLinks);
});

// DELETE /api/links/:shortCode - Delete a link
app.delete('/api/links/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  if (!links.has(shortCode)) {
    return res.status(404).json({ error: 'Short link not found' });
  }

  links.delete(shortCode);
  res.status(204).send();
});

// Start server (only if not in test mode)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`URL Shortener running on http://localhost:${PORT}`);
  });
}

module.exports = app;
