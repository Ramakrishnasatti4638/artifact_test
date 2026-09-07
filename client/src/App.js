import React, { useState, useEffect } from 'react';
import './App.css';
import URLForm from './components/URLForm';
import URLList from './components/URLList';

function App() {
  const [urls, setUrls] = useState([]);
  const [message, setMessage] = useState('');

  const fetchUrls = async () => {
    try {
      const response = await fetch('/api/urls');
      const data = await response.json();
      setUrls(data);
    } catch (err) {
      console.error('Error fetching URLs:', err);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleUrlShortened = (newUrl) => {
    setUrls([newUrl, ...urls]);
    setMessage('URL shortened successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>URL Shortener</h1>
          <p>Create short, shareable links from long URLs</p>
        </header>

        <main className="main-content">
          <URLForm onUrlShortened={handleUrlShortened} />

          {message && <div className="message success">{message}</div>}

          {urls.length > 0 && (
            <section className="history-section">
              <h2>Recent Shortened URLs</h2>
              <URLList urls={urls} />
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
