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
app.post('/api/submit-form', (req, res) => {
  const { name, email, plan } = req.body;
  
  // Validate required fields
  if (!name || !email || !plan) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      details: { name: !name, email: !email, plan: !plan }
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  // Validate plan
  const validPlans = ['basic', 'pro', 'enterprise'];
  if (!validPlans.includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan selected' });
  }
  
  // Create submission
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
    submission
  });
});

// Get all submissions
app.get('/api/submissions', (req, res) => {
  res.json(submissions);
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
