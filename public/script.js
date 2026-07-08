// Load expenses on page load
document.addEventListener('DOMContentLoaded', loadExpenses);

// Handle form submission
document.getElementById('expenseForm').addEventListener('submit', handleAddExpense);

// Fetch and display expenses
async function loadExpenses() {
  try {
    const response = await fetch('/api/expenses');
    const expenses = await response.json();
    displayExpenses(expenses);
  } catch (error) {
    console.error('Error loading expenses:', error);
  }
}

// Display expenses in table
function displayExpenses(expenses) {
  const tbody = document.getElementById('expensesList');
  tbody.innerHTML = '';

  if (expenses.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #999;">No expenses yet</td></tr>';
    updateTotal(0);
    return;
  }

  let total = 0;
  expenses.forEach(expense => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${expense.description}</td>
      <td>$${expense.amount.toFixed(2)}</td>
      <td>${formatDate(expense.date)}</td>
    `;
    tbody.appendChild(row);
    total += expense.amount;
  });

  updateTotal(total);
}

// Update the total
function updateTotal(total) {
  const totalCell = document.querySelector('.total-amount');
  totalCell.textContent = `$${total.toFixed(2)}`;
}

// Format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Handle add expense form submission
async function handleAddExpense(e) {
  e.preventDefault();

  const description = document.getElementById('description').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const date = document.getElementById('date').value;

  if (!description || !amount || !date) {
    showMessage('Please fill in all fields', 'error');
    return;
  }

  try {
    const response = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, amount, date })
    });

    if (response.ok) {
      document.getElementById('expenseForm').reset();
      showMessage('Expense added successfully!', 'success');
      loadExpenses();
    } else {
      showMessage('Failed to add expense', 'error');
    }
  } catch (error) {
    console.error('Error adding expense:', error);
    showMessage('Error adding expense', 'error');
  }
}

// Show message feedback
function showMessage(text, type) {
  // Create message element if it doesn't exist
  let message = document.querySelector('.message');
  if (!message) {
    message = document.createElement('div');
    message.className = 'message';
    document.querySelector('.form-section').insertBefore(message, document.querySelector('form'));
  }

  message.textContent = text;
  message.className = `message show ${type}`;

  setTimeout(() => {
    message.classList.remove('show');
  }, 3000);
}
