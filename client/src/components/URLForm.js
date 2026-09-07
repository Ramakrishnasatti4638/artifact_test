import React, { useState } from 'react';
import './URLForm.css';

function URLForm({ onUrlShortened }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to shorten URL');
      }

      const data = await response.json();
      onUrlShortened(data);
      setUrl('');
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="url-form">
      <div className="form-group">
        <label htmlFor="url">Enter a URL to shorten</label>
        <input
          id="url"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/very/long/url"
          disabled={loading}
          className="url-input"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        type="submit"
        disabled={loading || !url.trim()}
        className="submit-btn"
      >
        {loading ? 'Shortening...' : 'Shorten URL'}
      </button>
    </form>
  );
}

export default URLForm;
