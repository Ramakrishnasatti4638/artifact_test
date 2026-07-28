const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

let expenses = [
  { id: 1, description: 'Grocery shopping', amount: 85.50, date: '2024-01-15' },
  { id: 2, description: 'Electric bill', amount: 120.00, date: '2024-01-10' },
  { id: 3, description: 'Restaurant dinner', amount: 65.75, date: '2024-01-18' }
];
let nextId = 4;

app.get('/api/expenses', (req, res) => {
  res.json(expenses);
});

app.post('/api/expenses', (req, res) => {
  const { description, amount, date } = req.body;
  
  if (!description || !amount || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const expense = {
    id: nextId++,
    description,
    amount: parseFloat(amount),
    date
  };

  expenses.push(expense);
  res.status(201).json(expense);
});

app.listen(PORT, () => {
  console.log(`Expense tracker running on http://localhost:${PORT}`);
});
