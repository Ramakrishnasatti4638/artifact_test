const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const store = new Map();

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function generateShortCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

app.post('/api/shorten', (req, res) => {
  const { url, customAlias } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  let shortCode;
  if (customAlias) {
    if (store.has(customAlias)) {
      return res.status(409).json({ error: 'Custom alias already taken' });
    }
    shortCode = customAlias;
  } else {
    do {
      shortCode = generateShortCode();
    } while (store.has(shortCode));
  }

  const linkData = {
    shortCode,
    originalUrl: url,
    createdAt: new Date().toISOString(),
    clickCount: 0
  };

  store.set(shortCode, linkData);

  res.status(201).json({
    shortCode,
    originalUrl: url,
    shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
    createdAt: linkData.createdAt
  });
});

app.get('/api/links', (req, res) => {
  const links = Array.from(store.values()).sort((a, b) => b.clickCount - a.clickCount);
  res.json(links);
});

app.delete('/api/links/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  if (!store.has(shortCode)) {
    return res.status(404).json({ error: 'Short code not found' });
  }

  store.delete(shortCode);
  res.status(204).send();
});

app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  if (!store.has(shortCode)) {
    return res.status(404).json({ error: 'Short code not found' });
  }

  const linkData = store.get(shortCode);
  linkData.clickCount++;

  res.redirect(302, linkData.originalUrl);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`URL Shortener running on http://localhost:${PORT}`);
  });
}

module.exports = app;
