# Multi-Step Form Wizard

A beautiful and interactive multi-step form wizard built with Express, HTML, CSS, and vanilla JavaScript. Features a smooth user experience with progress tracking, validation, and animated transitions.

## Features

### Frontend
- **3-Step Form Flow**
  - Step 1: Personal Details (name, email)
  - Step 2: Plan Selection (Basic, Pro, Enterprise)
  - Step 3: Confirmation Summary
  
- **Interactive Progress Bar**
  - Visual step indicators with numbers
  - Animated progress lines
  - Active and completed states
  
- **User Experience**
  - Smooth page transitions with animations
  - Real-time form validation
  - Error messages for invalid inputs
  - Next/Back navigation buttons
  - Success confirmation screen
  
- **Modern Design**
  - Clean, professional UI
  - Gradient background
  - Card-based plan selection
  - Responsive layout for mobile and desktop
  - Hover effects and animations

### Backend API
- **POST /api/submit** - Submit form data with validation
  - Validates required fields (name, email, plan)
  - Email format validation
  - Stores submissions in memory
  
- **GET /api/submissions** - Retrieve all form submissions

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

### Development mode
```bash
npm run dev
```

## Project Structure

```
/
├── server.js              # Express server and API routes
├── public/
│   ├── index.html        # Multi-step form HTML structure
│   ├── styles.css        # Complete styling and animations
│   └── script.js         # Form wizard logic and validation
├── package.json
└── README.md
```

## API Documentation

### Submit Form Data
**POST /api/submit**

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "plan": "pro"
}
```

Success Response (200):
```json
{
  "success": true,
  "message": "Form submitted successfully!",
  "data": {
    "id": 1234567890,
    "name": "John Doe",
    "email": "john@example.com",
    "plan": "pro",
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

Error Responses:
- `400` - Missing required fields or invalid email format
```json
{
  "success": false,
  "message": "All fields are required"
}
```

### Get All Submissions
**GET /api/submissions**

Response (200):
```json
[
  {
    "id": 1234567890,
    "name": "John Doe",
    "email": "john@example.com",
    "plan": "pro",
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## Form Validation

### Step 1: Personal Details
- **Name**: Required, minimum 2 characters
- **Email**: Required, valid email format

### Step 2: Plan Selection
- **Plan**: Required, must select one of: basic, pro, enterprise

## Available Plans

| Plan | Price | Features |
|------|-------|----------|
| **Basic** | $9/month | 5 Projects, 10GB Storage, Email Support |
| **Pro** | $29/month | Unlimited Projects, 100GB Storage, Priority Support, Advanced Analytics |
| **Enterprise** | $99/month | Unlimited Everything, 1TB Storage, 24/7 Support, Custom Solutions, Dedicated Manager |

## Features Breakdown

### Progress Bar
- Visual representation of current step
- Shows completed, active, and upcoming steps
- Animated transitions between steps

### Navigation
- **Next Button**: Validates current step before proceeding
- **Back Button**: Returns to previous step without validation
- **Submit Button**: Appears only on final step

### Validation
- Real-time input validation
- Clear error messages
- Prevents progression with invalid data
- Email format verification
- Required field checking

### Success State
- Animated success confirmation
- Checkmark icon animation
- All progress indicators marked complete
- Hidden form fields after submission

## Technologies Used

- **Backend**: Express.js 4.18.2
- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Pure CSS3 with animations
- **No frameworks**: Lightweight and fast

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- Database integration (MongoDB/PostgreSQL)
- Form data persistence in localStorage
- Multi-page form with routing
- File upload support
- Payment integration
- Email confirmation
- Admin dashboard
- Export submissions as CSV/PDF

## License

MIT
