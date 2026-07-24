# Multi-Step Form Wizard

A clean and responsive multi-step form wizard built with Express, HTML, CSS, and vanilla JavaScript. Features a visual progress bar, session-based data persistence, and smooth step transitions.

## Features

### 3-Step Registration Flow
1. **Personal Details** - Name and email input with validation
2. **Choose Plan** - Select from 3 subscription plans (Basic, Pro, Enterprise)
3. **Confirmation** - Review and confirm all entered information

### UI/UX Features
- **Visual Progress Bar** - Shows current step with completed/active/pending states
- **Session Persistence** - Form data saved to server session between steps
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Form Validation** - Client and server-side validation with error messages
- **Smooth Animations** - Fade-in transitions between steps
- **Navigation Controls** - Next/Back buttons with contextual visibility
- **Plan Selection** - Interactive card-based plan selection with visual feedback

### Backend Features
- Express server with session management
- RESTful API endpoints for each step
- Session-based data persistence
- Input validation on all steps
- Form submission endpoint

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

## API Endpoints

### GET /api/form-data
Retrieves current session's form data

**Response:**
```json
{
  "step1": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "step2": {
    "plan": "pro"
  },
  "currentStep": 2
}
```

### POST /api/step1
Save personal details (Step 1)

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "currentStep": 2
}
```

### POST /api/step2
Save plan selection (Step 2)

**Request:**
```json
{
  "plan": "pro"
}
```

**Response:**
```json
{
  "success": true,
  "currentStep": 3
}
```

### POST /api/submit
Submit the complete form

**Response:**
```json
{
  "success": true,
  "message": "Form submitted successfully!",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "plan": "pro",
    "submittedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### POST /api/reset
Reset form session and start over

**Response:**
```json
{
  "success": true
}
```

## Project Structure

```
/
├── server.js           # Express server with session handling
├── package.json        # Dependencies and scripts
├── public/
│   ├── index.html     # Main HTML structure
│   ├── styles.css     # Complete styling with animations
│   └── script.js      # Client-side form logic
└── README.md          # This file
```

## Technologies Used

- **Backend**: Express.js, express-session
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Session Storage**: In-memory session storage (express-session)
- **Styling**: Pure CSS with custom animations and responsive grid layout

## Features Breakdown

### Progress Bar
- 3 circular step indicators
- Active step highlighted in purple
- Completed steps shown in green with checkmark
- Connecting lines between steps
- Responsive labels

### Step 1: Personal Details
- Name input field
- Email input field with validation
- Required field validation
- Email format validation

### Step 2: Choose Plan
- 3 plan cards (Basic, Pro, Enterprise)
- Radio button selection with visual feedback
- "Popular" badge on Pro plan
- Feature lists for each plan
- Hover effects and selected state styling

### Step 3: Confirmation
- Summary of personal details
- Selected plan with pricing
- Submit button to complete registration
- Success message with animation after submission
- Start Over button after submission

### Navigation
- Back button (hidden on Step 1)
- Next button (validates current step)
- Submit button (only on Step 3)
- Smooth step transitions
- Error messages for validation failures

## Customization

### Modify Plans
Edit the plan cards in `public/index.html` (Step 2 section) and update pricing in `public/script.js`:

```javascript
const planPricing = {
    basic: '$9.99/month',
    pro: '$19.99/month',
    enterprise: '$49.99/month'
};
```

### Change Colors
Update the CSS color scheme in `public/styles.css`:
- Primary color: `#667eea`
- Secondary color: `#764ba2`
- Success color: `#4caf50`

### Add More Steps
1. Add new form step HTML in `index.html`
2. Update `totalSteps` in `script.js`
3. Add progress bar step in HTML
4. Create corresponding API endpoint in `server.js`
5. Add validation logic in `validateAndSaveStep()`

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT
