import './URLCard.css'

export default function URLCard({ url, onCopy, onClickShortLink }) {
  const shortUrl = `${window.location.origin}/${url.shortId}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl)
      // Trigger visual feedback after successful copy
      onCopy(shortUrl)
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Failed to copy to clipboard')
    }
  }

  const handleShortLinkClick = (e) => {
    // Prevent default navigation to allow tracking first
    e.preventDefault()
    // Track the click when the short link is clicked
    if (onClickShortLink) {
      onClickShortLink(url.shortId)
      // Then redirect to the original URL
      setTimeout(() => {
        window.open(url.longUrl, '_blank')
      }, 300)
    }
  }

  return (
    <div className="url-card">
      <div className="url-content">
        <div className="url-item">
          <span className="url-label">Short URL:</span>
          <a 
            href={shortUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="short-link"
            onClick={handleShortLinkClick}
            data-testid={`short-link-${url.shortId}`}
          >
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
        <div className="url-footer-left">
          <span className="created-date">
            Created: {new Date(url.createdAt).toLocaleDateString()}
          </span>
          <span className="clicks-count" data-testid={`clicks-${url.shortId}`}>
            👁️ Clicks: {url.clicks}
          </span>
        </div>
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
