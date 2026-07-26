const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Store form submissions (in-memory for demo)
const submissions = [];

// Serve the main form page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle form submission
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
    success: true, 
    message: 'Form submitted successfully!',
    data: submission 
  });
});

// Get all submissions
app.get('/api/submissions', (req, res) => {
  res.json(submissions);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
