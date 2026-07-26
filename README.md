# 🧙 Multi-Step Form Wizard

A beautiful multi-step form wizard built with Express.js and vanilla JavaScript. Features a smooth user experience with progress tracking, validation, and a modern responsive design.

## Features

### 🎯 Three-Step Process
1. **Personal Details** - Collect name and email with validation
2. **Plan Selection** - Choose from Basic, Pro, or Enterprise plans with visual cards
3. **Confirmation** - Review and submit with a summary view

### ✨ User Experience
- **Progress Bar** - Visual indicator showing completion percentage
- **Step Indicators** - Numbered circles showing current, completed, and upcoming steps
- **Navigation** - Back/Next buttons for easy step navigation
- **Validation** - Real-time form validation with helpful error messages
- **Success Animation** - Animated success screen on form submission
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

### 🎨 Design Features
- Modern gradient backgrounds
- Smooth animations and transitions
- Card-based plan selection with hover effects
- Clean, accessible interface
- Professional typography and spacing

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
.
├── server.js           # Express server with API endpoints
├── package.json        # Dependencies and scripts
└── public/
    ├── index.html      # Multi-step form HTML structure
    ├── styles.css      # Complete styling and animations
    └── script.js       # Form wizard logic and validation
```

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
  "message": "Form submitted successfully",
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

## Features Breakdown

### Step 1: Personal Details
- **Name input** with required validation
- **Email input** with format validation
- Error messages displayed inline
- Real-time error clearing on input

### Step 2: Plan Selection
- Three plan options: Basic ($9), Pro ($29), Enterprise ($99)
- Visual card-based selection with icons
- Feature lists for each plan
- Hover effects and selected state indicators
- Required field validation

### Step 3: Confirmation
- Summary of all entered information
- Organized sections for Personal Info and Plan
- Review prompt before final submission
- Submit button to complete the process

### Progress Tracking
- **Progress bar** fills based on current step (33%, 66%, 100%)
- **Step indicators** show:
  - Active step (highlighted with gradient)
  - Completed steps (green checkmark)
  - Upcoming steps (gray)
- Smooth transitions between states

### Navigation
- **Next button** - Validates current step before advancing
- **Back button** - Returns to previous step (hidden on first step)
- **Submit button** - Appears only on final step
- Button states update automatically based on current step

### Validation
- Name: Required, cannot be empty
- Email: Required, must be valid email format
- Plan: Required, must select one option
- Errors display below fields with red styling
- Errors clear automatically when user starts typing

### Success Screen
- Animated checkmark icon
- Success message
- "Start Over" button to reset form
- Smooth fade-in animation

## Technical Details

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **CSS3** - Modern animations and gradients
- **Responsive Grid** - Plan cards adapt to screen size
- **Fetch API** - Async form submission

### Backend
- **Express.js** - Minimal, fast server
- **JSON storage** - In-memory data persistence
- **RESTful API** - Clean endpoint design

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Customization

### Changing Plan Options
Edit the plan cards in `public/index.html` and update the `planNames` object in `public/script.js`.

### Styling
All styles are in `public/styles.css`. Key color variables:
- Primary gradient: `#667eea` to `#764ba2`
- Success color: `#4caf50`
- Error color: `#f44336`

### Adding More Steps
1. Add a new `.form-step` section in `index.html`
2. Update `totalSteps` constant in `script.js`
3. Add validation logic in `validateCurrentStep()`
4. Update progress indicators

## License
ISC
