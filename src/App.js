import React, { useState } from 'react';
import './App.css';
import Counter from './components/Counter';
import TodoList from './components/TodoList';

function App() {
  const [activeTab, setActiveTab] = useState('counter');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Welcome to React</h1>
        <p>A sample React web app with multiple features</p>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn ${activeTab === 'counter' ? 'active' : ''}`}
          onClick={() => setActiveTab('counter')}
        >
          Counter
        </button>
        <button
          className={`nav-btn ${activeTab === 'todos' ? 'active' : ''}`}
          onClick={() => setActiveTab('todos')}
        >
          Todo List
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'counter' && <Counter />}
        {activeTab === 'todos' && <TodoList />}
      </main>
    </div>
  );
}

export default App;
