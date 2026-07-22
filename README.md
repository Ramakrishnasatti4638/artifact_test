# Multi-Step Form Wizard

A beautiful multi-step form wizard built with Express, HTML, CSS, and vanilla JavaScript. Features a smooth user experience with progress tracking, validation, and a modern design.

## Features

### Frontend
- **3-Step Wizard Flow**
  - Step 1: Personal Details (name, email)
  - Step 2: Plan Selection (Basic, Pro, Enterprise)
  - Step 3: Confirmation Summary
- **Visual Progress Bar** - Shows current step and completion percentage
- **Step Indicators** - Visual circles showing progress through steps
- **Navigation Controls** - Back and Next buttons with smart visibility
- **Real-time Validation** - Instant feedback on form inputs
- **Responsive Design** - Works beautifully on mobile and desktop
- **Modern UI** - Gradient backgrounds, smooth animations, and clean layout
- **Success Screen** - Confirmation message after successful submission

### Backend
- **Express Server** - Lightweight Node.js backend
- **Form Submission API** - POST /api/submit endpoint
- **Data Validation** - Server-side validation for all fields
- **In-memory Storage** - Stores submissions (can be replaced with database)
- **View Submissions API** - GET /api/submissions endpoint

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

## How It Works

### Step 1: Personal Details
Users enter their full name and email address. The form validates:
- Name must be at least 2 characters
- Email must be in valid format (xxx@xxx.xxx)

### Step 2: Choose Your Plan
Users select from three pricing plans:
- **Basic** - $9/month (5 projects, 10GB storage, email support)
- **Pro** - $29/month (50 projects, 100GB storage, priority support, analytics)
- **Enterprise** - $99/month (unlimited projects/storage, 24/7 support, custom integration)

### Step 3: Confirmation
Users review all their information before submitting. The summary displays:
- Name and email from Step 1
- Selected plan from Step 2

### Progress Tracking
- Visual progress bar fills as users advance through steps
- Step indicators show completed, active, and upcoming steps
- Percentage: Step 1 (33%), Step 2 (67%), Step 3 (100%)

### Navigation
- **Next Button** - Advances to next step after validation
- **Back Button** - Returns to previous step (hidden on step 1)
- **Submit Button** - Appears on final step to complete the form

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

Response (200):
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
- `400` - Missing required fields or invalid email format

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

## File Structure

```
├── server.js           # Express server
├── package.json        # Dependencies
└── public/
    ├── index.html      # HTML structure
    ├── styles.css      # Styling and animations
    └── app.js          # Frontend JavaScript logic
```

## Technical Details

### Frontend Features
- **State Management** - Tracks current step and form data
- **Validation** - Client-side validation with error messages
- **Animations** - Smooth fade-in transitions between steps
- **Accessibility** - Semantic HTML with proper labels
- **CSS Grid** - Responsive plan card layout
- **CSS Gradients** - Beautiful purple gradient theme

### Backend Features
- **Express.js** - Fast, minimalist web framework
- **JSON API** - RESTful endpoints for form submission
- **Error Handling** - Comprehensive validation and error responses
- **CORS-ready** - Can be extended for cross-origin requests

## Customization

### Change Colors
Edit the gradient in `public/styles.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Add More Steps
1. Add step HTML in `index.html`
2. Update `totalSteps` in `app.js`
3. Add validation logic in `validateStep()`
4. Update progress bar percentages in CSS

### Add Database
Replace the `submissions` array in `server.js` with your database of choice (MongoDB, PostgreSQL, etc.)

## Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License
MIT
