const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// In-memory storage for form submissions
const submissions = [];

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to save form data
app.post('/api/submit', (req, res) => {
  const { name, email, plan } = req.body;
  
  // Validate required fields
  if (!name || !email || !plan) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      message: 'Name, email, and plan are required' 
    });
  }
  
  // Simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Invalid email',
      message: 'Please provide a valid email address' 
    });
  }
  
  const submission = {
    id: submissions.length + 1,
    name,
    email,
    plan,
    submittedAt: new Date().toISOString()
  };
  
  submissions.push(submission);
  
  res.status(201).json({
    success: true,
    message: 'Form submitted successfully',
    data: submission
  });
});

// Get all submissions (for testing purposes)
app.get('/api/submissions', (req, res) => {
  res.json({
    count: submissions.length,
    submissions
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
