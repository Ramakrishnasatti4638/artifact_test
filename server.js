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

// Store metadata for each short URL
class URLMetadata {
  constructor(originalUrl) {
    this.originalUrl = originalUrl;
    this.clicks = 0;
    this.createdAt = new Date();
  }
}

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
  const urlList = Array.from(urls.entries()).map(([shortId, metadata]) => ({
    shortId,
    shortUrl: `http://localhost:${PORT}/${shortId}`,
    originalUrl: metadata.originalUrl,
    clicks: metadata.clicks,
    createdAt: metadata.createdAt
  }));

  res.json(urlList);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
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
  urls.set(shortId, new URLMetadata(originalUrl));

  const shortUrl = `http://localhost:${PORT}/${shortId}`;
  res.json({ shortId, shortUrl, originalUrl });
});

// DELETE /api/shorten/:shortId - Delete a shortened URL
app.delete('/api/shorten/:shortId', (req, res) => {
  const { shortId } = req.params;

  if (!urls.has(shortId)) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  urls.delete(shortId);
  res.json({ message: 'Short URL deleted successfully' });
});

// GET /:shortId - Redirect to original URL (must be last to avoid catching other routes)
app.get('/:shortId', (req, res) => {
  const { shortId } = req.params;
  const metadata = urls.get(shortId);

  if (!metadata) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  metadata.clicks++;
  res.redirect(metadata.originalUrl);
});

app.listen(PORT, () => {
  console.log(`URL Shortener server running on http://localhost:${PORT}`);
});
