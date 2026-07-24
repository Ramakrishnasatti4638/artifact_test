# 📋 Multi-Step Form Wizard

A modern, responsive multi-step form wizard built with Express.js and vanilla JavaScript. Features an animated progress bar, step indicators, session-based data persistence, and a clean, user-friendly interface.

## Features

### Frontend
- **3-Step Form Flow**
  - Step 1: Personal Details (name, email)
  - Step 2: Plan Selection (Basic, Pro, Enterprise)
  - Step 3: Confirmation Summary
- **Visual Progress Tracking**
  - Animated progress bar showing completion percentage
  - Step indicators with active/completed states
  - Smooth transitions between steps
- **Intuitive Navigation**
  - Next/Back buttons for easy navigation
  - Form validation before proceeding
  - Submit button on final step
- **Responsive Design**
  - Mobile-first approach
  - Clean, modern UI with gradient backgrounds
  - Card-based plan selection
  - Optimized for all screen sizes

### Backend
- **Session Management** - Server-side session storage for form data
- **RESTful API Endpoints**
  - `POST /api/save-step` - Save data for current step
  - `GET /api/form-data` - Retrieve all saved form data
  - `POST /api/submit` - Submit completed form
  - `POST /api/reset` - Clear form session data
- **Data Persistence** - Form data persists across page refreshes

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
/home/user/artifact_test/
├── server.js           # Express server with session management
├── package.json        # Project dependencies
├── public/
│   ├── index.html      # Main HTML structure
│   ├── styles.css      # Responsive CSS styling
│   └── script.js       # Form wizard logic
└── README.md          # Project documentation
```

## How It Works

### Step 1: Personal Details
- User enters name and email
- Required field validation
- Email format validation
- Data saved to session on "Next"

### Step 2: Choose Plan
- Three plan options displayed as cards:
  - **Basic** ($9/month) - 5 Projects, 10 GB Storage, Email Support
  - **Pro** ($29/month) - Unlimited Projects, 100 GB Storage, Priority Support, Advanced Analytics
  - **Enterprise** ($99/month) - Unlimited Everything, 1 TB Storage, 24/7 Support, Custom Integrations
- Visual feedback on selection
- Hover effects and smooth transitions
- Data saved to session on "Next"

### Step 3: Confirmation
- Summary of all entered information
- Review personal details and selected plan
- Submit button to complete the form
- Success message displayed after submission
- Automatic reset after 5 seconds

## API Documentation

### Save Step Data
**POST /api/save-step**

Request body:
```json
{
  "step": 1,
  "data": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

Response:
```json
{
  "success": true,
  "message": "Step data saved"
}
```

### Get Form Data
**GET /api/form-data**

Response:
```json
{
  "step1": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "step2": {
    "plan": "pro"
  }
}
```

### Submit Form
**POST /api/submit**

Response:
```json
{
  "success": true,
  "message": "Form submitted successfully!",
  "data": {
    "step1": { "name": "John Doe", "email": "john@example.com" },
    "step2": { "plan": "pro" }
  }
}
```

### Reset Form
**POST /api/reset**

Response:
```json
{
  "success": true,
  "message": "Form reset"
}
```

## Technical Details

### Session Management
- Express-session middleware for server-side storage
- Session data persists until browser closes or manual reset
- Secure cookie configuration

### Validation
- Client-side validation before step progression
- Required field checks
- Email format validation (regex)
- Radio button group validation

### UI/UX Features
- Smooth fade-in animations between steps
- Progress bar updates in real-time
- Step indicators show completed/active/pending states
- Responsive grid layout for plan cards
- Success message with icon animation
- Automatic form reset after submission

### Styling
- Modern gradient backgrounds
- Card-based layouts with hover effects
- Consistent color scheme (purple/violet theme)
- Mobile-responsive breakpoints
- Accessible form elements with proper labels

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

Potential improvements:
- Database integration for persistent storage
- Email confirmation after submission
- File upload support
- Multi-language support
- Analytics tracking
- Form field autocomplete
- Password strength indicator
- Payment integration for plan selection

## License

MIT
