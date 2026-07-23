# 🧙‍♂️ Multi-Step Form Wizard

A clean, modern multi-step form wizard built with Express, HTML, CSS, and vanilla JavaScript. Features a beautiful UI with progress tracking, validation, and smooth transitions.

## Features

### Frontend
- **3-Step Form Flow**
  - Step 1: Personal details (name, email)
  - Step 2: Plan selection (Basic, Pro, Enterprise)
  - Step 3: Confirmation summary
- **Visual Progress Bar** - Dynamic progress indicator showing completion percentage
- **Step Indicators** - Visual markers for current, completed, and upcoming steps
- **Real-time Validation** - Instant feedback on form inputs
- **Responsive Design** - Works seamlessly on mobile and desktop
- **Smooth Animations** - Fade-in transitions between steps
- **Navigation Controls** - Next/Back buttons with smart visibility

### Backend API
- **POST /api/submit** - Submit form data with validation
- **GET /api/submissions** - View all submissions (demo endpoint)

### Form Validation
- Name: Required, minimum 2 characters
- Email: Required, valid email format
- Plan: Required selection from 3 options

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

## Project Structure

```
multi-step-form-wizard/
├── server.js           # Express server with API endpoints
├── public/
│   ├── index.html      # Multi-step form HTML structure
│   ├── styles.css      # Responsive CSS with animations
│   └── script.js       # Form wizard logic and validation
├── package.json        # Project dependencies
└── README.md          # Documentation
```

## API Documentation

### Submit Form
**POST /api/submit**

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "plan": "pro"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Form submitted successfully!",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "plan": "pro",
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

Error responses:
- `400` - Missing required fields
- `400` - Invalid email format
- `400` - Invalid plan selected

### Get All Submissions
**GET /api/submissions**

Response (200):
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "plan": "pro",
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## Plan Options

### Basic - $9.99/month
- Up to 5 users
- 10GB storage
- Email support

### Pro - $29.99/month (Recommended)
- Up to 25 users
- 100GB storage
- Priority support
- Advanced analytics

### Enterprise - $99.99/month
- Unlimited users
- Unlimited storage
- 24/7 phone support
- Custom integrations
- Dedicated account manager

## Features in Detail

### Progress Tracking
- Visual progress bar fills as user advances through steps
- Step indicators show current position (1/2/3)
- Completed steps marked with checkmark styling
- Active step highlighted in brand color

### Validation
- Client-side validation prevents invalid submissions
- Real-time error messages under each field
- Prevents navigation until current step is valid
- Server-side validation as final check

### User Experience
- Smooth fade-in animations between steps
- Responsive button layout (Next/Back/Submit)
- Hover effects on interactive elements
- Mobile-optimized with touch-friendly controls
- Clear visual hierarchy and typography

## Technical Highlights

- **Pure Vanilla JavaScript** - No framework dependencies
- **CSS Grid & Flexbox** - Modern responsive layouts
- **Gradient Design** - Purple gradient theme throughout
- **Form State Management** - Centralized formData object
- **Express Middleware** - JSON and URL-encoded parsing
- **In-Memory Storage** - Simple submission tracking

## Browser Support

Works on all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT
