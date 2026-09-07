import React, { useState, useEffect } from 'react';
import './App.css';
import URLForm from './components/URLForm';
import URLList from './components/URLList';

function App() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/urls');
      if (!response.ok) throw new Error('Failed to fetch URLs');
      const data = await response.json();
      setUrls(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching URLs:', err);
      setError('Failed to load URLs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleURLShortened = (newUrl) => {
    setUrls([newUrl, ...urls]);
  };

  const handleDelete = async (shortCode) => {
    try {
      const response = await fetch(`/api/urls/${shortCode}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete URL');

      setUrls(urls.filter(url => url.shortCode !== shortCode));
    } catch (err) {
      console.error('Error deleting URL:', err);
      setError('Failed to delete URL');
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🔗 URL Shortener</h1>
        <p>Create short, shareable links instantly</p>
      </header>

      <main className="app-main">
        <URLForm onURLShortened={handleURLShortened} />

        {error && <div className="error-message">{error}</div>}

        <section className="urls-section">
          <h2>Your Shortened URLs</h2>
          {loading ? (
            <div className="loading">Loading URLs...</div>
          ) : urls.length === 0 ? (
            <div className="empty-state">
              <p>No shortened URLs yet. Create one above to get started!</p>
            </div>
          ) : (
            <URLList urls={urls} onDelete={handleDelete} />
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>💡 Tip: Share your short URLs and track how many clicks they get!</p>
      </footer>
    </div>
  );
}

export default App;
