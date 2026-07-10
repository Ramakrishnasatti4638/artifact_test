# URL Shortener

A full-stack URL shortener application built with Express, HTML, CSS, and vanilla JavaScript.

## Features

- **Shorten URLs**: Create short links with auto-generated 6-character codes or custom aliases
- **URL Validation**: Validates URL format and rejects invalid URLs
- **Click Tracking**: Track how many times each short link has been clicked
- **Statistics Dashboard**: View total links and total clicks at a glance
- **Link Management**: Delete links you no longer need
- **Sorted Display**: Links are sorted by click count (most popular first)
- **Copy to Clipboard**: Easy one-click copy for shortened URLs

## API Endpoints

### POST /api/shorten
Create a shortened URL.

**Request Body:**
```json
{
  "url": "https://example.com/very/long/url",
  "customAlias": "my-link" // optional
}
```

**Response:**
```json
{
  "shortCode": "abc123",
  "shortUrl": "http://localhost:3000/abc123",
  "originalUrl": "https://example.com/very/long/url"
}
```

**Error Responses:**
- `400` - Invalid or missing URL
- `409` - Custom alias already taken

### GET /:shortCode
Redirect to the original URL and increment click count.

**Response:** HTTP 302 redirect to original URL
**Error:** `404` if short code not found

### GET /api/links
Get all shortened links with statistics.

**Response:**
```json
[
  {
    "shortCode": "abc123",
    "originalUrl": "https://example.com",
    "shortUrl": "http://localhost:3000/abc123",
    "clickCount": 42,
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
]
```

### DELETE /api/links/:shortCode
Delete a shortened link.

**Response:** `204` No Content
**Error:** `404` if short code not found

## Installation

```bash
npm install
```

## Running the Application

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Running Tests

```bash
npm test
```

The test suite includes 18 tests covering:
- URL creation with auto-generated and custom codes
- URL validation
- Redirect functionality and click tracking
- Link retrieval and sorting
- Link deletion
- Edge cases (query parameters, fragments, unique code generation)

Test coverage: 94.54% statements, 90.9% branches

## Technology Stack

- **Backend**: Express.js with in-memory storage
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Testing**: Jest + Supertest
- **Validation**: URL format validation using URL constructor

## Project Structure

```
.
├── server.js           # Express server and API endpoints
├── server.test.js      # Jest test suite
├── public/
│   ├── index.html     # Single-page application
│   ├── style.css      # Styling
│   └── app.js         # Frontend JavaScript
├── package.json
└── README.md
```

## Design Decisions

- **In-Memory Storage**: Simple Map-based storage for fast lookups and easy testing
- **6-Character Codes**: Provides 56.8 billion possible combinations (62^6)
- **Validation**: URL validation uses native URL constructor for reliable format checking
- **HTTP Only**: Only accepts http:// and https:// URLs for security
- **No External Dependencies**: Frontend uses vanilla JavaScript for simplicity
