# 🔗 URL Shortener App

A modern, full-stack URL shortening application built with Node.js + Express and vanilla JavaScript. Convert long URLs into short, shareable links with click tracking.

## Features

- ✅ **Shorten URLs** - Convert any long URL into a short, memorable link
- ✅ **Click Tracking** - Automatically track how many times each shortened URL is clicked
- ✅ **URL History** - View all your shortened URLs with creation dates and stats
- ✅ **Duplicate Detection** - If you shorten the same URL twice, you get the same short code
- ✅ **Copy to Clipboard** - One-click copying of short URLs
- ✅ **Real-time Updates** - Auto-refresh stats every 30 seconds
- ✅ **Responsive Design** - Works beautifully on desktop, tablet, and mobile
- ✅ **Modern UI** - Clean, gradient interface with smooth animations

## Tech Stack

- **Backend**: Node.js + Express.js + CORS + Body-parser
- **Frontend**: HTML5, CSS3 (with gradients & animations), Vanilla JavaScript
- **Storage**: In-memory Map (can be upgraded to database)
- **API**: RESTful JSON API

## Installation

```bash
npm install
```

## Running the App

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The app will start on `http://localhost:3000`

## API Endpoints

### POST /api/shorten
Create a shortened URL.

**Request:**
```json
{
  "url": "https://example.com/very/long/url/that/needs/shortening"
}
```

**Response:**
```json
{
  "shortCode": "qi",
  "shortUrl": "http://localhost:3000/qi",
  "originalUrl": "https://example.com/very/long/url/that/needs/shortening",
  "createdAt": "2026-08-31T07:36:16.807Z",
  "clicks": 0
}
```

### GET /api/urls
Retrieve all shortened URLs with stats.

**Response:**
```json
[
  {
    "shortCode": "qi",
    "shortUrl": "http://localhost:3000/qi",
    "originalUrl": "https://example.com/very/long/url",
    "createdAt": "2026-08-31T07:36:16.807Z",
    "clicks": 5
  }
]
```

### GET /api/stats/:shortCode
Get statistics for a specific shortened URL.

**Response:**
```json
{
  "shortCode": "qi",
  "shortUrl": "http://localhost:3000/qi",
  "originalUrl": "https://example.com/very/long/url",
  "createdAt": "2026-08-31T07:36:16.807Z",
  "clicks": 5
}
```

### GET /:shortCode
Redirect to the original URL (increments click count).

## How to Use

1. **Paste a URL** - Enter your long URL in the input field
2. **Click Shorten** - The app generates a short code
3. **Copy & Share** - Click Copy to add the short URL to your clipboard
4. **Track Clicks** - See how many times people have clicked your link
5. **View History** - All your shortened URLs appear in the list below

## Project Structure

```
├── server.js          # Express server with API endpoints
├── public/
│   ├── index.html     # Main HTML interface
│   ├── styles.css     # Responsive styling with animations
│   └── script.js      # Frontend logic and API calls
├── package.json       # Dependencies and scripts
└── README.md          # This file
```

## Future Enhancements

- 🗄️ Database persistence (MongoDB, PostgreSQL, SQLite)
- 👤 User authentication and personal URL collections
- 🎯 Custom short codes (e.g., /my-awesome-link)
- 📱 QR code generation
- 📊 Advanced analytics and charts
- ⏱️ URL expiration/TTL
- 🚫 Rate limiting and abuse prevention
- 🌐 URL validation and preview
- 📈 Most clicked URLs ranking
