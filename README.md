# URL Shortener App

A modern, full-stack URL shortener application built with React, Express.js, and SQLite.

## Features

✨ **Core Features**
- 🔗 Create short, unique URLs from long URLs
- 📊 Track click statistics for each short URL
- 📋 Copy short URLs to clipboard with one click
- 🗑️ Delete short URLs anytime
- 📱 Fully responsive design
- 🎨 Modern, clean UI with gradient design

## Tech Stack

**Frontend:**
- React 18 with Hooks
- Vite (build tool)
- Modern CSS3 with animations

**Backend:**
- Express.js
- SQLite3 database
- CORS enabled

## Project Structure

```
.
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx        # Main app component
│   │   ├── App.css        # App styles
│   │   ├── index.css      # Global styles
│   │   └── main.jsx       # Entry point
│   ├── index.html         # HTML template
│   ├── vite.config.js     # Vite config
│   └── package.json
├── server/                # Express backend
│   └── index.js          # Server file
├── package.json          # Root package.json
└── README.md            # This file
```

## Installation

1. Install root dependencies:
```bash
npm install
```

2. Install client dependencies:
```bash
cd client && npm install
```

3. Go back to root:
```bash
cd ..
```

## Running the App

Start both frontend and backend in development mode:

```bash
npm run dev
```

This will:
- Start Express server on `http://localhost:3001`
- Start Vite dev server on `http://localhost:3000`
- Proxy API calls from frontend to backend

### Running separately:

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

## API Endpoints

### GET /api/urls
Get all shortened URLs

**Response:**
```json
[
  {
    "id": "uuid",
    "shortCode": "abc123",
    "originalUrl": "https://example.com/very/long/url",
    "clicks": 5,
    "createdAt": "2024-01-01T12:00:00Z"
  }
]
```

### POST /api/shorten
Create a new short URL

**Request:**
```json
{
  "url": "https://example.com/very/long/url"
}
```

**Response:**
```json
{
  "id": "uuid",
  "shortCode": "abc123",
  "originalUrl": "https://example.com/very/long/url",
  "clicks": 0,
  "createdAt": "2024-01-01T12:00:00Z",
  "shortUrl": "http://localhost:3001/abc123"
}
```

### GET /:shortCode
Redirect to original URL (increments click counter)

### GET /api/stats/:shortCode
Get statistics for a specific short URL

### DELETE /api/urls/:id
Delete a short URL by ID

## Database

SQLite database is automatically created at `server/urls.db` on first run.

**Schema:**
```sql
CREATE TABLE urls (
  id TEXT PRIMARY KEY,
  shortCode TEXT UNIQUE NOT NULL,
  originalUrl TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  expiresAt DATETIME
)
```

## Usage

1. **Create a Short URL**: Enter a long URL in the input field and click "Shorten"
2. **Copy to Clipboard**: Click the 📋 button on any URL card
3. **View Stats**: See click count and creation date on each card
4. **Delete URL**: Click the 🗑️ button to remove a short URL

## Features Explained

### Short Code Generation
- 6-character alphanumeric codes (lowercase, uppercase, numbers)
- Collision detection with automatic retry
- Each code is unique

### Click Tracking
- Every redirect increments the click counter
- Real-time statistics displayed on the card

### Responsive Design
- Desktop-optimized grid layout
- Mobile-friendly single-column layout
- Touch-friendly buttons and inputs

## Future Enhancements

- [ ] Custom short codes
- [ ] URL expiration
- [ ] QR code generation
- [ ] Analytics dashboard
- [ ] User authentication
- [ ] Batch URL shortening
- [ ] Export statistics

## License

MIT
