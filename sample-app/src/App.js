import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', completed: false, timerDuration: 0, timerRemaining: 0, timerActive: false },
    { id: 2, text: 'Build a todo app', completed: false, timerDuration: 0, timerRemaining: 0, timerActive: false },
    { id: 3, text: 'Master state management', completed: false, timerDuration: 0, timerRemaining: 0, timerActive: false },
  ]);
  const [input, setInput] = useState('');
  const [timerInput, setTimerInput] = useState('');

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTodos(prevTodos =>
        prevTodos.map(todo => {
          if (todo.timerActive && todo.timerRemaining > 0) {
            const newRemaining = todo.timerRemaining - 1;
            if (newRemaining === 0) {
              // Timer finished - play notification
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Timer Complete!', { body: `Timer finished for: ${todo.text}` });
              }
            }
            return { ...todo, timerRemaining: newRemaining, timerActive: newRemaining > 0 };
          }
          return todo;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addTodo = () => {
    if (input.trim() === '') return;
    const newTodo = {
      id: Date.now(),
      text: input,
      completed: false,
      timerDuration: 0,
      timerRemaining: 0,
      timerActive: false,
    };
    setTodos([...todos, newTodo]);
    setInput('');
  };

  const toggleComplete = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const startTimer = (id, duration) => {
    if (duration <= 0) return;
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, timerDuration: duration, timerRemaining: duration, timerActive: true } : todo
    ));
  };

  const pauseTimer = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, timerActive: false } : todo
    ));
  };

  const resumeTimer = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, timerActive: true } : todo
    ));
  };

  const resetTimer = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, timerRemaining: 0, timerActive: false, timerDuration: 0 } : todo
    ));
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const completedCount = todos.filter(todo => todo.completed).length;

  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <h1>📝 Todo App</h1>
          <p className="subtitle">Stay organized and track your tasks</p>
        </div>

        <div className="stats">
          <div className="stat">
            <span className="stat-label">Total</span>
            <span className="stat-value">{todos.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{completedCount}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Remaining</span>
            <span className="stat-value">{todos.length - completedCount}</span>
          </div>
        </div>

        <div className="input-section">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="Add a new task..."
            className="input"
          />
          <button onClick={addTodo} className="btn-add">
            Add
          </button>
        </div>

        <div className="todos-list">
          {todos.length === 0 ? (
            <p className="empty-state">No tasks yet. Add one to get started!</p>
          ) : (
            todos.map(todo => (
              <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleComplete(todo.id)}
                  className="checkbox"
                />
                <div className="todo-content">
                  <span className="todo-text">{todo.text}</span>
                  {todo.timerRemaining > 0 && (
                    <div className="timer-display">
                      <span className={`timer-value ${todo.timerActive ? 'active' : ''}`}>
                        ⏱️ {formatTime(todo.timerRemaining)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="todo-actions">
                  {todo.timerRemaining === 0 ? (
                    <div className="timer-input-group">
                      <input
                        type="number"
                        min="1"
                        max="3600"
                        placeholder="sec"
                        value={timerInput}
                        onChange={(e) => setTimerInput(e.target.value)}
                        className="timer-input"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && timerInput) {
                            startTimer(todo.id, parseInt(timerInput));
                            setTimerInput('');
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (timerInput) {
                            startTimer(todo.id, parseInt(timerInput));
                            setTimerInput('');
                          }
                        }}
                        className="btn-timer-start"
                        aria-label="Start timer"
                      >
                        ▶
                      </button>
                    </div>
                  ) : (
                    <div className="timer-controls">
                      {todo.timerActive ? (
                        <button
                          onClick={() => pauseTimer(todo.id)}
                          className="btn-timer-control"
                          aria-label="Pause timer"
                        >
                          ⏸
                        </button>
                      ) : (
                        <button
                          onClick={() => resumeTimer(todo.id)}
                          className="btn-timer-control"
                          aria-label="Resume timer"
                        >
                          ▶
                        </button>
                      )}
                      <button
                        onClick={() => resetTimer(todo.id)}
                        className="btn-timer-reset"
                        aria-label="Reset timer"
                      >
                        ↻
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="btn-delete"
                  aria-label="Delete task"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
