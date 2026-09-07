const express = require('express');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = 3000;

// In-memory store: { shortCode -> originalUrl }
const urlStore = {};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// POST /api/shorten — create a short URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required.' });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL. Please include http:// or https://.' });
  }

  // Check if URL already shortened
  const existing = Object.entries(urlStore).find(([, v]) => v === url);
  if (existing) {
    return res.json({ shortCode: existing[0] });
  }

  const shortCode = crypto.randomBytes(4).toString('hex');
  urlStore[shortCode] = url;

  res.json({ shortCode });
});

// GET /api/urls — list all shortened URLs
app.get('/api/urls', (req, res) => {
  const urls = Object.entries(urlStore).map(([shortCode, originalUrl]) => ({
    shortCode,
    originalUrl,
  }));
  res.json(urls);
});

// GET /:code — redirect to original URL
app.get('/:code', (req, res) => {
  const { code } = req.params;
  const originalUrl = urlStore[code];

  if (!originalUrl) {
    return res.status(404).send('Short URL not found.');
  }

  res.redirect(301, originalUrl);
});

app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
});
