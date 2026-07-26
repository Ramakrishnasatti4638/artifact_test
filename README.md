# Multi-Step Form Wizard

A modern multi-step form wizard built with Express, HTML, CSS, and vanilla JavaScript. Features a clean UI with progress tracking, validation, and smooth transitions.

## Features

### Form Steps
1. **Step 1: Personal Details** - Collect name and email with validation
2. **Step 2: Plan Selection** - Choose from 3 pricing tiers (Basic, Pro, Enterprise)
3. **Step 3: Confirmation** - Review and submit the form

### User Experience
- **Progress Bar** - Visual indicator showing current step and completion status
- **Navigation** - Next/Back buttons with smooth transitions
- **Validation** - Real-time input validation with error messages
- **Responsive Design** - Mobile-friendly layout
- **Success Feedback** - Confirmation message after successful submission

### Backend
- **Express Server** - Handles form submissions
- **In-Memory Storage** - Stores form submissions
- **REST API** - Endpoints for submitting and retrieving data

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

Response (201):
```json
{
  "success": true,
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
- `400` - Missing required fields

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
├── server.js           # Express server
├── package.json        # Dependencies
└── public/
    ├── index.html      # Main HTML page
    ├── styles.css      # Styling
    └── script.js       # Form wizard logic
```

## Pricing Plans

- **Basic** - $9/month: 5 Projects, 10 GB Storage, Email Support
- **Pro** - $29/month: Unlimited Projects, 100 GB Storage, Priority Support, Advanced Analytics
- **Enterprise** - $99/month: Everything in Pro, 1 TB Storage, 24/7 Phone Support, Custom Integration, Dedicated Manager

## Technologies Used

- **Backend**: Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **No framework dependencies** - Pure JavaScript implementation
