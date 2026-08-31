import React, { useState } from 'react';
import axios from 'axios';
import './ShortenForm.css';

function ShortenForm({ onUrlCreated }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/shorten', {
        originalUrl: url
      });

      onUrlCreated(response.data);
      setUrl('');
      setSuccess(`Short URL created: ${response.data.shortenedUrl}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create short URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="shorten-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter your long URL here..."
          className="url-input"
          disabled={loading}
        />
        <button
          type="submit"
          className="shorten-btn"
          disabled={loading}
        >
          {loading ? 'Shortening...' : 'Shorten'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </form>
  );
}

export default ShortenForm;
