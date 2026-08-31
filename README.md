# URL Shortener App

A simple, modern URL shortener application built with Node.js/Express backend and React frontend.

## Features

- ✨ Create short URLs from long ones
- 📊 Track click statistics
- 📋 Copy URLs to clipboard with one click
- 📱 Responsive mobile-friendly design
- ⚡ Fast and lightweight

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install backend dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

### Running the App

**Development Mode** (backend and frontend separately):

Terminal 1 - Backend:
```bash
npm run dev
```

Terminal 2 - Frontend:
```bash
npm run client
```

**Production Mode**:

1. Build the frontend:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

The app will be available at `http://localhost:5000`

## API Endpoints

### Create Short URL
**POST** `/api/shorten`
- Body: `{ "url": "https://example.com/long/url" }`
- Response: `{ "shortUrl": "...", "shortCode": "abc12345", "originalUrl": "..." }`

### Redirect to Original URL
**GET** `/s/:shortCode`
- Redirects to the original URL and increments click counter

### Get URL Info
**GET** `/api/urls/:shortCode`
- Returns metadata about a short URL including click count

### Get All URLs
**GET** `/api/urls`
- Returns an array of all shortened URLs with their metadata

## Project Structure

```
url-shortener/
├── server.js           # Express backend server
├── package.json        # Backend dependencies
├── README.md           # This file
└── client/             # React frontend
    ├── public/         # Static files
    ├── src/
    │   ├── App.js      # Main App component
    │   ├── App.css     # Styling
    │   └── index.js    # Entry point
    └── package.json    # Frontend dependencies
```

## How It Works

1. **Input URL**: User enters a long URL in the form
2. **Generate Short Code**: Server generates an 8-character unique code using UUID
3. **Store Mapping**: URL mapping is stored in memory (can be replaced with a database)
4. **Display Result**: Short URL is displayed and can be copied
5. **Track Usage**: When someone visits a short URL, the click counter increments

## Future Enhancements

- Database persistence (MongoDB, PostgreSQL, etc.)
- User authentication and URL management
- QR code generation
- Custom short codes
- URL expiration
- Analytics dashboard

## License

ISC
