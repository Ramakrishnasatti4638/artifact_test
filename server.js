import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// In-memory database
const urlDatabase = new Map();
let shortCounter = 1000;

// Function to generate short URL code
function generateShortCode() {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const codeLength = 6;
  let code = '';
  for (let i = 0; i < codeLength; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// Endpoint to create a shortened URL
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

  // Check if URL already exists
  for (const [code, data] of urlDatabase.entries()) {
    if (data.originalUrl === url) {
      return res.json({
        shortUrl: `http://localhost:3000/${code}`,
        originalUrl: url,
        code: code
      });
    }
  }

  // Generate unique short code
  let shortCode = generateShortCode();
  while (urlDatabase.has(shortCode)) {
    shortCode = generateShortCode();
  }

  // Store in database
  urlDatabase.set(shortCode, {
    originalUrl: url,
    createdAt: new Date().toISOString(),
    clicks: 0
  });

  res.json({
    shortUrl: `http://localhost:3000/${shortCode}`,
    originalUrl: url,
    code: shortCode
  });
});

// Endpoint to redirect to original URL
app.get('/:code', (req, res) => {
  const { code } = req.params;
  const urlData = urlDatabase.get(code);

  if (!urlData) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  // Increment click counter
  urlData.clicks++;

  // Redirect to original URL
  res.redirect(urlData.originalUrl);
});

// Endpoint to get URL statistics
app.get('/api/stats/:code', (req, res) => {
  const { code } = req.params;
  const urlData = urlDatabase.get(code);

  if (!urlData) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.json({
    code: code,
    originalUrl: urlData.originalUrl,
    shortUrl: `http://localhost:3000/${code}`,
    clicks: urlData.clicks,
    createdAt: urlData.createdAt
  });
});

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`URL Shortener running at http://localhost:${PORT}`);
});
