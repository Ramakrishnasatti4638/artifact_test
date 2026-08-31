const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Store for URL mappings (in-memory; reset on server restart)
const urlMap = new Map();

// Generate short code
function generateShortCode() {
  return uuidv4().slice(0, 8);
}

// API Routes

// Create short URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const shortCode = generateShortCode();
  urlMap.set(shortCode, {
    originalUrl: url,
    createdAt: new Date(),
    clicks: 0
  });

  const shortUrl = `${req.protocol}://${req.get('host')}/s/${shortCode}`;
  res.json({ shortUrl, shortCode, originalUrl: url });
});

// Redirect to original URL
app.get('/s/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const entry = urlMap.get(shortCode);

  if (!entry) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  entry.clicks += 1;
  res.redirect(entry.originalUrl);
});

// Get URL info
app.get('/api/urls/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const entry = urlMap.get(shortCode);

  if (!entry) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.json({
    shortCode,
    originalUrl: entry.originalUrl,
    createdAt: entry.createdAt,
    clicks: entry.clicks
  });
});

// Get all URLs
app.get('/api/urls', (req, res) => {
  const urls = Array.from(urlMap.entries()).map(([shortCode, entry]) => ({
    shortCode,
    originalUrl: entry.originalUrl,
    shortUrl: `${req.protocol}://${req.get('host')}/s/${shortCode}`,
    createdAt: entry.createdAt,
    clicks: entry.clicks
  }));

  res.json(urls);
});

// Serve static files from React app
app.use(express.static(path.join(__dirname, 'client/build')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
