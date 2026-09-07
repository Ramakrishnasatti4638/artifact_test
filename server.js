const express = require('express');
const { nanoid } = require('nanoid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'data.json');

// ── Persistence helpers ──────────────────────────────────────────────────────

function loadDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { urls: {} };
  }
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

let db = loadDB();

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── API: shorten a URL ────────────────────────────────────────────────────────

app.post('/api/shorten', (req, res) => {
  const { url, customSlug } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'A valid URL is required.' });
  }

  // Basic URL validation
  let parsed;
  try {
    parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
  } catch {
    return res.status(400).json({ error: 'URL must start with http:// or https://' });
  }

  const slug = customSlug ? customSlug.trim().replace(/[^a-zA-Z0-9_-]/g, '') : nanoid(7);

  if (!slug) {
    return res.status(400).json({ error: 'Invalid custom slug.' });
  }

  if (db.urls[slug]) {
    if (db.urls[slug].original === url) {
      // Idempotent — return existing
      return res.json({ slug, shortUrl: buildShortUrl(req, slug), clicks: db.urls[slug].clicks });
    }
    return res.status(409).json({ error: 'That custom slug is already taken.' });
  }

  db.urls[slug] = {
    original: url,
    created: new Date().toISOString(),
    clicks: 0,
  };
  saveDB(db);

  return res.status(201).json({ slug, shortUrl: buildShortUrl(req, slug), clicks: 0 });
});

// ── API: stats for all URLs ───────────────────────────────────────────────────

app.get('/api/urls', (req, res) => {
  const list = Object.entries(db.urls).map(([slug, entry]) => ({
    slug,
    original: entry.original,
    shortUrl: buildShortUrl(req, slug),
    clicks: entry.clicks,
    created: entry.created,
  }));
  // Newest first
  list.sort((a, b) => new Date(b.created) - new Date(a.created));
  res.json(list);
});

// ── API: delete a URL ─────────────────────────────────────────────────────────

app.delete('/api/urls/:slug', (req, res) => {
  const { slug } = req.params;
  if (!db.urls[slug]) return res.status(404).json({ error: 'Not found.' });
  delete db.urls[slug];
  saveDB(db);
  res.json({ message: 'Deleted.' });
});

// ── Redirect ──────────────────────────────────────────────────────────────────

app.get('/:slug', (req, res) => {
  const { slug } = req.params;
  const entry = db.urls[slug];
  if (!entry) return res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  entry.clicks += 1;
  saveDB(db);
  res.redirect(301, entry.original);
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => console.log(`URL Shortener running on http://localhost:${PORT}`));

function buildShortUrl(req, slug) {
  return `${req.protocol}://${req.get('host')}/${slug}`;
}
