import './URLCard.css'

export default function URLCard({ url, onCopy }) {
  const shortUrl = `${window.location.origin}/${url.shortId}`

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl)
    // Trigger visual feedback
    onCopy(shortUrl)
  }

  return (
    <div className="url-card">
      <div className="url-content">
        <div className="url-item">
          <span className="url-label">Short URL:</span>
          <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="short-link">
            {shortUrl}
          </a>
        </div>
        <div className="url-item">
          <span className="url-label">Original URL:</span>
          <a href={url.longUrl} target="_blank" rel="noopener noreferrer" className="long-link">
            {url.longUrl}
          </a>
        </div>
      </div>
      <div className="url-footer">
        <span className="created-date">
          Created: {new Date(url.createdAt).toLocaleDateString()}
        </span>
        <button 
          className="copy-btn"
          onClick={handleCopy}
          title="Copy to clipboard"
        >
          📋 Copy
        </button>
      </div>
    </div>
  )
}
