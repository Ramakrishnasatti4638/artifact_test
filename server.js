import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for URL mappings
const urlMappings = new Map();

// Helper function to validate URLs
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// API Routes

// POST /api/shorten - Create a shortened URL
app.post('/api/shorten', (req, res) => {
  const { longUrl, customAlias } = req.body;

  if (!longUrl) {
    return res.status(400).json({ error: 'Long URL is required' });
  }

  if (!isValidUrl(longUrl)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  let shortCode = customAlias || nanoid(6);

  // Check if custom alias already exists
  if (customAlias && urlMappings.has(customAlias)) {
    return res.status(409).json({ error: 'Custom alias already taken' });
  }

  urlMappings.set(shortCode, {
    longUrl,
    createdAt: new Date().toISOString(),
    clicks: 0
  });

  const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;
  res.status(201).json({ shortCode, shortUrl, longUrl });
});

// GET /api/urls - Get all shortened URLs (for dashboard)
app.get('/api/urls', (req, res) => {
  const urls = Array.from(urlMappings.entries()).map(([code, data]) => ({
    shortCode: code,
    shortUrl: `${req.protocol}://${req.get('host')}/${code}`,
    longUrl: data.longUrl,
    createdAt: data.createdAt,
    clicks: data.clicks
  }));
  res.json(urls);
});

// GET /api/urls/:code - Get details of a specific shortened URL
app.get('/api/urls/:code', (req, res) => {
  const { code } = req.params;
  const data = urlMappings.get(code);

  if (!data) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.json({
    shortCode: code,
    longUrl: data.longUrl,
    createdAt: data.createdAt,
    clicks: data.clicks
  });
});

// DELETE /api/urls/:code - Delete a shortened URL
app.delete('/api/urls/:code', (req, res) => {
  const { code } = req.params;

  if (!urlMappings.has(code)) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  urlMappings.delete(code);
  res.json({ message: 'Short URL deleted successfully' });
});

// GET /:code - Redirect to long URL
app.get('/:code', (req, res) => {
  const { code } = req.params;
  const data = urlMappings.get(code);

  if (!data) {
    return res.status(404).send('Short URL not found');
  }

  // Increment click count
  data.clicks++;

  res.redirect(data.longUrl);
});

// Catch-all for serving index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`URL Shortener app listening on http://localhost:${PORT}`);
});
