const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./db');
const shortenController = require('./controllers/shortenController');
const redirectController = require('./controllers/redirectController');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.post('/api/shorten', shortenController.createShortUrl);
app.get('/api/urls', shortenController.getAllUrls);
app.delete('/api/urls/:shortCode', shortenController.deleteUrl);
app.get('/api/stats/:shortCode', shortenController.getStats);

// Redirect route
app.get('/:shortCode', redirectController.redirect);

// Serve static files in production
app.use(express.static(path.join(__dirname, '../client/build')));

// Fallback to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Initialize database and start server
db.initialize(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

module.exports = app;
