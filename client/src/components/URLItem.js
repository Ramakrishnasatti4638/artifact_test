import React, { useState } from 'react';
import './URLItem.css';

function URLItem({ item }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="url-item">
      <div className="url-content">
        <div className="url-pair">
          <div className="url-group">
            <label>Short URL</label>
            <code className="short-url">{item.shortUrl}</code>
          </div>
          <div className="url-group">
            <label>Original URL</label>
            <code className="original-url" title={item.originalUrl}>
              {item.originalUrl}
            </code>
          </div>
        </div>
      </div>

      <button
        onClick={handleCopy}
        className={`copy-btn ${copied ? 'copied' : ''}`}
        title="Copy to clipboard"
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );
}

export default URLItem;
