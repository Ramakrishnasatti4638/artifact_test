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

// API Routes
app.post('/api/submit', (req, res) => {
  const formData = req.body;
  
  // Validate required fields
  if (!formData.name || !formData.email || !formData.plan) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Store submission
  const submission = {
    id: submissions.length + 1,
    ...formData,
    submittedAt: new Date().toISOString()
  };
  
  submissions.push(submission);
  
  res.status(201).json({
    message: 'Form submitted successfully',
    data: submission
  });
});

// Get all submissions (for testing)
app.get('/api/submissions', (req, res) => {
  res.json(submissions);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
