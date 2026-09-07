import { useState } from 'react'
import './URLForm.css'

export default function URLForm({ onShorten, loading, error }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      onShorten(input)
      setInput('')
    }
  }

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="url-form">
        <div className="form-group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your long URL here..."
            className="url-input"
            disabled={loading}
          />
          <button 
            type="submit" 
            className="shorten-btn"
            disabled={loading || !input.trim()}
          >
            {loading ? 'Shortening...' : 'Shorten URL'}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  )
}
