const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory store
const links = new Map();

function generateCode() {
  return Math.random().toString(36).slice(2, 8);
}

// POST /api/shorten
app.post('/api/shorten', (req, res) => {
  const { url, alias } = req.body;

  if (!url || !/^https?:\/\/.+/.test(url)) {
    return res.status(400).json({ error: 'Invalid URL. Must start with http:// or https://' });
  }

  const code = alias || generateCode();

  if (links.has(code)) {
    return res.status(409).json({ error: 'Alias already in use' });
  }

  links.set(code, { url, code, clicks: 0, createdAt: new Date().toISOString() });
  res.status(201).json({ shortCode: code, shortUrl: `/go/${code}` });
});

// GET /api/links
app.get('/api/links', (req, res) => {
  const all = [...links.values()].sort((a, b) => b.clicks - a.clicks);
  res.json(all);
});

// DELETE /api/links/:code
app.delete('/api/links/:code', (req, res) => {
  const { code } = req.params;
  if (!links.has(code)) return res.status(404).json({ error: 'Not found' });
  links.delete(code);
  res.json({ message: 'Deleted' });
});

// GET /go/:code — redirect
app.get('/go/:code', (req, res) => {
  const entry = links.get(req.params.code);
  if (!entry) return res.status(404).send('Link not found');
  entry.clicks++;
  res.redirect(302, entry.url);
});

// Test-only: reset all links (only active when NODE_ENV=test)
if (process.env.NODE_ENV === 'test') {
  app.delete('/api/__reset', (_req, res) => {
    links.clear();
    res.json({ ok: true });
  });
}

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}
