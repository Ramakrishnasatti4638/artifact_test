# Snip.ly — URL Shortener

A clean, full-stack URL shortener built with **Node.js + Express** and a plain HTML/CSS/JS frontend. No database setup required — links are stored in a local JSON file.

## Features

- 🔗 Shorten any `http://` or `https://` URL
- ✏️ Optional custom alias (e.g. `snip.ly/my-link`)
- 📊 Click tracking per link
- 🗑️ Delete links
- 📋 One-click copy to clipboard
- 💾 Persistent storage via `data.json`

## Quick Start

```bash
npm install
npm start
```

Then open `http://localhost:3000` in your browser.

## API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/shorten` | Create a short link |
| `GET` | `/api/urls` | List all links |
| `DELETE` | `/api/urls/:slug` | Delete a link |
| `GET` | `/:slug` | Redirect to original URL |

### POST /api/shorten

```json
{
  "url": "https://example.com/long/path",
  "customSlug": "my-link"   // optional
}
```

## Tech Stack

- **Backend:** Node.js, Express
- **Storage:** JSON file (`data.json`)
- **IDs:** nanoid (7-char random slugs)
- **Frontend:** Vanilla HTML / CSS / JavaScript
