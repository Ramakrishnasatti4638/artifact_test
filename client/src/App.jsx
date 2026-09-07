import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import URLForm from './components/URLForm'
import URLList from './components/URLList'

function App() {
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchUrls = async () => {
    try {
      const response = await axios.get('/api/list')
      setUrls(response.data)
      setError('')
    } catch (err) {
      setError('Failed to fetch URLs')
      console.error(err)
    }
  }

  useEffect(() => {
    fetchUrls()
  }, [])

  const handleShortenURL = async (longUrl) => {
    setLoading(true)
    setError('')
    
    try {
      const response = await axios.post('/api/shorten', { longUrl })
      setUrls([response.data, ...urls])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to shorten URL')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToClipboard = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl)
    alert('Copied to clipboard!')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔗 URL Shortener</h1>
        <p>Create short, shareable links</p>
      </header>

      <main className="app-main">
        <URLForm 
          onShorten={handleShortenURL} 
          loading={loading}
          error={error}
        />

        {urls.length > 0 && (
          <URLList 
            urls={urls}
            onCopy={handleCopyToClipboard}
          />
        )}
      </main>
    </div>
  )
}

export default App
