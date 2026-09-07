import { useState, useEffect } from 'react'
import './App.css'
import ShortenForm from './components/ShortenForm'
import URLList from './components/URLList'

function App() {
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUrls()
  }, [])

  const fetchUrls = async () => {
    try {
      const response = await fetch('/api/urls')
      const data = await response.json()
      setUrls(data)
    } catch (err) {
      console.error('Error fetching URLs:', err)
    }
  }

  const handleUrlShortened = (newUrl) => {
    setUrls([newUrl, ...urls])
  }

  return (
    <div className="container">
      <header className="header">
        <h1>🔗 URL Shortener</h1>
        <p>Make your long URLs short and shareable</p>
      </header>

      <main>
        <ShortenForm onUrlShortened={handleUrlShortened} />
        <URLList urls={urls} onRefresh={fetchUrls} />
      </main>

      <footer className="footer">
        <p>© 2024 URL Shortener. Built with React & Express.</p>
      </footer>
    </div>
  )
}

export default App
