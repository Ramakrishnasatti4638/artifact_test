# Multi-Step Form Wizard

A modern, responsive multi-step form wizard built with Express, HTML, CSS, and vanilla JavaScript. Features a beautiful UI with progress tracking, form validation, and smooth animations.

## Features

### 🎨 Frontend
- **3-Step Wizard Flow**
  - Step 1: Personal Details (name, email)
  - Step 2: Plan Selection (Basic, Pro, Enterprise)
  - Step 3: Confirmation Summary
- **Interactive Progress Bar** - Visual step indicator with completion states
- **Form Validation** - Real-time validation with error messages
- **Smooth Animations** - Fade-in transitions between steps
- **Responsive Design** - Works perfectly on mobile and desktop
- **Modern UI** - Clean, professional design with gradient background

### ⚙️ Backend
- **Express Server** - Lightweight Node.js backend
- **REST API** - Clean API endpoints for form submission
- **Data Storage** - In-memory storage for form submissions
- **Validation** - Server-side validation for all fields

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
├── server.js           # Express server and API endpoints
├── package.json        # Project dependencies
├── public/             # Frontend static files
│   ├── index.html      # Main HTML structure
│   ├── styles.css      # Responsive CSS styling
│   └── script.js       # Form wizard logic
└── README.md           # Documentation
```

## How It Works

### Step Navigation
1. **Next Button**: Validates current step before advancing
2. **Back Button**: Returns to previous step (hidden on step 1)
3. **Submit Button**: Only appears on final step

### Validation Rules
- **Name**: Required, cannot be empty
- **Email**: Required, must be valid email format
- **Plan**: Required, must select one of three options

### User Flow
1. User enters personal details (name, email)
2. Validates and proceeds to plan selection
3. Chooses from Basic ($9.99), Pro ($19.99), or Enterprise ($49.99)
4. Reviews all information on confirmation page
5. Submits form and sees success message
6. Can reset and start over

## Features Breakdown

### Progress Bar
- Visual representation of current step
- Active step highlighted in purple
- Completed steps marked in green
- Step labels for clarity

### Plan Selection
- Three visually distinct plan cards
- "Most Popular" badge on Pro plan
- Hover effects for better UX
- Radio button selection with full card click area

### Confirmation Page
- Organized summary of all entered data
- Clear section headers
- Easy-to-read layout
- Final review before submission

### Success State
- Animated checkmark icon
- Confirmation message with user's email
- "Start Over" button to reset form

## Styling Highlights

- **Gradient Background**: Purple gradient for modern look
- **Card Design**: Clean white card with rounded corners
- **Color Scheme**: Purple (#667eea) primary, green (#4caf50) success
- **Responsive**: Mobile-first design with breakpoints
- **Animations**: Smooth fade-in transitions between steps

## Technologies Used

- **Backend**: Express.js 4.18.2
- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with Flexbox and Grid
- **Development**: Nodemon for auto-reload

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## License

MIT
