# URL Shortener

A full-stack URL shortener built with Express.js, HTML, CSS, and vanilla JavaScript. Features include custom aliases, click tracking, and an in-memory data store.

## Features

### Backend API
- **POST /api/shorten** - Create shortened URLs
  - Accepts `{ url, customAlias? }`
  - Validates URL format
  - Generates 6-character random alphanumeric codes
  - Returns 409 if custom alias is already taken
  
- **GET /:shortCode** - Redirect to original URL
  - HTTP 302 redirect
  - Increments click count
  - Returns 404 for unknown codes
  
- **GET /api/links** - Get all shortened links
  - Returns all links with stats
  - Sorted by click count (descending)
  
- **DELETE /api/links/:shortCode** - Delete a shortened link

### Frontend
- Clean, modern single-page interface
- URL input with optional custom alias
- Copy-to-clipboard functionality
- Real-time stats dashboard (Total Links, Total Clicks)
- Sortable links table with:
  - Original URL (truncated)
  - Short URL
  - Click count
  - Created date
  - Delete button

## Installation

```bash
npm install
```

## Usage

### Start the server
```bash
npm start
```

The server will run on `http://localhost:3000`

### Development mode (with auto-restart)
```bash
npm run dev
```

### Run tests
```bash
npm test
```

## Testing

Comprehensive Jest + Supertest test suite covering:
- URL validation
- Custom alias handling
- Redirect functionality
- Click tracking
- Link management (create, read, delete)
- Edge cases and error handling

**Test Coverage:** 96%+ code coverage

## Tech Stack

- **Backend:** Express.js
- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Testing:** Jest + Supertest
- **Storage:** In-memory (Map object)

## API Examples

### Create a shortened URL
```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
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