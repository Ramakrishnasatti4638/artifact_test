import { useState } from 'react'
import './URLCard.css'

export default function URLCard({ urlData, onRefresh }) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const shortUrl = `http://localhost:3001/${urlData.shortCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this short URL?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/urls/${urlData.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onRefresh()
      }
    } catch (err) {
      console.error('Error deleting URL:', err)
    } finally {
      setLoading(false)
    }
  }

  const createdDate = new Date(urlData.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="url-card" data-testid={`url-card-${urlData.id}`}>
      <div className="card-content">
        <div className="short-url-section">
          <label>Short URL</label>
          <div className="short-url-display">
            <code>{urlData.shortCode}</code>
            <button 
              className={`btn-copy ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
              title="Copy to clipboard"
              data-testid="copy-button"
            >
              {copied ? '✓' : '📋'}
            </button>
          </div>
        </div>

        <div className="original-url-section">
          <label>Original URL</label>
          <a 
            href={urlData.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="original-url"
            title={urlData.originalUrl}
            data-testid="original-url"
          >
            {urlData.originalUrl}
          </a>
        </div>

        <div className="card-meta">
          <div className="meta-item">
            <span className="meta-label">Clicks</span>
            <span className="meta-value">{urlData.clicks || 0}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Created</span>
            <span className="meta-value">{createdDate}</span>
          </div>
        </div>
      </div>

      <button 
        className="btn-delete"
        onClick={handleDelete}
        disabled={loading}
        title="Delete this URL"
      >
        🗑️
      </button>
    </div>
  )
}
