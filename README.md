# URL Shortener App

A full-stack URL shortener application built with Express.js, React, and SQL.js. Easily create short, shareable links with click tracking and statistics.

## Features

✨ **Core Functionality**
- **Create Short URLs**: Convert long URLs into compact, shareable short links
- **Click Tracking**: Automatically track and display click counts for each shortened URL
- **View Statistics**: See detailed information including creation date and click history
- **Delete URLs**: Remove shortened URLs from your collection
- **Copy to Clipboard**: One-click copying of short URLs

🎨 **User Experience**
- Modern, responsive UI with gradient design
- Real-time form feedback and validation
- Success/error notifications
- Modal-based statistics viewer
- Fully mobile-responsive layout

🛡️ **Reliability**
- URL format validation before shortening
- Error handling for all API operations
- Persistent SQLite database storage
- CORS support for cross-origin requests

## Tech Stack

**Backend**
- Node.js + Express.js (v5.2.1)
- SQL.js for embedded SQLite database
- CORS middleware for cross-origin requests
- UUID for unique identifier generation

**Frontend**
- React 18 (CDN-based, no build step required)
- Modern CSS with gradients and animations
- Responsive design with mobile breakpoints

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ramakrishnasatti4638/artifact_test.git
   cd artifact_test
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Open your browser and navigate to `http://localhost:3001`

## Project Structure

```
artifact_test/
├── server.js              # Express server with API endpoints
├── public/
│   └── index.html        # React frontend application
├── package.json          # Project dependencies and scripts
├── urls.db               # SQLite database (created on first run)
└── README.md             # This file
```

## API Endpoints

### POST /api/shorten
Create a shortened URL.

**Request:**
```json
{
  "url": "https://example.com/very/long/url/path"
}
```

**Response:**
```json
{
  "id": "uuid-string",
  "long_url": "https://example.com/very/long/url/path",
  "short_code": "abc123",
  "short_url": "http://localhost:3001/s/abc123",
  "created_at": "2026-08-31T10:44:13.939Z",
  "clicks": 0
}
```

### GET /api/urls
Retrieve all shortened URLs.

**Response:**
```json
[
  {
    "id": "uuid-string",
    "long_url": "https://example.com/very/long/url/path",
    "short_code": "abc123",
    "short_url": "http://localhost:3001/s/abc123",
    "created_at": "2026-08-31T10:44:13.939Z",
    "clicks": 5
  }
]
```

### GET /s/:shortCode
Redirect to the original URL and increment click counter.

**Response:** HTTP 302 Redirect to the original URL

### GET /api/stats/:shortCode
Get statistics for a shortened URL.

**Response:**
```json
{
  "id": "uuid-string",
  "long_url": "https://example.com/very/long/url/path",
  "short_code": "abc123",
  "created_at": "2026-08-31T10:44:13.939Z",
  "clicks": 5
}
```

### DELETE /api/urls/:id
Delete a shortened URL by its ID.

**Response:**
```json
{
  "success": true
}
```

## Database Schema

The application uses a single `urls` table:

```sql
CREATE TABLE urls (
  id TEXT PRIMARY KEY,
  long_url TEXT NOT NULL,
  short_code TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  clicks INTEGER DEFAULT 0
)
```

- **id**: Unique identifier (UUID)
- **long_url**: Original long URL provided by user
- **short_code**: 6-character random short code
- **created_at**: Timestamp when URL was shortened
- **clicks**: Number of times the short URL was accessed

## Usage Examples

### Creating a Shortened URL
1. Enter a long URL in the input field
2. Click "Shorten URL"
3. The URL appears in your list below

### Copying a Short URL
1. Click the "Copy" button next to any shortened URL
2. The short URL is copied to your clipboard
3. Share it anywhere!

### Viewing Statistics
1. Click the "Stats" button next to any URL
2. A modal popup displays:
   - Short code
   - Total click count
   - Creation date and time
   - Original URL

### Deleting a URL
1. Click the "Delete" button next to any URL
2. Confirm the deletion
3. The URL is permanently removed

## Error Handling

The application handles various error scenarios:

- **Invalid URL format**: Returns error message if URL is malformed
- **Missing URL parameter**: Requires a URL to be provided
- **Non-existent short code**: Returns 404 if short code not found
- **Database errors**: Caught and reported to user

## Performance Notes

- **Short code generation**: Uses a simple random 6-character alphanumeric format
- **Database persistence**: URLs are saved to `urls.db` file after each operation
- **No authentication**: Currently allows any user to view, create, and delete URLs

## Future Enhancements

Potential improvements for the application:

- [ ] User authentication and authorization
- [ ] Custom short codes (e.g., `/s/my-link`)
- [ ] QR code generation for short URLs
- [ ] Advanced analytics and charts
- [ ] URL expiration/TTL support
- [ ] Bulk URL creation from CSV
- [ ] URL preview before redirect
- [ ] Rate limiting and abuse prevention
- [ ] PostgreSQL/MongoDB support (replacing SQL.js)
- [ ] Admin dashboard

## Security Considerations

- URL validation prevents invalid entries
- CORS is configured for the application
- No sensitive data is stored or transmitted
- Consider adding authentication for production use
- Database file should not be publicly accessible

## Troubleshooting

**Issue: Server won't start**
- Ensure port 3001 is not in use
- Check Node.js and npm versions
- Run `npm install` to ensure dependencies are installed

**Issue: URLs not persisting**
- Check file system permissions for `urls.db`
- Ensure the working directory is writable

**Issue: Frontend not loading**
- Verify server is running: `ps aux | grep "node server.js"`
- Check browser console for errors
- Clear browser cache and hard refresh

## License

ISC

## Author

URL Shortener App - 2026

---

**Need help?** Check the API endpoints section or review the server logs for detailed error information.
