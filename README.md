# 📝 Multi-Step Form Wizard

A beautiful and responsive multi-step form wizard built with Express, HTML, CSS, and vanilla JavaScript. Features a progress bar, step indicators, and smooth transitions between form steps.

## Features

### Frontend
- **3-Step Form Flow**
  - Step 1: Personal Details (name, email)
  - Step 2: Plan Selection (3 pricing tiers with visual cards)
  - Step 3: Confirmation Summary
- **Interactive UI Elements**
  - Animated progress bar showing completion percentage
  - Step indicators with active/completed states
  - Next/Back navigation buttons
  - Form validation with error feedback
  - Success message after submission
- **Modern Design**
  - Gradient backgrounds and smooth animations
  - Responsive layout for mobile and desktop
  - Hover effects on plan cards
  - Clean typography and spacing

### Backend API
- **POST /api/submit** - Save form submission data
- **GET /api/submissions** - Retrieve all form submissions
- In-memory storage for submitted forms

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

## Form Structure

### Step 1: Personal Details
Users enter their basic information:
- Full Name (required)
- Email Address (required, validated)

### Step 2: Choose Your Plan
Three pricing tiers presented as interactive cards:
- **Basic Plan** - $9/month
  - 5 Projects
  - 10 GB Storage
  - Email Support
- **Pro Plan** - $29/month
  - 50 Projects
  - 100 GB Storage
  - Priority Support
  - Advanced Analytics
- **Enterprise Plan** - $99/month
  - Unlimited Projects
  - 1 TB Storage
  - 24/7 Support
  - Custom Integrations
  - Dedicated Manager

### Step 3: Confirmation
Summary of all entered information:
- Personal details review
- Selected plan with pricing
- Submit button to complete registration

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

Response (200):
```json
{
  "success": true,
  "message": "Form submitted successfully!",
  "data": {
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
    "name": "John Doe",
    "email": "john@example.com",
    "plan": "pro",
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## Technical Details

### Frontend Technologies
- Vanilla JavaScript (ES6+)
- CSS3 with animations and gradients
- Responsive design with CSS Grid and Flexbox
- Form validation

### Backend Technologies
- Express.js
- In-memory data storage
- JSON request/response handling

### Features Implemented
- ✅ Multi-step form navigation
- ✅ Progress bar visualization
- ✅ Form validation
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Success feedback
- ✅ Data persistence via API

## File Structure

```
.
├── server.js           # Express server and API endpoints
├── package.json        # Dependencies and scripts
├── public/
│   ├── index.html     # Main HTML with form wizard
│   ├── styles.css     # Styling and animations
│   └── script.js      # Form logic and API calls
└── README.md          # Documentation
```

## Browser Support

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)
