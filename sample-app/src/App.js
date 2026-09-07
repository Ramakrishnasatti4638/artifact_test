import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTodos(prevTodos =>
        prevTodos.map(todo => {
          if (todo.timerActive && todo.timeLeft > 0) {
            return { ...todo, timeLeft: todo.timeLeft - 1 };
          } else if (todo.timerActive && todo.timeLeft === 0) {
            return { ...todo, timerActive: false };
          }
          return todo;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { 
        id: Date.now(), 
        text: input, 
        completed: false,
        timerMinutes: 5,
        timeLeft: 0,
        timerActive: false
      }]);
      setInput('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const setTimerMinutes = (id, minutes) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, timerMinutes: Math.max(1, minutes), timeLeft: 0, timerActive: false } : todo
    ));
  };

  const startTimer = (id) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, timerActive: true, timeLeft: todo.timeLeft || todo.timerMinutes * 60 };
      }
      return todo;
    }));
  };

  const pauseTimer = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, timerActive: false } : todo
    ));
  };

  const resetTimer = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, timerActive: false, timeLeft: 0 } : todo
    ));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>📝 My Todo App</h1>
        <div className="input-group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a new todo..."
            className="input"
          />
          <button onClick={addTodo} className="btn-add">Add</button>
        </div>

        <div className="stats">
          <p>Total: <strong>{todos.length}</strong></p>
          <p>Completed: <strong>{todos.filter(t => t.completed).length}</strong></p>
        </div>

        <ul className="todo-list">
          {todos.length === 0 ? (
            <li className="empty">No todos yet. Add one to get started!</li>
          ) : (
            todos.map(todo => (
              <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''} ${todo.timerActive ? 'timer-active' : ''}`}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="checkbox"
                />
                <div className="todo-content">
                  <span className="todo-text">{todo.text}</span>
                  <div className="timer-section">
                    <div className="timer-display">
                      <span className="timer-label">⏱️</span>
                      <span className={`timer-time ${todo.timerActive ? 'running' : ''}`}>
                        {todo.timeLeft > 0 ? formatTime(todo.timeLeft) : formatTime(todo.timerMinutes * 60)}
                      </span>
                    </div>
                    <div className="timer-controls">
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={todo.timerMinutes}
                        onChange={(e) => setTimerMinutes(todo.id, parseInt(e.target.value) || 1)}
                        disabled={todo.timerActive}
                        className="timer-input"
                        title="Minutes"
                      />
                      <button
                        onClick={() => todo.timerActive ? pauseTimer(todo.id) : startTimer(todo.id)}
                        className={`btn-timer ${todo.timerActive ? 'btn-pause' : 'btn-start'}`}
                      >
                        {todo.timerActive ? '⏸' : '▶'}
                      </button>
                      <button
                        onClick={() => resetTimer(todo.id)}
                        className="btn-timer btn-reset"
                      >
                        ⟲
                      </button>
                    </div>
                  </div>
                </div>
                <button onClick={() => deleteTodo(todo.id)} className="btn-delete">Delete</button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;
