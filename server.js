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

// In-memory URL storage
const urlStore = new Map();
let shortCodeCounter = 1000;

// Generate a short code
function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  let num = shortCodeCounter++;
  
  while (num > 0) {
    result = chars[num % chars.length] + result;
    num = Math.floor(num / chars.length);
  }
  
  return result;
}

// Validate URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// POST /api/shorten - Create a short URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Check if URL already exists
  for (const [code, data] of urlStore) {
    if (data.originalUrl === url) {
      return res.json({
        shortCode: code,
        shortUrl: `${req.protocol}://${req.get('host')}/${code}`,
        originalUrl: url,
        createdAt: data.createdAt,
        clicks: data.clicks,
      });
    }
  }

  const shortCode = generateShortCode();
  urlStore.set(shortCode, {
    originalUrl: url,
    createdAt: new Date().toISOString(),
    clicks: 0,
  });

  res.status(201).json({
    shortCode,
    shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
    originalUrl: url,
    createdAt: urlStore.get(shortCode).createdAt,
    clicks: 0,
  });
});

// GET /api/urls - Get all shortened URLs
app.get('/api/urls', (req, res) => {
  const urls = [];
  for (const [code, data] of urlStore) {
    urls.push({
      shortCode: code,
      shortUrl: `${req.protocol}://${req.get('host')}/${code}`,
      originalUrl: data.originalUrl,
      createdAt: data.createdAt,
      clicks: data.clicks,
    });
  }
  res.json(urls);
});

// GET /api/stats/:shortCode - Get stats for a short URL
app.get('/api/stats/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const data = urlStore.get(shortCode);

  if (!data) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.json({
    shortCode,
    shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
    originalUrl: data.originalUrl,
    createdAt: data.createdAt,
    clicks: data.clicks,
  });
});

// GET /:shortCode - Redirect to original URL
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  // Skip static file routes
  if (shortCode === 'api' || shortCode.includes('.')) {
    return res.status(404).json({ error: 'Not found' });
  }

  const data = urlStore.get(shortCode);

  if (!data) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  // Increment click count
  data.clicks++;

  res.redirect(data.originalUrl);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
});
