import React, { useState } from 'react';
import './URLCard.css';

function URLCard({ url, onDelete }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      onDelete(url.shortCode);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateUrl = (urlString, length = 50) => {
    return urlString.length > length ? urlString.substring(0, length) + '...' : urlString;
  };

  return (
    <div className="url-card">
      <div className="card-content">
        <div className="card-header">
          <a href={url.shortUrl} target="_blank" rel="noopener noreferrer" className="short-url">
            {url.shortUrl}
          </a>
          <div className="card-meta">
            <span className="click-count">👁️ {url.clicks} clicks</span>
            <span className="date">{formatDate(url.createdAt)}</span>
          </div>
        </div>

        <div className="card-body">
          <label>Original URL</label>
          <p className="original-url" title={url.originalUrl}>
            {truncateUrl(url.originalUrl)}
          </p>
        </div>
      </div>

      <div className="card-actions">
        <button
          className={`copy-btn ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          title="Copy to clipboard"
        >
          {copied ? '✓ Copied' : '📋 Copy'}
        </button>
        <button
          className="delete-btn"
          onClick={handleDelete}
          title="Delete this link"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

export default URLCard;
