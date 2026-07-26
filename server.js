const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// In-memory storage for form submissions
const submissions = [];

// API endpoint to save form data
app.post('/api/submit', (req, res) => {
  const formData = req.body;
  formData.submittedAt = new Date().toISOString();
  submissions.push(formData);
  
  res.json({ 
    success: true, 
    message: 'Form submitted successfully!',
    data: formData
  });
});

// API endpoint to get all submissions
app.get('/api/submissions', (req, res) => {
  res.json(submissions);
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
