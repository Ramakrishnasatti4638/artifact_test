const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

let toggleState = false;

app.get('/api/toggle', (req, res) => {
  res.json({ state: toggleState });
});

app.post('/api/toggle', (req, res) => {
  toggleState = !toggleState;
  res.json({ state: toggleState });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
