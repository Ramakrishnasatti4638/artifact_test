# URL Shortener

A full-stack URL shortener application built with Express, HTML, CSS, and vanilla JavaScript. Features an in-memory store, comprehensive API, and a modern responsive UI.

## Features

### Backend API
- **POST /api/shorten** - Create shortened URLs with optional custom aliases
- **GET /:shortCode** - Redirect to original URL with click tracking
- **GET /api/links** - Retrieve all links with stats (sorted by click count)
- **DELETE /api/links/:shortCode** - Delete shortened links

### Frontend
- Clean, modern single-page interface
- Real-time stats dashboard (Total Links, Total Clicks)
- URL shortening with optional custom aliases
- Copy-to-clipboard functionality
- Links table with click counts and delete actions
- Responsive design for mobile and desktop

### Testing
- Comprehensive Jest + Supertest test suite
- 19 test cases covering all endpoints
- 94%+ code coverage
- Integration tests for complete workflows

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

### Development mode (with auto-reload)
```bash
npm run dev
```

### Run tests
```bash
npm test
```

## API Documentation

### Create Shortened URL
**POST /api/shorten**

Request body:
```json
{
  "url": "https://example.com/very/long/url",
  "customAlias": "my-link" // optional
}
```

Response (201):
```json
{
  "shortCode": "abc123",
  "originalUrl": "https://example.com/very/long/url",
  "shortUrl": "http://localhost:3000/abc123",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

Error responses:
- `400` - URL is required or invalid format
- `409` - Custom alias already taken

### Redirect to Original URL
**GET /:shortCode**

Redirects (302) to the original URL and increments click count.

Error responses:
- `404` - Short code not found

### Get All Links
**GET /api/links**

Response (200):
```json
[
  {
    "shortCode": "abc123",
    "originalUrl": "https://example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "clickCount": 5
  }
]
```

Links are sorted by `clickCount` in descending order.

### Delete a Link
**DELETE /api/links/:shortCode**

Response (204) - No content

Error responses:
- `404` - Short code not found

## Project Structure

```
.
├── public/
│   └── index.html          # Frontend single-page app
├── src/
│   ├── app.js              # Express app and API routes
│   ├── server.js           # Server entry point
│   ├── store.js            # In-memory store logic
│   └── app.test.js         # Jest + Supertest tests
├── jest.config.js          # Jest configuration
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Implementation Details

### Store (In-Memory)
- URLs are stored in a JavaScript `Map`
- Format: `shortCode -> { shortCode, originalUrl, createdAt, clickCount }`
- Validation: URL format validation using `new URL()` constructor
- Short code generation: Random 6-character alphanumeric codes or custom aliases

### Backend
- **Express.js** for routing and middleware
- **JSON** request/response format
- **URL validation** using native JavaScript `URL` constructor
- **Click tracking** on redirect operations
- **Sorting** by click count in descending order

### Frontend
- **Vanilla JavaScript** (no frameworks)
- **Responsive CSS Grid** for stats and layout
- **Copy-to-clipboard** API for easy sharing
- **Real-time updates** after creating/deleting links
- **Date formatting** for user-friendly display

### Testing
- **Jest** for test runner and assertions
- **Supertest** for HTTP request testing
- **19 test cases** covering:
  - Valid URL shortening
  - Custom alias creation
  - Error handling (invalid URLs, duplicates)
  - Redirect functionality with click tracking
  - List retrieval and sorting
  - Link deletion
  - Complete workflows

## Tech Stack

- **Runtime**: Node.js
- **Backend**: Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Testing**: Jest, Supertest
- **Dev**: Nodemon (auto-reload)

## License

MIT
