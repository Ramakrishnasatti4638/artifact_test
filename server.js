import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for shortened URLs
const urlMap = new Map();
const shortCodeMap = new Map();

// Generate a random short code
function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// API endpoint to shorten a URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Check if URL already shortened
  if (urlMap.has(url)) {
    const shortCode = urlMap.get(url);
    return res.json({
      shortCode,
      shortUrl: `http://localhost:${PORT}/${shortCode}`
    });
  }

  // Generate unique short code
  let shortCode;
  do {
    shortCode = generateShortCode();
  } while (shortCodeMap.has(shortCode));

  // Store mappings
  urlMap.set(url, shortCode);
  shortCodeMap.set(shortCode, {
    originalUrl: url,
    clicks: 0,
    createdAt: new Date().toISOString()
  });

  res.json({
    shortCode,
    shortUrl: `http://localhost:${PORT}/${shortCode}`
  });
});

// API endpoint to get URL stats
app.get('/api/stats/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const urlData = shortCodeMap.get(shortCode);

  if (!urlData) {
    return res.status(404).json({ error: 'Short code not found' });
  }

  res.json({
    shortCode,
    ...urlData
  });
});

// Redirect endpoint
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const urlData = shortCodeMap.get(shortCode);

  if (!urlData) {
    return res.status(404).json({ error: 'Short code not found' });
  }

  // Increment click count
  urlData.clicks++;

  // Redirect to original URL
  res.redirect(urlData.originalUrl);
});

app.listen(PORT, () => {
  console.log(`URL Shortener app running at http://localhost:${PORT}`);
});
