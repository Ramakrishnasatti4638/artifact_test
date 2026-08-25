const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory store for URLs (in production, use a database)
// Clear on startup to ensure fresh state for testing
const urls = new Map();
let shortIdCounter = 1000;

// Utility function to generate short IDs
function generateShortId() {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let shortId = '';
  let num = shortIdCounter++;
  
  while (num > 0) {
    shortId = characters[num % characters.length] + shortId;
    num = Math.floor(num / characters.length);
  }
  
  return shortId;
}

// GET /api/urls - List all shortened URLs
app.get('/api/urls', (req, res) => {
  const urlList = Array.from(urls.entries()).map(([shortId, originalUrl]) => ({
    shortId,
    shortUrl: `http://localhost:${PORT}/${shortId}`,
    originalUrl
  }));

  res.json(urlList);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// POST /api/reset - Clear all shortened URLs (for testing purposes)
app.post('/api/reset', (req, res) => {
  urls.clear();
  shortIdCounter = 1000;
  res.json({ status: 'reset', message: 'All URLs cleared' });
});

// POST /api/shorten - Create a shortened URL
app.post('/api/shorten', (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: 'Original URL is required' });
  }

  // Basic URL validation
  try {
    new URL(originalUrl);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const shortId = generateShortId();
  urls.set(shortId, originalUrl);

  const shortUrl = `http://localhost:${PORT}/${shortId}`;
  res.json({ shortId, shortUrl, originalUrl });
});

// GET /:shortId - Redirect to original URL (must be last to avoid catching other routes)
app.get('/:shortId', (req, res) => {
  const { shortId } = req.params;
  const originalUrl = urls.get(shortId);

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.redirect(originalUrl);
});

app.listen(PORT, () => {
  console.log(`URL Shortener server running on http://localhost:${PORT}`);
});
