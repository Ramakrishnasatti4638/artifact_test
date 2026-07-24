const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3000;

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

// API endpoint to save form data for current step
app.post('/api/save-step', (req, res) => {
  const { step, data } = req.body;
  
  if (!req.session.formData) {
    req.session.formData = {};
  }
  
  req.session.formData[`step${step}`] = data;
  res.json({ success: true, message: 'Step data saved' });
});

// API endpoint to get all form data
app.get('/api/form-data', (req, res) => {
  res.json(req.session.formData || {});
});

// API endpoint to submit final form
app.post('/api/submit', (req, res) => {
  const formData = req.session.formData || {};
  
  // Here you would typically save to a database
  console.log('Form submitted:', formData);
  
  // Clear session data after submission
  req.session.formData = {};
  
  res.json({ 
    success: true, 
    message: 'Form submitted successfully!',
    data: formData
  });
});

// API endpoint to reset form
app.post('/api/reset', (req, res) => {
  req.session.formData = {};
  res.json({ success: true, message: 'Form reset' });
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
