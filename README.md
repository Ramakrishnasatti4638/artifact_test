# URL Shortener

A full-stack URL shortener application built with Express.js and vanilla JavaScript. Shorten long URLs, track click statistics, and manage your links with ease.

## Features

- 🔗 **URL Shortening**: Convert long URLs into short, shareable links
- 🎨 **Custom Aliases**: Create custom short codes for your URLs
- 📊 **Click Tracking**: Monitor click counts for all shortened URLs
- 🗑️ **Link Management**: Delete links you no longer need
- 🌓 **Dark/Light Theme**: Toggle between dark and light modes with persistent preference
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Real-time Updates**: Instant feedback and statistics

## Theme Support

The application includes a beautiful dark and light theme toggle:

- **Light Theme**: Clean, modern interface with purple gradient background
- **Dark Theme**: Eye-friendly dark mode with blue-tinted dark colors
- **Persistent Preference**: Your theme choice is saved in local storage
- **Smooth Transitions**: Seamless theme switching with smooth animations

Click the theme toggle button (🌙/☀️) in the header to switch between themes.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd artifact_test
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

### Creating a Short URL

1. Enter a long URL in the input field
2. (Optional) Provide a custom alias
3. Click "Shorten URL"
4. Copy your shortened URL and share it!

### Managing Links

- View all your shortened URLs in the table below
- See click statistics for each link
- Delete links by clicking the "Delete" button
- Links are sorted by click count (most popular first)

### Switching Themes

Click the theme toggle button in the top-right corner to switch between light and dark modes. Your preference will be saved automatically.

## API Endpoints

### POST /api/shorten
Create a shortened URL

**Request Body:**
```json
{
  "url": "https://example.com/very/long/url",
  "customAlias": "mylink" // optional
}
```

**Response:**
```json
{
  "shortCode": "mylink",
  "originalUrl": "https://example.com/very/long/url",
  "shortUrl": "http://localhost:3000/mylink",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/links
Get all shortened URLs with statistics

**Response:**
```json
[
  {
    "shortCode": "abc123",
    "originalUrl": "https://example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "clickCount": 42
  }
]
```

### DELETE /api/links/:shortCode
Delete a shortened URL

**Response:** 204 No Content

### GET /:shortCode
Redirect to the original URL and increment click count

## Development

### Run Tests
```bash
npm test
```

### Development Mode
```bash
npm run dev
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Storage**: In-memory data store (Map)
- **Testing**: Jest, Supertest

## Project Structure

```
artifact_test/
├── public/
│   ├── index.html      # Main HTML file
│   ├── styles.css      # Styles with theme support
│   └── app.js          # Frontend JavaScript with theme logic
├── server.js           # Express server
├── server.test.js      # API tests
├── package.json        # Dependencies
└── README.md           # This file
```

## Theme CSS Variables

The application uses CSS custom properties for easy theme customization:

```css
:root {
  --bg-gradient-start: #667eea;
  --bg-gradient-end: #764ba2;
  --card-bg: #ffffff;
  --text-primary: #333333;
  /* ... more variables */
}

body.dark-theme {
  --bg-gradient-start: #1a1a2e;
  --bg-gradient-end: #16213e;
  --card-bg: #0f3460;
  --text-primary: #e4e4e7;
  /* ... more variables */
}
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
