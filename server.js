const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: 'form-wizard-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// API Routes

// Get current form data
app.get('/api/form-data', (req, res) => {
  const formData = req.session.formData || {
    step1: {},
    step2: {},
    currentStep: 1
  };
  res.json(formData);
});

// Save step 1 data
app.post('/api/step1', (req, res) => {
  if (!req.session.formData) {
    req.session.formData = { step1: {}, step2: {}, currentStep: 1 };
  }
  
  const { name, email } = req.body;
  
  // Validate
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid email' });
  }
  
  req.session.formData.step1 = { name, email };
  req.session.formData.currentStep = 2;
  
  res.json({ success: true, currentStep: 2 });
});

// Save step 2 data
app.post('/api/step2', (req, res) => {
  if (!req.session.formData) {
    return res.status(400).json({ error: 'Session expired. Please start over.' });
  }
  
  const { plan } = req.body;
  
  if (!plan) {
    return res.status(400).json({ error: 'Please select a plan' });
  }
  
  req.session.formData.step2 = { plan };
  req.session.formData.currentStep = 3;
  
  res.json({ success: true, currentStep: 3 });
});

// Submit final form
app.post('/api/submit', (req, res) => {
  if (!req.session.formData || !req.session.formData.step1 || !req.session.formData.step2) {
    return res.status(400).json({ error: 'Incomplete form data' });
  }
  
  const submissionData = {
    ...req.session.formData.step1,
    ...req.session.formData.step2,
    submittedAt: new Date().toISOString()
  };
  
  // Clear session
  req.session.formData = null;
  
  res.json({ 
    success: true, 
    message: 'Form submitted successfully!',
    data: submissionData
  });
});

// Reset form
app.post('/api/reset', (req, res) => {
  req.session.formData = null;
  res.json({ success: true });
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
