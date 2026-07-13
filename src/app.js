'use strict';

const express = require('express');
const path = require('path');
const store = require('./store');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── Helpers ──────────────────────────────────────────────────────────────────

function isValidUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function randomCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ── API routes ────────────────────────────────────────────────────────────────

// POST /api/shorten
app.post('/api/shorten', (req, res) => {
  const { url, customAlias } = req.body;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid or missing URL. Must be http(s).' });
  }

  let shortCode;
  if (customAlias !== undefined && customAlias !== '') {
    // Validate alias: alphanumeric + hyphens, 2–32 chars
    if (!/^[A-Za-z0-9-]{2,32}$/.test(customAlias)) {
      return res.status(400).json({ error: 'Custom alias must be 2–32 alphanumeric characters or hyphens.' });
    }
    if (store.getByCode(customAlias)) {
      return res.status(409).json({ error: 'Custom alias is already taken.' });
    }
    shortCode = customAlias;
  } else {
    // Generate unique 6-char code
    let attempts = 0;
    do {
      shortCode = randomCode(6);
      attempts++;
    } while (store.getByCode(shortCode) && attempts < 10);
  }

  const entry = store.create(shortCode, url);
  return res.status(201).json(entry);
});

// GET /api/links
app.get('/api/links', (req, res) => {
  res.json(store.getAll());
});

// DELETE /api/links/:shortCode
app.delete('/api/links/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  if (!store.getByCode(shortCode)) {
    return res.status(404).json({ error: 'Short code not found.' });
  }
  store.remove(shortCode);
  res.status(204).end();
});

// GET /:shortCode  — must come LAST to avoid shadowing API routes
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const entry = store.getByCode(shortCode);
  if (!entry) {
    return res.status(404).json({ error: 'Short URL not found.' });
  }
  store.increment(shortCode);
  res.redirect(302, entry.originalUrl);
});

module.exports = app;
