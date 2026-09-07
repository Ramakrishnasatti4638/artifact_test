import express from 'express'
import cors from 'cors'
import { nanoid } from 'nanoid'

const app = express()
const PORT = 5000

// In-memory storage
const urlMap = new Map()

// Middleware
app.use(cors())
app.use(express.json())

// Routes

// Create shortened URL
app.post('/api/shorten', (req, res) => {
  try {
    const { longUrl } = req.body

    // Validate URL
    if (!longUrl || typeof longUrl !== 'string') {
      return res.status(400).json({ error: 'Invalid URL' })
    }

    // Basic URL validation
    try {
      new URL(longUrl)
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' })
    }

    const shortId = nanoid(7)
    const entry = {
      shortId,
      longUrl,
      createdAt: new Date().toISOString(),
      clicks: 0
    }

    urlMap.set(shortId, entry)

    res.json(entry)
  } catch (error) {
    res.status(500).json({ error: 'Failed to shorten URL' })
  }
})

// Get all URLs
app.get('/api/list', (req, res) => {
  const urls = Array.from(urlMap.values()).sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  )
  res.json(urls)
})

// Redirect to original URL
app.get('/:shortId', (req, res) => {
  const { shortId } = req.params
  const entry = urlMap.get(shortId)

  if (!entry) {
    return res.status(404).json({ error: 'URL not found' })
  }

  entry.clicks++
  res.redirect(entry.longUrl)
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' })
})

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})
