import { useState } from 'react'
import './ShortenForm.css'

export default function ShortenForm({ onUrlShortened }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to shorten URL')
        return
      }

      setSuccess(`Short URL created: ${data.shortUrl}`)
      setUrl('')
      onUrlShortened(data)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Error creating short URL')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="shorten-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="url">Enter your long URL:</label>
        <div className="input-wrapper">
          <input
            id="url"
            type="text"
            placeholder="https://example.com/very/long/url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Shortening...' : 'Shorten'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
    </form>
  )
}
