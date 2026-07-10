'use strict';

const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── In-memory store ──────────────────────────────────────────────────────────
// Map<shortCode, { shortCode, originalUrl, createdAt, clickCount }>
const store = new Map();

// ── Helpers ──────────────────────────────────────────────────────────────────

function isValidUrl(raw) {
  try {
    const u = new URL(raw);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  const bytes = crypto.randomBytes(6);
  for (const byte of bytes) {
    code += chars[byte % chars.length];
  }
  return code;
}

// ── Routes ───────────────────────────────────────────────────────────────────

// POST /api/shorten
app.post('/api/shorten', (req, res) => {
  const { url, customAlias } = req.body;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL. Must be a valid http/https URL.' });
  }

  let shortCode;

  if (customAlias) {
    if (!/^[A-Za-z0-9_-]{1,32}$/.test(customAlias)) {
      return res.status(400).json({
        error: 'Custom alias may only contain letters, numbers, hyphens, and underscores (max 32 chars).',
      });
    }
    if (store.has(customAlias)) {
      return res.status(409).json({ error: `Alias "${customAlias}" is already taken.` });
    }
    shortCode = customAlias;
  } else {
    // Collision-safe random code
    let attempts = 0;
    do {
      shortCode = generateCode();
      attempts++;
      if (attempts > 10) {
        return res.status(500).json({ error: 'Could not generate a unique short code. Try again.' });
      }
    } while (store.has(shortCode));
  }

  const record = {
    shortCode,
    originalUrl: url,
    createdAt: new Date().toISOString(),
    clickCount: 0,
  };

  store.set(shortCode, record);
  return res.status(201).json(record);
});

// GET /api/links — all links sorted by clickCount desc
app.get('/api/links', (_req, res) => {
  const links = Array.from(store.values()).sort((a, b) => b.clickCount - a.clickCount);
  res.json(links);
});

// DELETE /api/links/:shortCode
app.delete('/api/links/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  if (!store.has(shortCode)) {
    return res.status(404).json({ error: 'Short code not found.' });
  }
  store.delete(shortCode);
  res.status(204).end();
});

// GET /:shortCode — redirect
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const record = store.get(shortCode);
  if (!record) {
    return res.status(404).json({ error: 'Short code not found.' });
  }
  record.clickCount += 1;
  res.redirect(302, record.originalUrl);
});

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

/* istanbul ignore next */
if (require.main === module) {
  app.listen(PORT, () => console.log(`URL Shortener running on http://localhost:${PORT}`));
}

module.exports = { app, store };
