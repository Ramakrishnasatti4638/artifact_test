const express = require('express');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store: { shortCode -> { originalUrl, createdAt, visits } }
const urlStore = new Map();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// POST /api/shorten — create a short URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'A valid URL is required.' });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL. Make sure it includes http:// or https://' });
  }

  // Check if this URL has already been shortened
  for (const [code, entry] of urlStore.entries()) {
    if (entry.originalUrl === url) {
      return res.json({ shortCode: code, shortUrl: buildShortUrl(req, code), visits: entry.visits });
    }
  }

  const shortCode = nanoid(7);
  urlStore.set(shortCode, { originalUrl: url, createdAt: new Date().toISOString(), visits: 0 });

  return res.status(201).json({
    shortCode,
    shortUrl: buildShortUrl(req, shortCode),
    visits: 0,
  });
});

// GET /api/stats/:code — get stats for a short code
app.get('/api/stats/:code', (req, res) => {
  const entry = urlStore.get(req.params.code);
  if (!entry) return res.status(404).json({ error: 'Short URL not found.' });
  res.json({ shortCode: req.params.code, ...entry });
});

// GET /:code — redirect to original URL
app.get('/:code', (req, res) => {
  const { code } = req.params;
  const entry = urlStore.get(code);
  if (!entry) return res.redirect('/?error=not_found');
  entry.visits += 1;
  res.redirect(entry.originalUrl);
});

function buildShortUrl(req, code) {
  return `${req.protocol}://${req.get('host')}/${code}`;
}

app.listen(PORT, () => {
  console.log(`URL Shortener running on port ${PORT}`);
});
