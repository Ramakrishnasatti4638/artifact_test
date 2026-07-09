const express = require('express');
const path = require('path');
const links = require('./store');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── helpers ──────────────────────────────────────────────────────────────────

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateCode(len = 6) {
  let code = '';
  for (let i = 0; i < len; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

function isValidUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// ── POST /api/shorten ────────────────────────────────────────────────────────

app.post('/api/shorten', (req, res) => {
  const { url, customAlias } = req.body;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid or missing URL. Must start with http:// or https://' });
  }

  let shortCode;

  if (customAlias) {
    if (!/^[A-Za-z0-9_-]{1,32}$/.test(customAlias)) {
      return res.status(400).json({ error: 'Custom alias may only contain letters, numbers, hyphens and underscores (max 32 chars).' });
    }
    if (links.has(customAlias)) {
      return res.status(409).json({ error: `Alias "${customAlias}" is already taken.` });
    }
    shortCode = customAlias;
  } else {
    // Generate a unique 6-char code
    let attempts = 0;
    do {
      shortCode = generateCode();
      attempts++;
      if (attempts > 100) {
        return res.status(500).json({ error: 'Could not generate a unique code. Try again.' });
      }
    } while (links.has(shortCode));
  }

  const entry = {
    shortCode,
    originalUrl: url,
    createdAt: new Date().toISOString(),
    clickCount: 0,
  };

  links.set(shortCode, entry);
  return res.status(201).json(entry);
});

// ── GET /api/links ───────────────────────────────────────────────────────────

app.get('/api/links', (req, res) => {
  const sorted = [...links.values()].sort((a, b) => b.clickCount - a.clickCount);
  return res.json(sorted);
});

// ── DELETE /api/links/:shortCode ─────────────────────────────────────────────

app.delete('/api/links/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  if (!links.has(shortCode)) {
    return res.status(404).json({ error: 'Short code not found.' });
  }
  links.delete(shortCode);
  return res.status(200).json({ message: 'Deleted successfully.' });
});

// ── GET /:shortCode ──────────────────────────────────────────────────────────
// Must come AFTER API routes so /api/* paths are not matched here.

app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  // Prevent the redirect handler from swallowing requests to the root page
  if (shortCode === 'index.html' || shortCode === 'favicon.ico') {
    return res.status(404).end();
  }

  const entry = links.get(shortCode);
  if (!entry) {
    return res.status(404).json({ error: 'Short code not found.' });
  }

  entry.clickCount += 1;
  return res.redirect(302, entry.originalUrl);
});

// ── start ────────────────────────────────────────────────────────────────────

module.exports = app;   // exported for tests

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`URL shortener running on http://localhost:${PORT}`));
}
