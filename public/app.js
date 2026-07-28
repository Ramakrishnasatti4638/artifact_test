const form = document.getElementById('expense-form');
const expensesBody = document.getElementById('expenses-body');
const totalAmount = document.getElementById('total-amount');

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

function calculateTotal(expenses) {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

function renderExpenses(expenses) {
  expensesBody.innerHTML = '';
  
  expenses.forEach(expense => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="date-col">${formatDate(expense.date)}</td>
      <td>${expense.description}</td>
      <td class="amount-col">${formatCurrency(expense.amount)}</td>
    `;
    expensesBody.appendChild(row);
  });

  const total = calculateTotal(expenses);
  totalAmount.textContent = formatCurrency(total);
}

async function loadExpenses() {
  try {
    const response = await fetch('/api/expenses');
    const expenses = await response.json();
    renderExpenses(expenses);
  } catch (error) {
    console.error('Error loading expenses:', error);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    description: document.getElementById('description').value,
    amount: parseFloat(document.getElementById('amount').value),
    date: document.getElementById('date').value
  };

  try {
    const response = await fetch('/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      form.reset();
      loadExpenses();
    } else {
      alert('Error adding expense');
    }
  } catch (error) {
    console.error('Error adding expense:', error);
    alert('Error adding expense');
  }
});

document.getElementById('date').valueAsDate = new Date();

loadExpenses();
