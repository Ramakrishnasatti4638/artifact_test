const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory store: Map<shortCode, { shortCode, originalUrl, createdAt, clickCount }>
const store = new Map();

const ALPHANUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateCode(length = 6) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ALPHANUM[Math.floor(Math.random() * ALPHANUM.length)];
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
    return res.status(400).json({ error: 'Invalid URL. Must be a valid http or https URL.' });
  }

  let shortCode;

  if (customAlias) {
    if (!/^[A-Za-z0-9_-]+$/.test(customAlias)) {
      return res.status(400).json({ error: 'Custom alias may only contain letters, numbers, hyphens, and underscores.' });
    }
    if (store.has(customAlias)) {
      return res.status(409).json({ error: `Alias "${customAlias}" is already taken.` });
    }
    shortCode = customAlias;
  } else {
    // Generate a unique code
    let attempts = 0;
    do {
      shortCode = generateCode();
      attempts++;
      if (attempts > 20) {
        return res.status(500).json({ error: 'Could not generate a unique short code. Try again.' });
      }
    } while (store.has(shortCode));
  }

  const entry = {
    shortCode,
    originalUrl: url,
    createdAt: new Date().toISOString(),
    clickCount: 0,
  };

  store.set(shortCode, entry);
  return res.status(201).json(entry);
});

// GET /api/links
app.get('/api/links', (req, res) => {
  const links = Array.from(store.values()).sort((a, b) => b.clickCount - a.clickCount);
  res.json(links);
});

// DELETE /api/links/:shortCode
app.delete('/api/links/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  if (!store.has(shortCode)) {
    return res.status(404).json({ error: 'Short link not found.' });
  }
  store.delete(shortCode);
  res.status(200).json({ message: 'Deleted successfully.' });
});

// GET /:shortCode  — must come after all /api routes
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const entry = store.get(shortCode);
  if (!entry) {
    return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  entry.clickCount += 1;
  res.redirect(302, entry.originalUrl);
});

module.exports = { app, store };
