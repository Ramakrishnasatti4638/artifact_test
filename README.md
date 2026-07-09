# URL Shortener

A full-stack URL shortener built with Express, HTML, CSS, and JavaScript with an in-memory store.

## Features

### Backend API

- **POST /api/shorten** - Create shortened URLs
  - Accepts `{ url, customAlias? }`
  - Validates URL format
  - Generates 6-character random alphanumeric short code (or uses customAlias)
  - Returns 409 if alias already exists
  - Stores: `{ shortCode, originalUrl, createdAt, clickCount: 0 }`

- **GET /:shortCode** - Redirect to original URL
  - HTTP 302 redirect
  - Increments click count
  - Returns 404 for unknown codes

- **GET /api/links** - List all shortened links
  - Returns all links with stats
  - Sorted by clickCount descending

- **DELETE /api/links/:shortCode** - Delete a shortened link
  - Returns 404 if link doesn't exist

### Frontend

Single-page application with:
- Input field and button to create short links
- Optional custom alias input
- Display shortened URL with copy-to-clipboard button
- Links table showing:
  - Original URL (truncated)
  - Short URL (clickable)
  - Click count
  - Created date
  - Delete button
- Stats summary card:
  - Total Links
  - Total Clicks

## Installation

```bash
npm install
```

## Usage

### Start the server

```bash
npm start
```

The application will be available at `http://localhost:3000`

### Run tests

```bash
npm test
```

Runs Jest + supertest API tests with coverage reporting.

## Tech Stack

- **Backend**: Express.js
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Storage**: In-memory Map
- **Testing**: Jest + supertest
- **Coverage**: 94%+ code coverage

## API Examples

### Create a shortened URL

```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.example.com"}'
```

### Create with custom alias

```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.example.com", "customAlias": "mylink"}'
```

### List all links

```bash
curl http://localhost:3000/api/links
```

### Delete a link

```bash
curl -X DELETE http://localhost:3000/api/links/abc123
```

## Project Structure

```
.
├── server.js           # Express backend with API endpoints
├── server.test.js      # Jest + supertest API tests
├── public/
│   ├── index.html      # Frontend HTML
│   ├── styles.css      # Frontend styles
│   └── app.js          # Frontend JavaScript
├── package.json
└── README.md
```

## License

MIT
