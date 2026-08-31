const express = require('express');
const cors = require('cors');
const shortid = require('shortid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage (replace with database in production)
const urlMap = new Map();

// POST /api/shorten - Create a short URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const shortCode = shortid.generate();
  urlMap.set(shortCode, url);

  const shortUrl = `${req.protocol}://${req.get('host')}/s/${shortCode}`;

  res.json({
    originalUrl: url,
    shortUrl: shortUrl,
    shortCode: shortCode
  });
});

// GET /s/:code - Redirect to original URL
app.get('/s/:code', (req, res) => {
  const { code } = req.params;
  const originalUrl = urlMap.get(code);

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.redirect(originalUrl);
});

// GET /api/stats/:code - Get stats for a short URL
app.get('/api/stats/:code', (req, res) => {
  const { code } = req.params;
  const originalUrl = urlMap.get(code);

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.json({
    shortCode: code,
    originalUrl: originalUrl,
    shortUrl: `${req.protocol}://${req.get('host')}/s/${code}`
  });
});

// GET / - Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`URL Shortener server running on port ${PORT}`);
});
