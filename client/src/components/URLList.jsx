import URLCard from './URLCard'
import './URLList.css'

export default function URLList({ urls, onRefresh }) {
  if (urls.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📝</div>
        <h2>No short URLs yet</h2>
        <p>Create your first short URL above to get started!</p>
      </div>
    )
  }

  return (
    <div className="url-list">
      <div className="list-header">
        <h2>Your Short URLs</h2>
        <span className="count">{urls.length}</span>
      </div>
      <div className="cards-grid">
        {urls.map((urlData) => (
          <URLCard key={urlData.id} urlData={urlData} onRefresh={onRefresh} />
        ))}
      </div>
    </div>
  )
}
