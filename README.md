# 📝 Multi-Step Form Wizard

A modern, responsive multi-step form wizard built with Express, HTML, CSS, and vanilla JavaScript. Features a clean UI with progress tracking, validation, and smooth transitions.

## Features

### Frontend
- **3-Step Form Flow**
  - Step 1: Personal details (name, email)
  - Step 2: Plan selection (Basic, Pro, Enterprise)
  - Step 3: Confirmation summary
- **Interactive Progress Bar** - Visual indicator showing current step and completion
- **Real-time Validation** - Instant feedback on form inputs
- **Plan Cards** - Beautiful, interactive plan selection with hover effects
- **Smooth Animations** - Fade transitions between steps
- **Responsive Design** - Works seamlessly on mobile and desktop
- **Next/Back Navigation** - Easy step navigation with validation

### Backend
- **POST /api/submit** - Submit form data with validation
- **GET /api/submissions** - Retrieve all submissions
- In-memory storage for form submissions
- Input validation and error handling

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
- **Full Name** - Required, minimum 2 characters
- **Email Address** - Required, must be valid email format

### Step 2: Choose Your Plan
Three plan options with detailed features:
- **Basic** ($9.99/month) - 10 Projects, 5GB Storage, Email Support
- **Pro** ($19.99/month) - Unlimited Projects, 50GB Storage, Priority Support, Advanced Analytics
- **Enterprise** ($49.99/month) - Unlimited Everything, 500GB Storage, 24/7 Support, Custom Integration

### Step 3: Confirmation
- Review all entered information
- Submit or go back to edit
- Success message with auto-reset

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
- `400` - All fields are required

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
├── package.json        # Dependencies and scripts
├── public/
│   ├── index.html     # Main HTML file with form wizard
│   ├── styles.css     # Complete styling and animations
│   └── script.js      # Form logic, validation, and API calls
└── README.md          # Documentation
```

## Features Breakdown

### Progress Tracking
- Visual progress bar that updates based on current step
- Step indicators with active/completed states
- Smooth width transitions on step changes

### Validation
- Real-time validation on input fields
- Error messages displayed below inputs
- Visual feedback with border colors
- Prevents progression with invalid data

### Plan Selection
- Radio button-based plan cards
- Visual selection indicator (checkmark)
- Hover effects for better UX
- Featured plan highlighting

### User Experience
- Smooth fade-in animations between steps
- Clear navigation buttons (Next/Back/Submit)
- Success message with icon animation
- Auto-reset after successful submission
- Mobile-responsive design

## Technologies Used

- **Backend**: Express.js
- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Pure CSS with modern features (Grid, Flexbox, Animations)
- **No external UI frameworks** - Lightweight and fast

## Browser Support

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

ISC
