const express = require('express');
const path = require('path');
const store = require('./store');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateCode() {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
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
    if (!/^[A-Za-z0-9_-]{1,32}$/.test(customAlias)) {
      return res.status(400).json({ error: 'Custom alias must be 1–32 alphanumeric, dash, or underscore characters.' });
    }
    if (store.has(customAlias)) {
      return res.status(409).json({ error: `Alias "${customAlias}" is already taken.` });
    }
    shortCode = customAlias;
  } else {
    // Generate unique 6-char code
    let attempts = 0;
    do {
      shortCode = generateCode();
      attempts++;
    } while (store.has(shortCode) && attempts < 10);
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

// GET /api/links — list all links sorted by clickCount desc
app.get('/api/links', (req, res) => {
  return res.json(store.getAll());
});

// DELETE /api/links/:shortCode
app.delete('/api/links/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  if (!store.has(shortCode)) {
    return res.status(404).json({ error: 'Short code not found.' });
  }
  store.remove(shortCode);
  return res.status(200).json({ message: 'Link deleted.' });
});

// GET /:shortCode — redirect
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const entry = store.get(shortCode);
  if (!entry) {
    return res.status(404).json({ error: 'Short code not found.' });
  }
  entry.clickCount += 1;
  return res.redirect(302, entry.originalUrl);
});

module.exports = app;
