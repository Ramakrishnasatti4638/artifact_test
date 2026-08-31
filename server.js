const express = require('express');
const initSqlJs = require('sql.js');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let db;
let SQL;
const DB_FILE = './urls.db';

// Initialize database
async function initDb() {
  SQL = await initSqlJs();
  
  let filebuffer = null;
  if (fs.existsSync(DB_FILE)) {
    filebuffer = fs.readFileSync(DB_FILE);
  }
  
  db = new SQL.Database(filebuffer);
  
  // Create table if it doesn't exist
  try {
    db.run(`
      CREATE TABLE IF NOT EXISTS urls (
        id TEXT PRIMARY KEY,
        long_url TEXT NOT NULL,
        short_code TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        clicks INTEGER DEFAULT 0
      )
    `);
  } catch (e) {
    // Table might already exist
  }
  
  saveDb();
}

// Save database to file
function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_FILE, buffer);
}

// Helper function to generate short code
function generateShortCode() {
  return Math.random().toString(36).substring(2, 8);
}

// Routes

// POST /api/shorten - Create a shortened URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const id = uuidv4();
  const shortCode = generateShortCode();
  const now = new Date().toISOString();

  try {
    db.run(
      'INSERT INTO urls (id, long_url, short_code, created_at, clicks) VALUES (?, ?, ?, ?, ?)',
      [id, url, shortCode, now, 0]
    );
    saveDb();
    
    res.json({ 
      id, 
      long_url: url, 
      short_code: shortCode,
      short_url: `http://localhost:3001/s/${shortCode}`,
      created_at: now,
      clicks: 0
    });
  } catch (err) {
    console.error('Error creating URL:', err);
    return res.status(500).json({ error: 'Failed to create shortened URL' });
  }
});

// GET /api/urls - Get all shortened URLs
app.get('/api/urls', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM urls ORDER BY created_at DESC');
    const rows = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      rows.push({
        ...row,
        short_url: `http://localhost:3001/s/${row.short_code}`
      });
    }
    stmt.free();
    
    res.json(rows);
  } catch (err) {
    console.error('Error fetching URLs:', err);
    return res.status(500).json({ error: 'Failed to fetch URLs' });
  }
});

// GET /s/:shortCode - Redirect to original URL
app.get('/s/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  try {
    const stmt = db.prepare('SELECT * FROM urls WHERE short_code = ?');
    stmt.bind([shortCode]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      
      // Increment click count
      db.run('UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?', [shortCode]);
      saveDb();

      res.redirect(row.long_url);
    } else {
      stmt.free();
      return res.status(404).json({ error: 'Short URL not found' });
    }
  } catch (err) {
    console.error('Error redirecting:', err);
    return res.status(404).json({ error: 'Short URL not found' });
  }
});

// GET /api/stats/:shortCode - Get statistics for a shortened URL
app.get('/api/stats/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  try {
    const stmt = db.prepare('SELECT * FROM urls WHERE short_code = ?');
    stmt.bind([shortCode]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      res.json(row);
    } else {
      stmt.free();
      return res.status(404).json({ error: 'Short URL not found' });
    }
  } catch (err) {
    console.error('Error fetching stats:', err);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// DELETE /api/urls/:id - Delete a shortened URL
app.delete('/api/urls/:id', (req, res) => {
  const { id } = req.params;

  try {
    db.run('DELETE FROM urls WHERE id = ?', [id]);
    saveDb();
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting URL:', err);
    return res.status(500).json({ error: 'Failed to delete URL' });
  }
});

// Start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`URL Shortener server running at http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
