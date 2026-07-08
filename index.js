const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }
  res.send(`<p style="font-family:sans-serif;text-align:center;margin-top:2rem;">Login received for <strong>${email}</strong>. (Demo only — no real auth.)</p>`);
});

app.post('/register', (req, res) => {
  const { name, email, password, confirm_password } = req.body;
  if (!name || !email || !password || !confirm_password) {
    return res.status(400).send('All fields are required.');
  }
  if (password !== confirm_password) {
    return res.status(400).send('Passwords do not match.');
  }
  res.send(`<p style="font-family:sans-serif;text-align:center;margin-top:2rem;">Account created for <strong>${email}</strong>. (Demo only — no real auth.)</p>`);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
