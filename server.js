const express = require('express');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store: { shortCode -> { originalUrl, createdAt, clicks } }
const urlStore = {};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// POST /api/shorten — create a short URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'A valid URL is required.' });
  }

  // Basic URL validation
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format. Please include http:// or https://' });
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return res.status(400).json({ error: 'Only http and https URLs are allowed.' });
  }

  // Check if URL already shortened
  const existing = Object.entries(urlStore).find(
    ([, entry]) => entry.originalUrl === url
  );
  if (existing) {
    const [code, entry] = existing;
    return res.json({ shortCode: code, shortUrl: buildShortUrl(req, code), clicks: entry.clicks });
  }

  const shortCode = nanoid(7);
  urlStore[shortCode] = { originalUrl: url, createdAt: new Date().toISOString(), clicks: 0 };

  res.status(201).json({
    shortCode,
    shortUrl: buildShortUrl(req, shortCode),
    clicks: 0
  });
});

// GET /api/links — list all shortened URLs
app.get('/api/links', (req, res) => {
  const links = Object.entries(urlStore).map(([code, entry]) => ({
    shortCode: code,
    shortUrl: buildShortUrl(req, code),
    originalUrl: entry.originalUrl,
    createdAt: entry.createdAt,
    clicks: entry.clicks
  }));
  res.json(links.reverse());
});

// DELETE /api/links/:code — delete a short URL
app.delete('/api/links/:code', (req, res) => {
  const { code } = req.params;
  if (!urlStore[code]) {
    return res.status(404).json({ error: 'Short URL not found.' });
  }
  delete urlStore[code];
  res.json({ message: 'Deleted successfully.' });
});

// GET /:code — redirect to original URL
app.get('/:code', (req, res) => {
  const { code } = req.params;
  const entry = urlStore[code];
  if (!entry) {
    return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  entry.clicks++;
  res.redirect(301, entry.originalUrl);
});

function buildShortUrl(req, code) {
  return `${req.protocol}://${req.get('host')}/${code}`;
}

app.listen(PORT, () => {
  console.log(`URL Shortener running on port ${PORT}`);
});
