const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// In-memory toggle state
let toggleState = { isOn: false };

// API endpoint to get toggle state
app.get('/api/toggle', (req, res) => {
  res.json(toggleState);
});

// API endpoint to update toggle state
app.post('/api/toggle', (req, res) => {
  const { isOn } = req.body;
  
  if (typeof isOn !== 'boolean') {
    return res.status(400).json({ error: 'isOn must be a boolean' });
  }
  
  toggleState.isOn = isOn;
  res.json(toggleState);
});

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Toggle switch app running on http://localhost:${PORT}`);
});
