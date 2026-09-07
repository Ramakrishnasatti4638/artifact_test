const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database setup
const dbPath = path.join(__dirname, 'urls.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS urls (
      id TEXT PRIMARY KEY,
      shortCode TEXT UNIQUE NOT NULL,
      originalUrl TEXT NOT NULL,
      clicks INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      expiresAt DATETIME
    )
  `);
}

// Utility function to generate short code
function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// API Routes

// Get all URLs
app.get('/api/urls', (req, res) => {
  db.all('SELECT * FROM urls ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch URLs' });
    }
    res.json(rows);
  });
});

// Create short URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const id = uuidv4();
  let shortCode = generateShortCode();

  // Ensure short code is unique
  const insertUrl = () => {
    db.run(
      'INSERT INTO urls (id, shortCode, originalUrl) VALUES (?, ?, ?)',
      [id, shortCode, url],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            // Retry with a new code
            shortCode = generateShortCode();
            insertUrl();
          } else {
            return res.status(500).json({ error: 'Failed to create short URL' });
          }
        } else {
          res.json({
            id,
            shortCode,
            originalUrl: url,
            clicks: 0,
            createdAt: new Date().toISOString(),
            shortUrl: `http://localhost:3001/${shortCode}`
          });
        }
      }
    );
  };

  insertUrl();
});

// Get URL by short code and redirect
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  db.get('SELECT * FROM urls WHERE shortCode = ?', [shortCode], (err, row) => {
    if (err || !row) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Increment click counter
    db.run('UPDATE urls SET clicks = clicks + 1 WHERE id = ?', [row.id]);

    // Redirect to original URL
    res.redirect(row.originalUrl);
  });
});

// Get stats for a URL
app.get('/api/stats/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  db.get('SELECT * FROM urls WHERE shortCode = ?', [shortCode], (err, row) => {
    if (err || !row) {
      return res.status(404).json({ error: 'Short URL not found' });
    }
    res.json(row);
  });
});

// Delete a URL
app.delete('/api/urls/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM urls WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete URL' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'URL not found' });
    }
    res.json({ success: true });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});
