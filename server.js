'use strict';

const path = require('path');
const express = require('express');
const {
  isValidUrl,
  isValidAlias,
  generateShortCode,
} = require('./utils');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  // In-memory store: shortCode -> link record.
  const links = new Map();

  function buildShortUrl(req, shortCode) {
    return `${req.protocol}://${req.get('host')}/${shortCode}`;
  }

  // Create a shortened URL.
  app.post('/api/shorten', (req, res) => {
    const { url, customAlias } = req.body || {};

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'url is required' });
    }
    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'url is not a valid URL' });
    }

    let shortCode;
    if (customAlias !== undefined && customAlias !== null && customAlias !== '') {
      if (!isValidAlias(customAlias)) {
        return res.status(400).json({
          error:
            'customAlias may only contain letters, numbers, hyphens and underscores',
        });
      }
      if (links.has(customAlias)) {
        return res.status(409).json({ error: 'alias already taken' });
      }
      shortCode = customAlias;
    } else {
      do {
        shortCode = generateShortCode();
      } while (links.has(shortCode));
    }

    const record = {
      shortCode,
      originalUrl: url,
      createdAt: new Date().toISOString(),
      clickCount: 0,
    };
    links.set(shortCode, record);

    return res.status(201).json({
      ...record,
      shortUrl: buildShortUrl(req, shortCode),
    });
  });

  // Get all links, sorted by clickCount descending.
  app.get('/api/links', (req, res) => {
    const all = Array.from(links.values())
      .map((record) => ({
        ...record,
        shortUrl: buildShortUrl(req, record.shortCode),
      }))
      .sort((a, b) => b.clickCount - a.clickCount);
    return res.json(all);
  });

  // Delete a link.
  app.delete('/api/links/:shortCode', (req, res) => {
    const { shortCode } = req.params;
    if (!links.has(shortCode)) {
      return res.status(404).json({ error: 'short code not found' });
    }
    links.delete(shortCode);
    return res.status(204).end();
  });

  // Redirect a short code to its original URL.
  app.get('/:shortCode', (req, res) => {
    const { shortCode } = req.params;
    const record = links.get(shortCode);
    if (!record) {
      return res.status(404).json({ error: 'short code not found' });
    }
    record.clickCount += 1;
    return res.redirect(302, record.originalUrl);
  });

  return app;
}

module.exports = createApp;

if (require.main === module) {
  const port = process.env.PORT || 3000;
  createApp().listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`URL shortener listening on http://localhost:${port}`);
  });
}
