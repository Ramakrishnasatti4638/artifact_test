const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory expenses store seeded with 3 hardcoded entries
let expenses = [
  { id: 1, description: 'Grocery Shopping', amount: 84.50, date: '2025-06-01' },
  { id: 2, description: 'Electric Bill',    amount: 120.00, date: '2025-06-03' },
  { id: 3, description: 'Netflix Subscription', amount: 15.99, date: '2025-06-05' },
];
let nextId = 4;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/expenses', (req, res) => {
  res.json(expenses);
});

app.post('/api/expenses', (req, res) => {
  const { description, amount, date } = req.body;
  if (!description || !amount || !date) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  const parsed = parseFloat(amount);
  if (isNaN(parsed) || parsed <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number.' });
  }
  const expense = { id: nextId++, description, amount: parsed, date };
  expenses.push(expense);
  res.status(201).json(expense);
});

app.delete('/api/expenses/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = expenses.findIndex(e => e.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found.' });
  expenses.splice(idx, 1);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Expense Tracker running at http://localhost:${PORT}`);
});
