const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// In-memory storage for form submissions
const submissions = [];

// API endpoint to submit the complete form
app.post('/api/submit', (req, res) => {
  const { name, email, plan } = req.body;

  // Basic validation
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
    id: submissions.length + 1,
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

// API endpoint to get all submissions
app.get('/api/submissions', (req, res) => {
  res.json(submissions);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
