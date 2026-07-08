const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

let tasks = [];
let nextId = 1;

// List all tasks
app.get('/tasks', (req, res) => {
  res.status(200).json(tasks);
});

// Add a task
app.post('/tasks', (req, res) => {
  const { title, priority } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required.' });
  }

  const validPriorities = ['Low', 'Medium', 'High'];
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'Priority must be Low, Medium, or High.' });
  }

  const task = { id: nextId++, title: title.trim(), priority };
  tasks.push(task);
  res.status(201).json(task);
});

// Delete a task
app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  tasks.splice(index, 1);
  res.status(204).send();
});

// Expose reset helper for tests
app._resetTasks = () => {
  tasks = [];
  nextId = 1;
};

module.exports = app;
