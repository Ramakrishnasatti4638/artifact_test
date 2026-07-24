# Multi-Step Form Wizard

A modern, responsive multi-step form wizard built with Express.js backend and vanilla HTML/CSS/JavaScript frontend. Features a clean UI with progress tracking, form validation, and smooth transitions.

## Features

### Frontend
- **3-Step Form Flow**
  - Step 1: Personal Details (name, email)
  - Step 2: Plan Preferences (3 plan options)
  - Step 3: Confirmation Summary
- **Progress Bar** - Visual indicator showing current step and completion status
- **Navigation** - Next/Back buttons with smart visibility
- **Real-time Validation** - Client-side validation with error messages
- **Responsive Design** - Mobile-friendly layout
- **Smooth Animations** - Fade transitions between steps
- **Success Screen** - Confirmation message after submission

### Backend
- **Express.js Server** - Lightweight Node.js backend
- **Form Submission API** - POST endpoint with validation
- **Data Storage** - In-memory storage for submissions
- **Input Validation** - Server-side validation for name, email, and plan

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
artifact_test/
├── server.js           # Express backend server
├── package.json        # Dependencies and scripts
├── public/
│   ├── index.html     # Main form wizard HTML
│   ├── styles.css     # Complete styling
│   └── script.js      # Form logic and validation
└── README.md          # Documentation
```

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
  "success": true,
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

Error responses:
- `400` - Missing required fields or invalid email

### Get All Submissions
**GET /api/submissions**

Response (200):
```json
{
  "count": 2,
  "submissions": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "plan": "pro",
      "submittedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Form Steps

### Step 1: Personal Details
- **Name** - Required, minimum 2 characters
- **Email** - Required, valid email format

### Step 2: Choose Your Plan
Three plan options available:
- **Basic** ($9.99/mo) - 5 Projects, 10GB Storage, Email Support
- **Pro** ($19.99/mo) - Unlimited Projects, 100GB Storage, Priority Support, Advanced Analytics
- **Enterprise** ($49.99/mo) - Unlimited Everything, 1TB Storage, 24/7 Support, Custom Integrations

### Step 3: Confirmation
- Review all entered information
- Agree to Terms of Service
- Submit the form

## Validation

### Client-side
- Name must be at least 2 characters
- Email must be valid format
- Plan selection is required
- Terms must be accepted before submission

### Server-side
- All fields (name, email, plan) are required
- Email format validation
- Returns appropriate error messages

## Technologies Used

- **Backend**: Node.js, Express.js, Body-Parser
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Modern CSS with gradients, animations, and responsive design
- **No frameworks**: Pure vanilla JavaScript for form logic

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Features Highlights

✅ Progress bar with visual feedback  
✅ Step-by-step navigation  
✅ Real-time form validation  
✅ Error message display  
✅ Responsive mobile design  
✅ Smooth animations and transitions  
✅ Clean, modern UI  
✅ Server-side validation  
✅ Success confirmation screen  
✅ Terms and conditions checkbox  

## License

MIT
