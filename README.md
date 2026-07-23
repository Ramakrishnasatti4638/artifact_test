# 🧙‍♂️ Multi-Step Form Wizard

A modern, responsive multi-step form wizard built with Express.js backend and vanilla HTML/CSS/JavaScript frontend. Features include a dynamic progress bar, form validation, and a clean user interface.

## Features

### Frontend
- **3-Step Wizard Flow**
  - Step 1: Personal Details (Name & Email)
  - Step 2: Plan Selection (Basic, Pro, Enterprise)
  - Step 3: Confirmation Summary
  
- **Interactive UI Elements**
  - Animated progress bar showing completion percentage
  - Visual step indicators with active/completed states
  - Next/Back navigation buttons
  - Real-time form validation with error messages
  - Success confirmation screen
  
- **Design Highlights**
  - Modern gradient background and card design
  - Responsive layout (mobile-friendly)
  - Smooth animations and transitions
  - Interactive plan cards with hover effects
  - "Most Popular" badge on recommended plan

### Backend
- **Express.js Server**
  - REST API for form submission
  - In-memory storage for submissions
  - JSON request/response handling
  - Static file serving

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
form-wizard/
├── server.js              # Express backend server
├── package.json           # Project dependencies
├── public/
│   ├── index.html        # Main HTML structure
│   ├── style.css         # Styles and animations
│   └── script.js         # Form wizard logic
└── README.md
```

## How It Works

### Step 1: Personal Details
Users enter their full name and email address. The form validates:
- Name is required (minimum 2 characters)
- Email is required and must be valid format

### Step 2: Plan Selection
Users choose from three pricing plans:
- **Basic**: $9.99/month - 5 Projects, 10 GB Storage, Email Support
- **Pro**: $19.99/month - 20 Projects, 50 GB Storage, Priority Support, Analytics (Most Popular)
- **Enterprise**: $49.99/month - Unlimited Projects, 500 GB Storage, 24/7 Support, Custom Features

### Step 3: Confirmation
Displays a summary of entered information:
- Personal details (name and email)
- Selected plan and pricing

Users can navigate back to edit or submit the form.

## API Endpoints

### Submit Form Data
**POST /api/submit**

Request body:
```json
{
  "personalDetails": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "preferences": {
    "plan": "pro"
  }
}
```

Response (200):
```json
{
  "success": true,
  "message": "Form submitted successfully!",
  "id": 1234567890
}
```

### Get All Submissions
**GET /api/submissions**

Response (200):
```json
[
  {
    "id": 1234567890,
    "personalDetails": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "preferences": {
      "plan": "pro"
    },
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## Technical Details

### Frontend Implementation
- **Vanilla JavaScript**: No frameworks required
- **State Management**: Client-side form data object
- **Validation**: Real-time and on-submit validation
- **Progressive Enhancement**: Works without JavaScript (basic functionality)

### CSS Features
- CSS Grid for responsive plan cards
- CSS animations (fadeIn, scaleIn)
- Linear gradients for modern look
- Media queries for mobile responsiveness
- Custom progress bar with animated fill

### JavaScript Features
- Step-by-step navigation logic
- Form validation with error handling
- Dynamic content population
- Async/await for API calls
- Event delegation for efficiency

## Customization

### Adding More Steps
1. Add HTML for new step in `index.html`
2. Update `totalSteps` variable in `script.js`
3. Add validation logic in `validateCurrentStep()`
4. Update progress bar calculation

### Changing Plans
Edit the plan cards in `index.html` and update the `planPrices` object in `script.js`.

### Styling
Modify `style.css`:
- Change gradient colors (`.wizard-container`, `.btn-primary`)
- Adjust spacing and sizing
- Update responsive breakpoints

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License
MIT
