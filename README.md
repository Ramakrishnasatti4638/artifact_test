# URL Shortener

A full-stack URL shortener built with Express.js and vanilla JavaScript.

## Features

### Backend API
- **POST /api/shorten** - Create shortened URLs with auto-generated or custom aliases
- **GET /:shortCode** - Redirect to original URL with click tracking (HTTP 302)
- **GET /api/links** - Get all shortened links sorted by click count
- **DELETE /api/links/:shortCode** - Delete a shortened link

### Frontend
- Modern, responsive single-page interface
- Create short links with optional custom aliases
- Copy-to-clipboard functionality for short URLs
- Real-time stats dashboard (Total Links, Total Clicks)
- Sortable links table with:
  - Original URL (truncated display)
  - Short URL (clickable)
  - Click count
  - Creation date
  - Delete button

### Data Model
Each shortened link stores:
```javascript
{
  shortCode: string,      // 6-char alphanumeric or custom alias
  originalUrl: string,    // Original URL
  createdAt: Date,        // Creation timestamp
  clickCount: number      // Number of redirects
}
```

## Installation

```bash
npm install
```

## Usage

### Start the server
```bash
npm start
```
Server runs on `http://localhost:3000`

### Run tests
```bash
npm test
```

All 20 tests include:
- URL validation (format, protocol checks)
- Short code generation and custom aliases
- Redirect functionality with click tracking
- Link listing with sorting
- Link deletion
- Edge cases (special characters, long URLs)

## API Examples

### Create a short link
```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com"}'
```

### Create with custom alias
```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "customAlias": "mylink"}'
```

### Get all links
```bash
curl http://localhost:3000/api/links
```

### Delete a link
```bash
curl -X DELETE http://localhost:3000/api/links/mylink
```

## Project Structure

```
.
├── server.js              # Express server & API endpoints
├── server.test.js         # Jest + supertest tests
├── jest.config.js         # Jest configuration
├── package.json           # Dependencies & scripts
└── public/
    ├── index.html         # Frontend HTML
    ├── styles.css         # Modern CSS styling
    └── app.js             # Frontend JavaScript
```

## Technical Details

- **In-memory storage** - Data resets on server restart
- **URL validation** - Ensures valid http/https URLs only
- **6-character codes** - Alphanumeric (uppercase + lowercase + digits)
- **Collision handling** - 409 error for duplicate custom aliases
- **Click tracking** - Increments on each redirect
- **Sorting** - Links sorted by click count (descending)

## Test Coverage

✓ 20 comprehensive tests covering:
- URL creation with generated & custom codes
- URL format validation
- Protocol restrictions (http/https only)
- Redirect functionality
- Click count tracking
- Link retrieval & sorting
- Link deletion
- Edge cases & error scenarios
