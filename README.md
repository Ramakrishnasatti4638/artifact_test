# URL Shortener

A full-stack URL shortener application built with Express.js, featuring a clean frontend interface and comprehensive API.

## Features

- **URL Shortening**: Convert long URLs into short, shareable links
- **Custom Aliases**: Optional custom short codes for branded links
- **Click Tracking**: Monitor engagement with click count statistics
- **Link Management**: View all links and delete unwanted ones
- **Real-time Stats**: Dashboard showing total links and clicks

## Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Testing**: Jest + Supertest (19 tests, 94% coverage)
- **Data Store**: In-memory storage

## API Endpoints

- `POST /api/shorten` - Create shortened link
- `GET /:shortCode` - Redirect to original URL
- `GET /api/links` - Get all links with statistics
- `DELETE /api/links/:shortCode` - Delete a link

## Getting Started

```bash
# Install dependencies
npm install

# Run the server
npm start

# Run tests
npm test
```

Visit `http://localhost:3000` to use the application.
