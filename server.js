const express = require('express');
const { nanoid } = require('nanoid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'urls.json');

// Middleware
app.use(express.json());
app.use(express.static('public'));

// In-memory URL store
let urls = {};

// Load URLs from file on startup
function loadUrls() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      urls = JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading URLs:', err);
  }
}

// Save URLs to file
function saveUrls() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(urls, null, 2));
  } catch (err) {
    console.error('Error saving URLs:', err);
  }
}

// Validate URL format
function isValidUrl(urlString) {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
}

// Create a short URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Check if URL already shortened
  const existing = Object.entries(urls).find(([, data]) => data.original === url);
  if (existing) {
    return res.json({ short: existing[0], original: url });
  }

  const shortId = nanoid(6);
  urls[shortId] = {
    original: url,
    created: new Date().toISOString(),
    clicks: 0
  };

  saveUrls();
  res.json({ short: shortId, original: url });
});

// Get all URLs
app.get('/api/urls', (req, res) => {
  const urlList = Object.entries(urls).map(([short, data]) => ({
    short,
    original: data.original,
    created: data.created,
    clicks: data.clicks
  }));
  res.json(urlList);
});

// Get URL info
app.get('/api/info/:shortId', (req, res) => {
  const { shortId } = req.params;
  const data = urls[shortId];

  if (!data) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.json({
    short: shortId,
    original: data.original,
    created: data.created,
    clicks: data.clicks
  });
});

// Redirect to original URL
app.get('/:shortId', (req, res) => {
  const { shortId } = req.params;
  const data = urls[shortId];

  if (!data) {
    return res.status(404).send('Short URL not found');
  }

  urls[shortId].clicks += 1;
  saveUrls();

  res.redirect(data.original);
});

// Delete a short URL
app.delete('/api/urls/:shortId', (req, res) => {
  const { shortId } = req.params;

  if (!urls[shortId]) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  delete urls[shortId];
  saveUrls();
  res.json({ message: 'Short URL deleted' });
});

loadUrls();
app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
});
