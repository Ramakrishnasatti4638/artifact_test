# 🔗 URL Shortener App

A full-stack URL shortener application built with React, Express, and SQLite. Easily create short, shareable links and track how many times they're clicked.

## Features

- ✨ **Create short URLs** - Convert long URLs into compact, shareable links
- 📊 **Click tracking** - Monitor how many times each shortened URL is accessed
- 🗑️ **URL management** - Delete URLs you no longer need
- 🔄 **Sort & filter** - Organize your URLs by newest, oldest, or most popular
- 📋 **Copy to clipboard** - Quick copy button for sharing
- 📱 **Responsive design** - Works seamlessly on desktop and mobile
- 🎨 **Modern UI** - Clean, gradient interface with smooth interactions

## Tech Stack

### Frontend
- React 18
- CSS3 with modern styling
- Fetch API for backend communication

### Backend
- Node.js & Express
- SQLite3 database
- CORS support
- UUID for unique identifiers

## Project Structure

```
url-shortener/
├── frontend/                 # React frontend app
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── URLCard.js
│   │   │   ├── URLCard.css
│   │   │   ├── URLForm.js
│   │   │   ├── URLForm.css
│   │   │   ├── URLList.js
│   │   │   └── URLList.css
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
├── backend/                  # Express API server
│   ├── server.js
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 14+ and npm

### Installation & Setup

1. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

**Terminal 1 - Start the backend:**
```bash
cd backend
npm start
```
The API server will run on `http://localhost:3001`

**Terminal 2 - Start the frontend:**
```bash
cd frontend
npm start
```
The React app will open on `http://localhost:3000`

## API Endpoints

### Shorten a URL
```
POST /api/shorten
Content-Type: application/json

{
  "url": "https://example.com/very/long/url"
}

Response: 201 Created
{
  "id": "uuid",
  "shortCode": "abc123",
  "originalUrl": "https://example.com/very/long/url",
  "shortUrl": "http://localhost:3001/s/abc123",
  "clicks": 0,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Get All URLs
```
GET /api/urls

Response: 200 OK
[
  {
    "id": "uuid",
    "shortCode": "abc123",
    "originalUrl": "https://example.com/very/long/url",
    "shortUrl": "http://localhost:3001/s/abc123",
    "clicks": 5,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  ...
]
```

### Redirect to Original URL
```
GET /s/:shortCode

Redirects to the original URL and increments click count
```

### Delete a URL
```
DELETE /api/urls/:shortCode

Response: 200 OK
{
  "message": "URL deleted successfully"
}
```

### Health Check
```
GET /api/health

Response: 200 OK
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Usage

1. **Create a Short URL:**
   - Paste a long URL in the input field
   - Click "Shorten URL"
   - Your new short link appears in the list below

2. **Copy & Share:**
   - Click the "Copy" button on any URL card
   - Share the short link with others

3. **Track Clicks:**
   - See the click count displayed on each card
   - Useful for analytics and monitoring link popularity

4. **Delete URLs:**
   - Click the "Delete" button to remove URLs
   - Confirmation required before deletion

5. **Sort URLs:**
   - Use the sort dropdown to organize by:
     - Newest First
     - Oldest First
     - Most Clicks

## Features in Detail

### URL Validation
- Validates input URLs before shortening
- Ensures only valid HTTP/HTTPS URLs are accepted

### Click Tracking
- Automatically increments click count on redirect
- Useful for monitoring link performance

### Responsive Design
- Mobile-friendly layout
- Adapts to different screen sizes
- Touch-friendly buttons and interactions

### Error Handling
- User-friendly error messages
- Network error recovery
- Input validation feedback

## Development

### Adding Features
The application is modular and extensible. To add features:

1. **Backend:** Add new routes in `backend/server.js`
2. **Frontend:** Create new components in `frontend/src/components/`
3. **Styling:** Add component-specific CSS files

### Database
The application uses an in-memory SQLite database for demo purposes. For production:
1. Modify the database initialization to use a file-based database
2. Add database migrations
3. Implement backup strategies

## Future Enhancements

- 🔐 User authentication and personal URL collections
- 📈 Advanced analytics dashboard
- 🏷️ Custom short codes/slugs
- 🔔 Notifications and alerts
- 📱 Mobile app
- 🌐 QR code generation
- 🔄 URL expiration dates
- 🎨 Custom branding options

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue in the repository.

---

**Happy URL shortening! 🚀**
