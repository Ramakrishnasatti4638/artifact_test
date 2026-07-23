# 📝 Multi-Step Form Wizard

A responsive multi-step form wizard built with Express.js backend and vanilla HTML/CSS/JavaScript frontend. Features include a dynamic progress bar, form validation, and smooth transitions between steps.

## Features

### Frontend
- **3-Step Form Process**:
  - Step 1: Personal Details (Name, Email)
  - Step 2: Plan Selection (Basic, Pro, Enterprise)
  - Step 3: Confirmation Summary
- **Visual Progress Bar** with step indicators and connecting lines
- **Form Validation** with real-time feedback
- **Responsive Design** - works on desktop, tablet, and mobile
- **Smooth Animations** between steps
- **Interactive Plan Cards** with hover effects
- **Navigation Controls** - Next/Back/Submit buttons
- **Success Confirmation** screen after submission

### Backend API
- **POST /api/submit** - Submit form data
- **GET /api/submissions** - Retrieve all form submissions
- In-memory data storage
- JSON request/response handling
- Form validation and error handling

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
├── server.js           # Express server with API endpoints
├── package.json        # Dependencies and scripts
├── public/
│   ├── index.html     # Main HTML structure
│   ├── styles.css     # Styling and animations
│   └── script.js      # Form wizard logic and validation
└── README.md          # Documentation
```

## Form Workflow

### Step 1: Personal Details
- **Name** (required, minimum 2 characters)
- **Email** (required, valid email format)
- Real-time validation with error messages
- "Next" button to proceed

### Step 2: Choose Your Plan
Three plan options to choose from:

1. **Basic Plan** - $9.99/month
   - 5 Projects
   - 10GB Storage
   - Email Support

2. **Pro Plan** - $19.99/month
   - 20 Projects
   - 50GB Storage
   - Priority Support
   - Advanced Features

3. **Enterprise Plan** - $49.99/month
   - Unlimited Projects
   - 500GB Storage
   - 24/7 Support
   - All Features
   - Custom Integrations

### Step 3: Confirmation
- Review all entered information
- Personal details summary
- Selected plan and pricing
- Submit button to complete registration

### Success Screen
- Confirmation message
- Visual success indicator
- Option to submit another form

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

Success response (200):
```json
{
  "success": true,
  "message": "Form submitted successfully!",
  "data": {
    "id": 1234567890,
    "name": "John Doe",
    "email": "john@example.com",
    "plan": "pro",
    "submittedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

Error response (400):
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
    "submittedAt": "2024-01-01T12:00:00.000Z"
  }
]
```

## Features Details

### Progress Bar
- Visual representation of form completion
- Three distinct steps with circle indicators
- Connecting lines that fill as you progress
- Active step highlighting
- Completed steps marked with green checkmarks

### Form Validation
- **Real-time validation** as user types
- **Error messages** displayed below fields
- **Visual feedback** with colored borders
- **Step-level validation** prevents progression with invalid data
- Email format validation using regex
- Required field checks

### Responsive Design
- Mobile-first approach
- Breakpoints for tablets and phones
- Stack layout on small screens
- Touch-friendly buttons and inputs
- Optimized spacing and typography

### User Experience
- Smooth fade-in animations between steps
- Hover effects on plan cards
- Visual feedback for selected plan
- Disabled submit button during processing
- Success animation after submission
- Auto-prompt to submit another form

## Technology Stack

- **Backend**: Express.js 4.18+
- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Pure CSS3 with animations
- **Data Storage**: In-memory (runtime only)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Customization

### Changing Plan Options
Edit the plan cards in `public/index.html` (lines 59-105) and update pricing in `public/script.js` (lines 12-16).

### Modifying Validation Rules
Update validation functions in `public/script.js`:
- `validateName()` - Name validation logic
- `validateEmail()` - Email validation logic

### Styling
All styles are in `public/styles.css`. Key sections:
- Progress bar styles (lines 30-96)
- Form step animations (lines 98-131)
- Plan card styling (lines 162-239)
- Button styles (lines 361-395)

## License

MIT
