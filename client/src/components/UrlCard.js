import React, { useState } from 'react';
import axios from 'axios';
import './UrlCard.css';

function UrlCard({ url, onDelete }) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const shortenedUrl = `${window.location.origin}/${url.shortCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shortenedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this URL?')) {
      try {
        setDeleting(true);
        await axios.delete(`/api/urls/${url.shortCode}`);
        onDelete(url.shortCode);
      } catch (error) {
        alert('Failed to delete URL');
        setDeleting(false);
      }
    }
  };

  const createdDate = new Date(url.createdAt).toLocaleDateString();

  return (
    <div className="url-card">
      <div className="url-card-header">
        <span className="short-code">{url.shortCode}</span>
        <button
          className="delete-btn"
          onClick={handleDelete}
          disabled={deleting}
          title="Delete URL"
        >
          ✕
        </button>
      </div>

      <div className="url-card-body">
        <div className="url-info">
          <p className="label">Short URL</p>
          <p className="short-url-value">{shortenedUrl}</p>
        </div>

        <div className="url-info">
          <p className="label">Original URL</p>
          <p className="original-url">
            <a href={url.originalUrl} target="_blank" rel="noopener noreferrer">
              {url.originalUrl}
            </a>
          </p>
        </div>

        <div className="url-meta">
          <span className="meta-item">
            📅 {createdDate}
          </span>
          <span className="meta-item">
            🔗 {url.clicks} clicks
          </span>
        </div>
      </div>

      <button
        className="copy-btn"
        onClick={handleCopy}
      >
        {copied ? '✓ Copied!' : 'Copy Link'}
      </button>
    </div>
  );
}

export default UrlCard;
