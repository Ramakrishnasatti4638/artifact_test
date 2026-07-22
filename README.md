# Toggle Switch Component

A modern, accessible toggle switch component built with Express, HTML, CSS, and vanilla JavaScript. Features smooth animations, keyboard accessibility, and persistent state management.

## Features

- **Interactive Toggle Switch**: Click to toggle between ON (green) and OFF (grey) states
- **Visual Feedback**: Smooth animations and color transitions
- **Status Label**: Dynamic label that updates with the toggle state
- **State Persistence**: Toggle state persisted on the backend via Express API
- **Keyboard Accessible**: Full keyboard support (Enter/Space to toggle)
- **Responsive Design**: Works on mobile and desktop
- **State Demonstrations**: Visual examples showing both OFF and ON states

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

## Component States

### OFF State (Default)
- **Background**: Grey (#ccc)
- **Slider Position**: Left side
- **Status Label**: "Status: OFF" (grey text)

### ON State
- **Background**: Green (#4caf50)
- **Slider Position**: Right side
- **Status Label**: "Status: ON" (green text)

## API Endpoints

### Get Toggle State
**GET /api/toggle**

Response (200):
```json
{
  "isOn": false
}
```

### Update Toggle State
**POST /api/toggle**

Request body:
```json
{
  "isOn": true
}
```

Response (200):
```json
{
  "isOn": true
}
```

Error responses:
- `400` - isOn must be a boolean

## File Structure

```
.
├── server.js           # Express backend with toggle state API
├── package.json        # Dependencies and scripts
└── public/
    ├── index.html      # Main HTML page with toggle component
    ├── styles.css      # Toggle switch styles and animations
    └── script.js       # Toggle interaction logic
```

## Technical Details

### HTML Structure
- Semantic HTML with proper ARIA attributes for accessibility
- Role="switch" with aria-checked state management
- Keyboard-navigable with tabindex

### CSS Features
- Smooth transitions for background color and slider movement
- Hover and focus states for better UX
- Box shadows for depth and visual hierarchy
- Responsive grid layout for demonstrations

### JavaScript Implementation
- Async/await for API communication
- Optimistic UI updates for instant feedback
- Error handling with state rollback on failure
- Keyboard event listeners for accessibility

## Browser Support

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

MIT
