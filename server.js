const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const submissions = [];

app.post('/api/submit', (req, res) => {
  const { name, email, plan } = req.body;

  if (!name || !email || !plan) {
    return res.status(400).json({ error: 'All fields are required' });
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
    message: 'Form submitted successfully!',
    data: submission
  });
});

app.get('/api/submissions', (req, res) => {
  res.json(submissions);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
