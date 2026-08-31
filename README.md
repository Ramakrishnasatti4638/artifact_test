# URL Shortener App

A full-stack URL shortener application built with Node.js/Express backend and React frontend.

## Features

- ✨ Create short, shareable links
- 📊 Track click counts for each shortened URL
- 🔗 Copy short links to clipboard
- 🗑️ Delete shortened URLs
- 📱 Responsive design
- 🎨 Modern, clean UI

## Project Structure

```
.
├── server/              # Express backend
│   ├── index.js        # Main server file
│   ├── db.js           # Database configuration
│   └── controllers/    # Route controllers
├── client/             # React frontend
│   ├── public/         # Static files
│   └── src/            # React components
├── package.json        # Root dependencies
└── .env               # Environment variables
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup

1. **Install dependencies**
```bash
npm install
cd client && npm install && cd ..
```

2. **Create data directory**
```bash
mkdir -p data
```

## Usage

### Development Mode
Run both server and client with hot reload:
```bash
npm run dev
```

This will start:
- Backend API on `http://localhost:5000`
- Frontend on `http://localhost:3000`

### Production Build
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

## API Endpoints

### POST `/api/shorten`
Create a shortened URL
```json
{
  "originalUrl": "https://example.com/very/long/url"
}
```

Response:
```json
{
  "id": 1,
  "shortCode": "abc123",
  "originalUrl": "https://example.com/very/long/url",
  "shortenedUrl": "http://localhost:5000/abc123",
  "createdAt": "2024-01-01T12:00:00Z",
  "clicks": 0
}
```

### GET `/api/urls`
Get all shortened URLs
```json
[
  {
    "id": 1,
    "shortCode": "abc123",
    "originalUrl": "https://example.com/very/long/url",
    "createdAt": "2024-01-01T12:00:00Z",
    "clicks": 5
  }
]
```

### DELETE `/api/urls/:shortCode`
Delete a shortened URL

### GET `/api/stats/:shortCode`
Get statistics for a shortened URL

### GET `/:shortCode`
Redirect to the original URL (increments click count)

## Technology Stack

### Backend
- Express.js - Web framework
- SQLite - Database
- shortid - Unique ID generation
- CORS - Cross-origin support
- dotenv - Environment variables

### Frontend
- React - UI library
- Axios - HTTP client
- CSS3 - Styling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
