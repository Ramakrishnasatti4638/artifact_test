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

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to submit form
app.post('/api/submit', (req, res) => {
  const { name, email, plan } = req.body;

  // Validation
  if (!name || !email || !plan) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required' 
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid email format' 
    });
  }

  // Store submission
  const submission = {
    id: Date.now(),
    name,
    email,
    plan,
    submittedAt: new Date().toISOString()
  };

  submissions.push(submission);

  res.json({ 
    success: true, 
    message: 'Form submitted successfully!',
    data: submission
  });
});

// Get all submissions (for testing/viewing)
app.get('/api/submissions', (req, res) => {
  res.json(submissions);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
