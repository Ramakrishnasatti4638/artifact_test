# 🔗 URL Shortener

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

Links are sorted by click count (descending).

### Delete Link
**DELETE /api/links/:shortCode**

Response:
- `204` - Link deleted successfully
- `404` - Short code not found

## Project Structure

```
url-shortener/
├── server.js           # Express server and API routes
├── utils.js            # Helper functions (URL validation, code generation)
├── server.test.js      # Jest + Supertest tests
├── package.json        # Dependencies and scripts
├── public/
│   ├── index.html      # Frontend UI
│   ├── styles.css      # Styling
│   └── script.js       # Frontend logic
└── README.md
```

## Technical Details

### URL Validation
- Validates proper URL format using Node.js URL constructor
- Only accepts `http://` and `https://` protocols

### Short Code Generation
- Generates 6-character alphanumeric codes
- Character set: A-Z, a-z, 0-9 (62 possible characters)
- ~56 billion possible combinations

### Data Storage
- In-memory Map-based store
- Data structure per link:
  ```javascript
  {
    shortCode: string,
    originalUrl: string,
    createdAt: ISO 8601 timestamp,
    clickCount: number
  }
  ```

### Security Considerations
- URL format validation prevents invalid URLs
- Custom alias validation (alphanumeric + hyphens/underscores)
- No SQL injection risk (in-memory store)

## Test Coverage

```
File       | % Stmts | % Branch | % Funcs | % Lines
-----------|---------|----------|---------|--------
All files  |   94.64 |    95.45 |   77.77 |   94.54
 server.js |   93.33 |       95 |   71.42 |   93.33
 utils.js  |     100 |      100 |     100 |     100
```

Test cases include:
- URL creation with random and custom codes
- URL validation (missing, invalid, non-http protocols)
- Alias conflict handling (409)
- Redirect functionality with click tracking
- Links retrieval and sorting
- Link deletion
- Complete integration workflows

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript
- CSS Grid and Flexbox
- Clipboard API for copy functionality

## License

ISC
