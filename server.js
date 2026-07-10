const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const links = new Map();

function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

app.post('/api/shorten', (req, res) => {
  const { url, customAlias } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  let shortCode = customAlias || generateShortCode();

  if (links.has(shortCode)) {
    return res.status(409).json({ error: 'Custom alias already taken' });
  }

  while (!customAlias && links.has(shortCode)) {
    shortCode = generateShortCode();
  }

  const linkData = {
    shortCode,
    originalUrl: url,
    createdAt: new Date().toISOString(),
    clickCount: 0
  };

  links.set(shortCode, linkData);

  res.status(201).json({
    shortCode,
    shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
    originalUrl: url
  });
});

app.get('/api/links', (req, res) => {
  const allLinks = Array.from(links.values())
    .sort((a, b) => b.clickCount - a.clickCount);
  
  res.json(allLinks);
});

app.delete('/api/links/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  if (!links.has(shortCode)) {
    return res.status(404).json({ error: 'Short code not found' });
  }

  links.delete(shortCode);
  res.status(204).send();
});

app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  if (shortCode === 'favicon.ico') {
    return res.status(204).send();
  }

  const linkData = links.get(shortCode);

  if (!linkData) {
    return res.status(404).json({ error: 'Short code not found' });
  }

  linkData.clickCount++;
  links.set(shortCode, linkData);

  res.redirect(302, linkData.originalUrl);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`URL Shortener running on http://localhost:${PORT}`);
  });
}

module.exports = { app, links };
