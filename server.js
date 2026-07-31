const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store
const links = new Map();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Helper function to generate random 6-character alphanumeric code
function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Helper function to validate URL format
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

// POST /api/shorten - Create shortened URL
app.post('/api/shorten', (req, res) => {
  const { url, customAlias } = req.body;

  // Validate URL presence
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL format
  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  let shortCode;

  if (customAlias) {
    // Check if custom alias already exists
    if (links.has(customAlias)) {
      return res.status(409).json({ error: 'Custom alias already taken' });
    }
    shortCode = customAlias;
  } else {
    // Generate unique random code
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

  // Return response
  res.status(201).json({
    shortCode,
    originalUrl: url,
    shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
    createdAt: linkData.createdAt
  });
});

// GET /api/links - Get all links with stats
app.get('/api/links', (req, res) => {
  const allLinks = Array.from(links.values())
    .sort((a, b) => b.clickCount - a.clickCount);
  
  res.json(allLinks);
});

// DELETE /api/links/:shortCode - Delete a shortened link
app.delete('/api/links/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  if (!links.has(shortCode)) {
    return res.status(404).json({ error: 'Short code not found' });
  }

  links.delete(shortCode);
  res.status(204).send();
});

// GET /:shortCode - Redirect to original URL
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  // Skip API routes and static files
  if (shortCode.startsWith('api') || shortCode.includes('.')) {
    return res.status(404).send('Not found');
  }

  const link = links.get(shortCode);

  if (!link) {
    return res.status(404).send('Short code not found');
  }

  // Increment click count
  link.clickCount++;

  // Redirect to original URL
  res.redirect(302, link.originalUrl);
});

// Test helper to clear store
if (process.env.NODE_ENV === 'test') {
  app._clearStore = () => links.clear();
}

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`URL Shortener running on http://localhost:${PORT}`);
  });
}

module.exports = app;
