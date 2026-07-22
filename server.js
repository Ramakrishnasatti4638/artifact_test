const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store
const links = new Map();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Helper function to validate URL
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Helper function to generate random 6-character alphanumeric code
function generateShortCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST /api/shorten - Create shortened URL
app.post('/api/shorten', (req, res) => {
  const { url, customAlias } = req.body;

  // Validate URL is provided
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL format
  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Determine short code
  let shortCode = customAlias;
  
  if (customAlias) {
    // Check if custom alias is already taken
    if (links.has(customAlias)) {
      return res.status(409).json({ error: 'Custom alias already taken' });
    }
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

  // Check if it's an API route or static file
  if (shortCode.startsWith('api') || shortCode.includes('.')) {
    return res.status(404).send('Not found');
  }

  const linkData = links.get(shortCode);

  if (!linkData) {
    return res.status(404).send('Short code not found');
  }

  // Increment click count
  linkData.clickCount++;
  
  // Redirect to original URL
  res.redirect(302, linkData.originalUrl);
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`URL Shortener running on http://localhost:${PORT}`);
  });
}

module.exports = app;
