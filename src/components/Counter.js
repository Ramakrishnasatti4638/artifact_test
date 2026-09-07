import React, { useState } from 'react';
import './Counter.css';

function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(0);

  return (
    <div className="counter-container">
      <h2>Counter Component</h2>
      <div className="counter-display">{count}</div>
      <div className="counter-buttons">
        <button className="btn btn-primary" onClick={decrement}>
          Decrease
        </button>
        <button className="btn btn-secondary" onClick={reset}>
          Reset
        </button>
        <button className="btn btn-primary" onClick={increment}>
          Increase
        </button>
      </div>
      <p className="counter-info">
        Click the buttons to change the counter value
      </p>
    </div>
  );
}

export default Counter;
