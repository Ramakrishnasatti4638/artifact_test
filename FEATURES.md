# ✨ URL Shortener Features & API

## Backend API Endpoints

### Health Check
- **GET** `/api/health` - Returns API health status

### Create Short URL
- **POST** `/api/shorten`
- **Request body:**
  ```json
  {
    "url": "https://www.example.com/very/long/url"
  }
  ```
- **Response:**
  ```json
  {
    "id": "uuid-string",
    "shortCode": "abc123",
    "originalUrl": "https://...",
    "shortUrl": "http://localhost/s/abc123",
    "clicks": 0,
    "createdAt": "2026-09-07T07:08:16.288Z"
  }
  ```

### Get All URLs
- **GET** `/api/urls` - Returns list of all shortened URLs

### Get Single URL
- **GET** `/api/urls/:shortCode` - Returns details of a specific shortened URL

### Delete URL
- **DELETE** `/api/urls/:shortCode` - Removes a shortened URL from the database

### Redirect (Future Enhancement)
- **GET** `/s/:shortCode` - Redirects to original URL and increments click counter

## Frontend Features

### URL Form Component
- Input field for long URLs
- Real-time validation
- Success/error messages
- Loading state during request

### URL List Component
- Display all shortened URLs
- Sort options (newest, oldest, most clicks)
- Individual URL cards with:
  - Original URL (truncated for display)
  - Short code and short URL
  - Click count
  - Creation date
  - Copy to clipboard button
  - Delete button

### Responsive Design
- Mobile-friendly layout
- Touch-optimized controls
- Gradient background with modern styling
- Smooth animations and transitions

## Testing

All endpoints have been tested and verified working:
✅ Creating shortened URLs
✅ Fetching all URLs
✅ Deleting URLs
✅ Proper error handling
✅ Database persistence with SQLite

## How to Run

### Start Backend
```bash
cd backend
npm install
npm start
```
Backend runs on `http://localhost:3001`

### Start Frontend
```bash
cd frontend
npm install
npm start
```
Frontend runs on `http://localhost:3000`

The frontend will automatically proxy API requests to the backend.
