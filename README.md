# Multi-Step Form Wizard

A beautiful, interactive multi-step form wizard built with Express.js backend and vanilla JavaScript frontend. Features a progress bar, step indicators, form validation, and a clean modern UI.

## Features

### Frontend
- **3-Step Form Flow**
  - Step 1: Personal Details (Name, Email)
  - Step 2: Plan Selection (Basic, Pro, Enterprise)
  - Step 3: Confirmation Summary
- **Interactive Progress Bar** - Visual progress tracking across steps
- **Step Indicators** - Clear visual representation of current step
- **Navigation Controls** - Back/Next/Submit buttons with smart visibility
- **Form Validation** - Real-time validation with error messages
- **Responsive Design** - Mobile-friendly layout
- **Modern UI** - Gradient styling, smooth animations, and hover effects
- **Success Confirmation** - Visual feedback after form submission

### Backend
- **Express.js Server** - Lightweight Node.js backend
- **Form Submission API** - POST /api/submit endpoint
- **Data Storage** - In-memory storage for form submissions
- **Validation** - Server-side validation for required fields
- **RESTful API** - GET /api/submissions to view all submissions

## Installation

Install dependencies:
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
.
├── server.js           # Express server with API endpoints
├── package.json        # Project configuration and dependencies
├── public/
│   ├── index.html     # Multi-step form HTML structure
│   ├── style.css      # Modern, responsive styling
│   └── script.js      # Form wizard logic and validation
└── README.md          # This file
```

## Form Flow

1. **Step 1: Personal Details**
   - User enters name and email
   - Real-time validation ensures required fields are filled
   - Email format validation

2. **Step 2: Plan Selection**
   - Choose from 3 plan options: Basic, Pro, or Enterprise
   - Visual card selection with hover effects
   - Popular plan highlighted with a badge

3. **Step 3: Confirmation**
   - Review all entered information
   - Summary of personal details and selected plan
   - Submit button to complete registration
   - Success message with auto-reset

## API Endpoints

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

Response (201):
```json
{
  "message": "Form submitted successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "plan": "pro",
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

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

## Features Breakdown

### Progress Bar
- Visual percentage indicator (33%, 66%, 100%)
- Smooth animation between steps
- Gradient color styling

### Step Indicators
- Shows all 3 steps with numbers
- Active step highlighted
- Completed steps marked with checkmark style
- Labels for each step

### Form Validation
- Required field validation
- Email format validation
- Minimum length validation for name
- Real-time error messages
- Visual error states (red borders)

### Navigation
- **Next Button**: Validates current step before proceeding
- **Back Button**: Return to previous step without validation
- **Submit Button**: Only visible on final step
- Smart button visibility based on current step

### Responsive Design
- Mobile-optimized layout
- Stacked plan cards on small screens
- Touch-friendly buttons
- Flexible grid system

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: CSS Grid, Flexbox, CSS Animations
- **No external UI libraries** - Pure vanilla implementation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

ISC
