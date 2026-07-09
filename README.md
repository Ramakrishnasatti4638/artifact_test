# URL Shortener

A full-stack URL shortener built with Express.js, featuring a clean frontend UI and comprehensive API testing.

## Features

### Backend API
- **POST /api/shorten** - Create shortened URLs with auto-generated or custom aliases
  - Validates URL format (http/https only)
  - Generates 6-character random alphanumeric codes
  - Returns 409 if custom alias already exists
  - Returns 400 for invalid/missing URLs
- **GET /:shortCode** - Redirect to original URL (HTTP 302)
  - Increments click count on each access
  - Returns 404 for unknown codes
- **GET /api/links** - Get all shortened links with statistics
  - Returns links sorted by click count (descending)
  - Includes click counts, creation dates, and URLs
- **DELETE /api/links/:shortCode** - Delete a shortened link

### Frontend
- Single-page application served by Express
- URL shortening form with optional custom alias
- Result display with clickable short URL and copy-to-clipboard button
- Links table showing:
  - Original URL (truncated for display)
  - Short URL
  - Click count
  - Creation date
  - Delete button
- Stats summary cards:
  - Total links created
  - Total clicks across all links

## Installation

```bash
npm install
```

## Usage

### Start the server
```bash
npm start
```

The application will run on http://localhost:3000

### Run tests
```bash
npm test
```

## Testing

Comprehensive Jest + Supertest test suite covering:
- URL validation (http/https protocols)
- Auto-generated and custom short codes
- Duplicate alias detection
- Redirect functionality
- Click tracking
- Link deletion
- Edge cases (long URLs, special characters)

All 20 tests passing ✓

## Project Structure

```
.
├── server.js           # Express server and API endpoints
├── server.test.js      # Jest + Supertest API tests
├── public/
│   ├── index.html      # Frontend HTML
│   ├── style.css       # Styling
│   └── script.js       # Frontend JavaScript
└── package.json        # Dependencies and scripts
```

## Technology Stack

- **Backend**: Express.js
- **Storage**: In-memory Map (resets on server restart)
- **Testing**: Jest + Supertest
- **Frontend**: Vanilla HTML/CSS/JavaScript

## API Examples

### Shorten a URL
```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

### Shorten with custom alias
```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","customAlias":"mylink"}'
```

### Access shortened URL
```bash
curl -I http://localhost:3000/abc123
```

### Get all links
```bash
curl http://localhost:3000/api/links
```

### Delete a link
```bash
curl -X DELETE http://localhost:3000/api/links/abc123
```
