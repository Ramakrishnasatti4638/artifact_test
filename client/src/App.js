import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const response = await axios.get('/api/urls');
      setUrls(response.data);
    } catch (err) {
      console.error('Error fetching URLs:', err);
    }
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    setError('');
    setShortUrl('');
    setLoading(true);

    try {
      const response = await axios.post('/api/shorten', { url });
      setShortUrl(response.data.shortUrl);
      setUrl('');
      fetchUrls();
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating short URL');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1>🔗 URL Shortener</h1>
          <p>Make your links shorter and shareable</p>
        </div>

        <form onSubmit={handleShorten} className="form">
          <div className="input-group">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter your URL (e.g., https://example.com/very/long/url)"
              className="input"
            />
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Shortening...' : 'Shorten'}
            </button>
          </div>
          {error && <div className="error">{error}</div>}
        </form>

        {shortUrl && (
          <div className="result">
            <div className="result-box">
              <p className="label">Your short URL:</p>
              <div className="result-content">
                <code className="short-url">{shortUrl}</code>
                <button
                  onClick={() => copyToClipboard(shortUrl)}
                  className="btn-copy"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="urls-section">
          <h2>Recent URLs</h2>
          {urls.length === 0 ? (
            <p className="empty">No URLs shortened yet</p>
          ) : (
            <div className="urls-list">
              {urls.map((entry) => (
                <div key={entry.shortCode} className="url-item">
                  <div className="url-info">
                    <div className="url-short">
                      <a
                        href={entry.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link"
                      >
                        {entry.shortCode}
                      </a>
                    </div>
                    <div className="url-original" title={entry.originalUrl}>
                      {entry.originalUrl}
                    </div>
                    <div className="url-meta">
                      <span className="clicks">Clicks: {entry.clicks}</span>
                      <span className="date">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(entry.shortUrl)}
                    className="btn-icon"
                    title="Copy URL"
                  >
                    📋
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
