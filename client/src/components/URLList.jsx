import URLCard from './URLCard'
import './URLList.css'

export default function URLList({ urls, onCopy }) {
  return (
    <div className="url-list">
      <h2 className="list-title">Your Shortened URLs</h2>
      <div className="cards-container">
        {urls.map((url) => (
          <URLCard
            key={url.shortId}
            url={url}
            onCopy={onCopy}
          />
        ))}
      </div>
    </div>
  )
}
