# Multi-Step Form Wizard

A modern, interactive multi-step form wizard built with Express.js, HTML, CSS, and vanilla JavaScript. Features a beautiful UI with progress tracking, form validation, and smooth animations.

## Features

### User Interface
- **3-Step Wizard Flow**
  - Step 1: Personal Details (Name, Email)
  - Step 2: Plan Selection (Basic, Pro, Enterprise)
  - Step 3: Confirmation Summary
- **Visual Progress Bar** with step indicators
- **Navigation Controls** (Next/Back buttons)
- **Real-time Form Validation**
- **Smooth Animations** and transitions
- **Responsive Design** for mobile and desktop

### Backend API
- **POST /api/submit-form** - Submit completed form
- **GET /api/submissions** - View all submissions
- Form validation (required fields, email format, plan selection)
- In-memory data storage

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

## Form Validation

### Step 1: Personal Details
- **Name**: Required, minimum 2 characters
- **Email**: Required, valid email format

### Step 2: Plan Selection
- Must select one plan:
  - **Basic**: $9/month - 5 Projects, 10GB Storage, Email Support
  - **Pro**: $29/month - 50 Projects, 100GB Storage, Priority Support, Advanced Analytics
  - **Enterprise**: $99/month - Unlimited Projects, 1TB Storage, 24/7 Support, Custom Integrations

### Step 3: Confirmation
- Review all entered information
- Must agree to Terms of Service

## API Documentation

### Submit Form
**POST /api/submit-form**

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "plan": "pro"
}
```

Response (201):
```json
{
  "success": true,
  "message": "Form submitted successfully",
  "submission": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "plan": "pro",
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

Error responses:
- `400` - Missing required fields or invalid data
- Validation errors include specific field details

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

## Project Structure

```
.
├── server.js           # Express server and API routes
├── package.json        # Project dependencies
├── public/
│   ├── index.html     # Main HTML structure
│   ├── styles.css     # Styling and animations
│   └── script.js      # Form wizard logic and validation
└── README.md          # This file
```

## Features in Detail

### Progress Tracking
- Visual step indicators (1, 2, 3)
- Active step highlighting
- Completed steps marked with checkmarks
- Progress line connecting steps

### Form Validation
- Real-time field validation
- Error messages displayed inline
- Prevents progression with invalid data
- Email format validation using regex

### Navigation
- **Next Button**: Validates current step before proceeding
- **Back Button**: Returns to previous step without validation
- **Submit Button**: Final submission with terms acceptance
- Smooth transitions between steps

### User Experience
- Clean, modern design with gradient background
- Responsive layout for all screen sizes
- Hover effects on interactive elements
- Success animation after submission
- "Start Over" button to reset form

## Browser Support

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT
