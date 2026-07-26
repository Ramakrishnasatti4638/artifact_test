# 📝 Multi-Step Form Wizard

A modern, interactive multi-step form wizard built with Express, HTML, CSS, and vanilla JavaScript. Features a beautiful UI with a progress bar, validation, and smooth transitions.

## Features

### 🎨 User Interface
- **3-Step Registration Process**
  - Step 1: Personal Details (Name, Email)
  - Step 2: Plan Selection (Basic, Pro, Enterprise)
  - Step 3: Confirmation Summary
- **Visual Progress Bar** - Shows current step and completed steps
- **Smooth Animations** - Fade-in transitions between steps
- **Responsive Design** - Works perfectly on mobile and desktop
- **Modern Gradient Background** - Purple gradient with clean white form card

### ✅ Validation
- Real-time form validation
- Email format validation
- Required field validation
- Visual error messages
- Prevents progression without valid data

### 📋 Plan Options
Three subscription tiers with clear feature lists:
- **Basic** ($9.99/month) - 5 Projects, 10GB Storage, Email Support
- **Pro** ($19.99/month) - Unlimited Projects, 100GB Storage, Priority Support, Advanced Analytics
- **Enterprise** ($49.99/month) - Everything in Pro + Unlimited Storage, 24/7 Phone Support, Dedicated Manager, Custom Integrations

### 🔄 Navigation
- **Next/Back Buttons** - Smooth navigation between steps
- **Smart Button Display** - Shows/hides relevant buttons per step
- **Submit Confirmation** - Review all details before final submission
- **Success Screen** - Confirmation message with option to start over

### 🔧 Backend
- Express.js server with RESTful API
- Form submission endpoint (`POST /api/submit`)
- In-memory storage for submissions
- Submission retrieval endpoint (`GET /api/submissions`)
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

## Project Structure

```
multi-step-form-wizard/
├── server.js           # Express server with API endpoints
├── package.json        # Project dependencies
├── public/
│   ├── index.html     # Multi-step form markup
│   ├── styles.css     # Modern styling with animations
│   └── script.js      # Form logic, validation, and step navigation
└── README.md          # Documentation
```

## How It Works

### Step Navigation
The wizard uses a step-based system where only one step is visible at a time:
1. Users fill out personal details
2. Validation runs when clicking "Next"
3. Invalid fields show error messages
4. Valid data allows progression to next step
5. Final step shows complete summary
6. Submit button sends data to server

### Progress Tracking
- Visual progress bar at top shows 3 steps
- Active step highlighted in purple
- Completed steps shown in green
- Smooth color transitions

### Form Validation
- **Name**: Required field validation
- **Email**: Required + email format validation
- **Plan**: Must select one of three options
- Real-time error messages guide users

### Data Flow
1. User fills form across 3 steps
2. Client-side validation on each step
3. Summary displayed on step 3
4. Submit sends POST request to `/api/submit`
5. Server validates and stores data
6. Success screen displays confirmation

## API Endpoints

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

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: CSS Grid, Flexbox, CSS Animations
- **Form Handling**: Async/Await, Fetch API

## Browser Support

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

MIT
