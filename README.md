# 📝 Multi-Step Form Wizard

A modern multi-step form wizard built with Express, HTML, CSS, and vanilla JavaScript. Features a clean UI with progress tracking, validation, and smooth transitions between steps.

## Features

### Frontend
- **3-Step Registration Flow**
  - Step 1: Personal details (name, email)
  - Step 2: Plan selection (Basic, Pro, Enterprise)
  - Step 3: Confirmation summary
- **Interactive Progress Bar** - Visual indicator showing current step and completion
- **Plan Selection Cards** - Three pricing tiers with feature lists
- **Real-time Validation** - Instant feedback on form inputs
- **Smooth Animations** - Fade transitions between steps
- **Navigation Controls** - Back/Next buttons with smart visibility
- **Success Screen** - Confirmation message after submission
- **Responsive Design** - Works on mobile and desktop

### Backend API
- **POST /api/submit** - Submit form data and store submission
- **GET /api/submissions** - Retrieve all form submissions
- In-memory storage for form data

### UI Highlights
- Modern gradient design with purple theme
- Card-based plan selection interface
- Progress indicator with numbered steps
- Form validation with error messages
- Success animation on completion

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
├── server.js           # Express server and API endpoints
├── public/
│   ├── index.html     # Main HTML structure
│   ├── styles.css     # Complete styling and animations
│   └── app.js         # Form wizard logic and validation
└── package.json       # Dependencies and scripts
```

## Form Flow

### Step 1: Personal Details
- Full name input with minimum length validation
- Email input with format validation
- Required fields with real-time error messages

### Step 2: Choose Your Plan
Three plan options:
- **Basic** ($9/month) - 5 Projects, 10GB Storage, Email Support
- **Pro** ($29/month) - Unlimited Projects, 100GB Storage, Priority Support, Analytics (Featured)
- **Enterprise** ($99/month) - Unlimited Everything, 1TB Storage, 24/7 Support, Custom Integration

### Step 3: Confirmation
Review all entered information before submission:
- Personal information summary
- Selected plan display
- Submit button to complete registration

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
  "message": "Form submitted successfully!",
  "submission": {
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
- Vanilla JavaScript (ES6+)
- CSS3 with animations and gradients
- Semantic HTML5
- Fetch API for async requests

### Backend Technologies
- Express.js 4.x
- In-memory data storage
- JSON middleware

### Features Implementation
- **State Management** - Client-side form data object tracking
- **Step Navigation** - Dynamic step rendering with validation gates
- **Progress Tracking** - Visual progress bar and step indicators
- **Plan Selection** - Interactive card-based UI with selection state
- **Validation** - Field-level and step-level validation
- **Success Flow** - Post-submission success screen with reset option

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- No external dependencies for frontend

## License
ISC
