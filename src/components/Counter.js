import React, { useState } from 'react';
import './Counter.css';

function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(0);

  return (
    <div className="counter-container">
      <div className="counter-card">
        <h2>Counter App</h2>
        <div className="counter-display">
          <p className="count-value">{count}</p>
        </div>
        <div className="counter-buttons">
          <button className="btn btn-minus" onClick={decrement}>
            Decrease
          </button>
          <button className="btn btn-reset" onClick={reset}>
            Reset
          </button>
          <button className="btn btn-plus" onClick={increment}>
            Increase
          </button>
        </div>
      </div>
    </div>
  );
}

export default Counter;
