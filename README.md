# Multi-Step Form Wizard

A modern multi-step form wizard built with Express.js and vanilla JavaScript. Features a clean UI with progress tracking, form validation, and smooth transitions between steps.

## Features

### Frontend
- **3-Step Form Flow**
  - Step 1: Personal Details (name, email)
  - Step 2: Plan Selection (Basic, Pro, Enterprise)
  - Step 3: Confirmation Summary
- **Progress Bar** - Visual progress indicator showing current step
- **Navigation** - Back/Next buttons with smart visibility
- **Form Validation** - Real-time validation with error messages
- **Responsive Design** - Mobile-friendly layout
- **Modern UI** - Clean gradient design with smooth animations

### Backend API
- **POST /api/submit** - Submit completed form data
- **GET /api/submissions** - Retrieve all submissions (for testing)
- In-memory storage for form submissions

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

## Form Structure

### Step 1: Personal Details
- Full Name (required text input)
- Email Address (required email input with validation)

### Step 2: Choose Your Plan
Three plan options with radio button selection:
- **Basic** - $9/month
  - 5 Projects
  - 10GB Storage
  - Email Support

- **Pro** - $29/month
  - Unlimited Projects
  - 100GB Storage
  - Priority Support
  - Advanced Analytics

- **Enterprise** - $99/month
  - Unlimited Everything
  - 1TB Storage
  - 24/7 Support
  - Custom Integration
  - Dedicated Manager

### Step 3: Confirmation
Review all entered information before submission:
- Name
- Email
- Selected Plan

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

Error response (400):
```json
{
  "error": "All fields are required"
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

## Technical Details

### Frontend Technologies
- HTML5
- CSS3 (with modern features like Grid, Flexbox, CSS animations)
- Vanilla JavaScript (ES6+)

### Backend Technologies
- Express.js
- Node.js

### Key Features Implementation
- **Progress Tracking**: Dynamic progress bar updates based on current step
- **Step Navigation**: Smart button visibility (Back hidden on step 1, Next hidden on step 3)
- **Validation**: Client-side validation with visual feedback
- **State Management**: Form data stored in JavaScript object during wizard flow
- **Animations**: Smooth fade-in transitions between steps
- **Responsive**: Mobile-first design with breakpoints for smaller screens

## File Structure

```
.
├── server.js           # Express server
├── package.json        # Dependencies and scripts
├── public/
│   ├── index.html     # Form wizard HTML
│   ├── styles.css     # Styling and animations
│   └── script.js      # Client-side logic
└── README.md          # Documentation
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript support required
- CSS Grid and Flexbox support required
