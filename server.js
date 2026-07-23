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

// API endpoint to submit form data
app.post('/api/submit', (req, res) => {
  const { name, email, plan } = req.body;

  if (!name || !email || !plan) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required' 
    });
  }

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
