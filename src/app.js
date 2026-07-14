const express = require('express');
const path = require('path');
const { randomBytes } = require('crypto');

const app = express();
app.locals.links = new Map();

const ALPHANUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateShortCode(length = 6) {
  let code = '';
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += ALPHANUM[bytes[i] % ALPHANUM.length];
  }
  return code;
}

function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    // Avoid dangerous protocols that could lead to XSS or unexpected behavior.
    return parsed.protocol !== 'javascript:' && parsed.protocol !== 'data:';
  } catch {
    return false;
  }
}

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.post('/api/shorten', (req, res) => {
  const { url, customAlias } = req.body;
  if (!url || typeof url !== 'string' || !isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  let shortCode = customAlias;
  if (shortCode) {
    if (typeof shortCode !== 'string') {
      return res.status(400).json({ error: 'customAlias must be a string' });
    }
    if (req.app.locals.links.has(shortCode)) {
      return res.status(409).json({ error: 'Alias already taken' });
    }
  } else {
    do {
      shortCode = generateShortCode();
    } while (req.app.locals.links.has(shortCode));
  }

  const link = {
    shortCode,
    originalUrl: url,
    createdAt: new Date().toISOString(),
    clickCount: 0,
  };
  req.app.locals.links.set(shortCode, link);

  const host = req.get('host') || 'localhost';
  const shortUrl = `${req.protocol}://${host}/${shortCode}`;

  res.status(201).json({ shortCode, shortUrl, originalUrl: url });
});

app.get('/api/links', (req, res) => {
  const all = Array.from(req.app.locals.links.values()).sort(
    (a, b) => b.clickCount - a.clickCount
  );
  res.json(all);
});

app.get('/:shortCode', (req, res) => {
  const link = req.app.locals.links.get(req.params.shortCode);
  if (!link) {
    return res.status(404).json({ error: 'Short code not found' });
  }
  link.clickCount++;
  res.redirect(302, link.originalUrl);
});

app.delete('/api/links/:shortCode', (req, res) => {
  const existed = req.app.locals.links.delete(req.params.shortCode);
  if (!existed) {
    return res.status(404).json({ error: 'Short code not found' });
  }
  res.sendStatus(204);
});

module.exports = app;
