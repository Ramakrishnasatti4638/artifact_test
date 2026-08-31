const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for URLs
const urlMap = new Map();
let shortCodeCounter = 1000;

// Helper function to generate short code
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

// API Routes
app.post('/api/shorten', (req, res) => {
  const { url, customShortCode } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  let shortCode = customShortCode;

  if (shortCode) {
    // Validate custom short code format (alphanumeric and hyphens)
    if (!/^[a-zA-Z0-9_-]+$/.test(shortCode)) {
      return res.status(400).json({ error: 'Short code can only contain letters, numbers, hyphens, and underscores' });
    }

    // Check if custom code already exists
    if (urlMap.has(shortCode)) {
      return res.status(409).json({ error: 'Short code already exists' });
    }
  } else {
    // Check if URL already shortened
    for (let [code, stored] of urlMap) {
      if (stored.original === url) {
        return res.json({ shortCode: code, shortUrl: `${req.get('host')}/${code}`, originalUrl: url });
      }
    }

    shortCode = generateShortCode();
  }

  urlMap.set(shortCode, {
    original: url,
    createdAt: new Date(),
    clicks: 0
  });

  res.json({
    shortCode,
    shortUrl: `${req.get('host')}/${shortCode}`,
    originalUrl: url
  });
});

// Redirect endpoint
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const urlData = urlMap.get(shortCode);

  if (!urlData) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  urlData.clicks++;
  res.redirect(urlData.original);
});

// Get stats for a short URL
app.get('/api/stats/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const urlData = urlMap.get(shortCode);

  if (!urlData) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.json({
    shortCode,
    originalUrl: urlData.original,
    createdAt: urlData.createdAt,
    clicks: urlData.clicks
  });
});

// List all shortened URLs
app.get('/api/urls', (req, res) => {
  const urls = Array.from(urlMap.entries()).map(([code, data]) => ({
    shortCode: code,
    originalUrl: data.original,
    createdAt: data.createdAt,
    clicks: data.clicks
  }));

  res.json(urls);
});

app.listen(PORT, () => {
  console.log(`URL Shortener app listening on port ${PORT}`);
});
