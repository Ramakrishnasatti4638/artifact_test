const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) console.error(err);
  else console.log('Connected to SQLite database');
});

// Create table
db.run(`
  CREATE TABLE IF NOT EXISTS urls (
    id TEXT PRIMARY KEY,
    shortCode TEXT UNIQUE NOT NULL,
    originalUrl TEXT NOT NULL,
    shortUrl TEXT NOT NULL,
    clicks INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Helper function to generate short code
const generateShortCode = () => {
  return Math.random().toString(36).substring(2, 8);
};

// Helper function to validate URL
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Routes

// POST /api/shorten - Create a shortened URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(422).json({ error: 'URL is required' });
  }

  if (!isValidUrl(url)) {
    return res.status(422).json({ error: 'Invalid URL format' });
  }

  const shortCode = generateShortCode();
  const id = uuidv4();
  const shortUrl = `${req.protocol}://${req.host}/s/${shortCode}`;

  db.run(
    'INSERT INTO urls (id, shortCode, originalUrl, shortUrl, clicks, createdAt) VALUES (?, ?, ?, ?, ?, datetime("now"))',
    [id, shortCode, url, shortUrl, 0],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to shorten URL' });
      }

      res.status(201).json({
        id,
        shortCode,
        originalUrl: url,
        shortUrl,
        clicks: 0,
        createdAt: new Date().toISOString()
      });
    }
  );
});

// GET /api/urls - Get all shortened URLs
app.get('/api/urls', (req, res) => {
  db.all('SELECT * FROM urls ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch URLs' });
    }

    res.json(rows || []);
  });
});

// GET /api/urls/:shortCode - Get a specific shortened URL
app.get('/api/urls/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  db.get('SELECT * FROM urls WHERE shortCode = ?', [shortCode], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch URL' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    res.json(row);
  });
});

// GET /s/:shortCode - Redirect to original URL
app.get('/s/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  db.run(
    'UPDATE urls SET clicks = clicks + 1 WHERE shortCode = ?',
    [shortCode],
    (err) => {
      if (err) console.error(err);
    }
  );

  db.get('SELECT originalUrl FROM urls WHERE shortCode = ?', [shortCode], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error retrieving URL');
    }

    if (!row) {
      return res.status(404).send('Short URL not found');
    }

    res.redirect(row.originalUrl);
  });
});

// DELETE /api/urls/:shortCode - Delete a shortened URL
app.delete('/api/urls/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  db.run('DELETE FROM urls WHERE shortCode = ?', [shortCode], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete URL' });
    }

    res.json({ message: 'URL deleted successfully' });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 URL Shortener API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health\n`);
});
