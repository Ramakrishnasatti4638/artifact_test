# URL Shortener App

A full-stack URL shortener application built with Express.js and React.

## Features

- ✨ Shorten long URLs into compact, shareable links
- 📋 View all shortened URLs in a clean history
- 📋 Copy shortened URLs to clipboard with one click
- ✅ URL validation
- 📱 Responsive design
- ⚡ Fast and simple interface

## Project Structure

```
.
├── server.js                 # Express backend server
├── package.json              # Root dependencies
└── client/                   # React frontend
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── index.js
    │   ├── App.js
    │   ├── components/
    │   │   ├── URLForm.js
    │   │   ├── URLList.js
    │   │   └── URLItem.js
    │   └── ...styles
    └── package.json
```

## API Endpoints

- `POST /api/shorten` - Create a shortened URL
  - Request: `{ "url": "https://example.com/long/url" }`
  - Response: `{ "originalUrl": "...", "shortUrl": "...", "shortCode": "..." }`

- `GET /:shortCode` - Redirect to original URL

- `GET /api/urls` - Get all shortened URLs

- `GET /api/health` - Health check endpoint

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- npm

### Backend Setup
```bash
npm install
```

### Frontend Setup
```bash
cd client
npm install
cd ..
```

## Running the Application

### Option 1: Run backend and frontend separately
```bash
# Terminal 1 - Backend (runs on http://localhost:5000)
npm run server

# Terminal 2 - Frontend (runs on http://localhost:3000)
npm run client
```

### Option 2: Run both concurrently
```bash
npm run dev
```

## Technologies Used

### Backend
- Node.js
- Express.js
- CORS
- UUID (for unique identifiers)

### Frontend
- React 18
- React DOM
- CSS3 (with gradients and animations)

## How to Use

1. Enter a long URL in the input field
2. Click "Shorten URL"
3. Your shortened URL will appear in the "Recent Shortened URLs" section
4. Click "Copy" to copy the short link to your clipboard
5. Share your shortened URL!

## Notes

- URLs are stored in-memory, so they will be lost when the server restarts
- Short codes are randomly generated (6-character alphanumeric strings)
- The app validates URLs before shortening them
- Full URL history is displayed in reverse chronological order (newest first)
