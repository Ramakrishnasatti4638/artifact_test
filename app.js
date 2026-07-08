const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

// Hardcoded expenses
const expenses = [
  { id: 1, description: 'Grocery Shopping', amount: 52.75, date: '2024-01-15' },
  { id: 2, description: 'Gas', amount: 45.00, date: '2024-01-16' },
  { id: 3, description: 'Restaurant Dinner', amount: 38.50, date: '2024-01-17' }
];

// Route to serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API route to get all expenses
app.get('/api/expenses', (req, res) => {
  res.json(expenses);
});

// API route to add a new expense
app.post('/api/expenses', (req, res) => {
  const { description, amount, date } = req.body;
  
  if (!description || !amount || !date) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const newExpense = {
    id: Math.max(...expenses.map(e => e.id), 0) + 1,
    description,
    amount: parseFloat(amount),
    date
  };

  expenses.push(newExpense);
  res.status(201).json(newExpense);
});

app.listen(PORT, () => {
  console.log(`Expense tracker running at http://localhost:${PORT}`);
});
