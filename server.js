import express from 'express';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// In-memory store for URL mappings
const urlMap = new Map();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to shorten a URL
app.post('/api/shorten', (req, res) => {
  try {
    const { url } = req.body;

    // Validate URL
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Generate short ID
    const shortId = nanoid(6);
    urlMap.set(shortId, url);

    // Return the short URL
    const shortUrl = `${req.protocol}://${req.get('host')}/s/${shortId}`;
    res.json({ shortUrl, shortId, originalUrl: url });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to get URL stats
app.get('/api/stats/:shortId', (req, res) => {
  const { shortId } = req.params;
  const originalUrl = urlMap.get(shortId);

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.json({ shortId, originalUrl });
});

// Redirect endpoint
app.get('/s/:shortId', (req, res) => {
  const { shortId } = req.params;
  const originalUrl = urlMap.get(shortId);

  if (!originalUrl) {
    return res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  }

  res.redirect(originalUrl);
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
});
