import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3000;

// In-memory storage for shortened URLs
const urlMap = new Map();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create a short URL
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

  // Generate a short code (first 8 characters of UUID)
  const shortCode = uuidv4().slice(0, 8);
  urlMap.set(shortCode, url);

  res.json({
    originalUrl: url,
    shortUrl: `http://localhost:${PORT}/${shortCode}`,
    shortCode
  });
});

// Redirect to original URL
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const originalUrl = urlMap.get(shortCode);

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.redirect(originalUrl);
});

// Get all URLs (for debugging/display)
app.get('/api/urls/all', (req, res) => {
  const urls = Array.from(urlMap.entries()).map(([code, url]) => ({
    shortCode: code,
    shortUrl: `http://localhost:${PORT}/${code}`,
    originalUrl: url
  }));

  res.json(urls);
});

app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
});
