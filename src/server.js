const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`URL Shortener listening on http://localhost:${PORT}`);
});

module.exports = server;
