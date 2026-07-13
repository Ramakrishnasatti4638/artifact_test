# URL Shortener

A full-stack URL shortener built with **Express** (backend) and vanilla **HTML/CSS/JS** (frontend), with an in-memory store and a Jest + Supertest test suite.

## Features

- Shorten any valid `http://` or `https://` URL to a 6-character random alphanumeric code
- Optional custom alias (2–50 chars, alphanumeric + hyphens/underscores)
- Click tracking — every redirect increments a counter
- Stats summary: total links + total clicks
- One-click copy-to-clipboard for the generated short URL
- Delete links via the UI or the API
- Links table sorted by click count (most clicked first)

## Getting Started

```bash
npm install
npm start          # http://localhost:3000
```

## Running Tests

```bash
npm test           # 17 Jest + Supertest tests
```

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/shorten` | Create a short link |
| `GET` | `/:shortCode` | Redirect to the original URL (302) |
| `GET` | `/api/links` | List all links (sorted by clicks desc) |
| `DELETE` | `/api/links/:shortCode` | Delete a link |

### POST /api/shorten

**Body**
```json
{ "url": "https://example.com", "customAlias": "my-link" }
```

**Responses**
- `201` — created (`{ shortCode, originalUrl, createdAt, clickCount }`)
- `400` — invalid URL or alias format
- `409` — alias already taken
