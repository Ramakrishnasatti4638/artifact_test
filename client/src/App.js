import React, { useState, useEffect } from 'react';
import './App.css';
import ShortenForm from './components/ShortenForm';
import UrlList from './components/UrlList';
import axios from 'axios';

function App() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/urls');
      setUrls(response.data);
    } catch (error) {
      console.error('Error fetching URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleUrlCreated = (newUrl) => {
    setUrls([newUrl, ...urls]);
  };

  const handleUrlDeleted = (shortCode) => {
    setUrls(urls.filter(url => url.shortCode !== shortCode));
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <h1>🔗 URL Shortener</h1>
          <p>Create short, shareable links in seconds</p>
        </div>

        <ShortenForm onUrlCreated={handleUrlCreated} />

        <div className="urls-section">
          <h2>Your URLs</h2>
          {loading ? (
            <p className="loading">Loading...</p>
          ) : urls.length === 0 ? (
            <p className="empty-state">No shortened URLs yet. Create one above!</p>
          ) : (
            <UrlList urls={urls} onUrlDeleted={handleUrlDeleted} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
