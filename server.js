const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory store: { [shortCode]: { shortCode, originalUrl, createdAt, clickCount } }
const store = {};

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// POST /api/shorten
app.post('/api/shorten', (req, res) => {
  const { url, customAlias } = req.body;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL. Must be a valid http/https URL.' });
  }

  let shortCode;

  if (customAlias) {
    const alias = customAlias.trim();
    if (!/^[A-Za-z0-9_-]{1,32}$/.test(alias)) {
      return res.status(400).json({ error: 'Custom alias must be 1–32 alphanumeric characters (- and _ allowed).' });
    }
    if (store[alias]) {
      return res.status(409).json({ error: `Alias "${alias}" is already taken.` });
    }
    shortCode = alias;
  } else {
    // Generate unique 6-char code
    let attempts = 0;
    do {
      shortCode = generateCode();
      attempts++;
      if (attempts > 100) {
        return res.status(500).json({ error: 'Could not generate a unique short code. Try again.' });
      }
    } while (store[shortCode]);
  }

  store[shortCode] = {
    shortCode,
    originalUrl: url,
    createdAt: new Date().toISOString(),
    clickCount: 0,
  };

  res.status(201).json(store[shortCode]);
});

// GET /api/links — all links sorted by clickCount desc
app.get('/api/links', (req, res) => {
  const links = Object.values(store).sort((a, b) => b.clickCount - a.clickCount);
  res.json(links);
});

// DELETE /api/links/:shortCode
app.delete('/api/links/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  if (!store[shortCode]) {
    return res.status(404).json({ error: 'Short code not found.' });
  }
  delete store[shortCode];
  res.status(204).end();
});

// GET /:shortCode — redirect
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const entry = store[shortCode];
  if (!entry) {
    return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  entry.clickCount++;
  res.redirect(302, entry.originalUrl);
});

app.listen(PORT, () => {
  console.log(`URL Shortener running at http://localhost:${PORT}`);
});
