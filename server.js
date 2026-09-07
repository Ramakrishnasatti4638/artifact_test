const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'client/build')));

// In-memory storage for shortened URLs
const urlMap = new Map();

// Function to generate short code
const generateShortCode = () => {
  return Math.random().toString(36).substring(2, 8);
};

// API Routes

// POST /api/shorten - Create a shortened URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL
  try {
    new URL(url);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const shortCode = generateShortCode();
  const shortUrl = `http://localhost:${PORT}/${shortCode}`;

  urlMap.set(shortCode, url);

  res.json({
    originalUrl: url,
    shortUrl: shortUrl,
    shortCode: shortCode
  });
});

// GET /:shortCode - Redirect to original URL
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const originalUrl = urlMap.get(shortCode);

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.redirect(originalUrl);
});

// GET /api/urls - Get all shortened URLs
app.get('/api/urls', (req, res) => {
  const urls = Array.from(urlMap.entries()).map(([shortCode, originalUrl]) => ({
    shortCode,
    originalUrl,
    shortUrl: `http://localhost:${PORT}/${shortCode}`
  }));

  res.json(urls);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
