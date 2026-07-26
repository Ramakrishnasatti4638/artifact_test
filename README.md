# 🧙 Multi-Step Form Wizard

A modern, interactive multi-step form wizard built with Express, HTML, CSS, and vanilla JavaScript. Features a beautiful UI with progress tracking, form validation, and smooth transitions.

## ✨ Features

### 3-Step Wizard Flow
- **Step 1: Personal Details** - Name and email input with validation
- **Step 2: Plan Selection** - Choose from 3 pricing plans (Basic, Pro, Enterprise)
- **Step 3: Confirmation** - Review all information before submission

### User Experience
- ✅ Visual progress bar with step indicators
- ✅ Next/Back navigation buttons
- ✅ Real-time form validation
- ✅ Responsive design (mobile & desktop)
- ✅ Smooth animations and transitions
- ✅ Success confirmation page
- ✅ "Start Over" functionality

### Backend API
- **POST /api/submit** - Submit form data with validation
- **GET /api/submissions** - Retrieve all form submissions
- In-memory data storage

## 🚀 Installation

```bash
npm install
```

## 📖 Usage

### Start the server
```bash
npm start
```

Server runs on `http://localhost:3000`

### Development mode (with auto-reload)
```bash
npm run dev
```

## 🎨 Design Features

### Progress Bar
- Dynamic step indicators (1, 2, 3)
- Active state highlighting
- Completed step checkmarks
- Progress lines between steps

### Form Validation
- Required field validation
- Email format validation
- Plan selection validation
- Real-time error messages

### Plan Cards
- Three pricing tiers with features
- "Most Popular" badge on Pro plan
- Hover effects and animations
- Click-to-select functionality

### Confirmation Page
- Clean summary of all entered data
- Review before final submission
- Edit capability via Back button

### Success Page
- Animated success icon
- Personalized confirmation message
- "Start Over" to reset the wizard

## 📁 Project Structure

```
artifact_test/
├── server.js              # Express server and API endpoints
├── package.json           # Dependencies and scripts
├── public/
│   ├── index.html        # Multi-step form HTML structure
│   ├── styles.css        # Complete styling with animations
│   └── script.js         # Form wizard logic and validation
└── README.md             # This file
```

## 🔧 API Endpoints

### Submit Form
**POST /api/submit**

Request body:
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
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
    "name": "Jane Smith",
    "email": "jane@example.com",
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
    "name": "Jane Smith",
    "email": "jane@example.com",
    "plan": "pro",
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## 🎯 Pricing Plans

### Basic - $9.99/month
- 10 GB Storage
- Basic Support
- 1 User

### Pro - $19.99/month (Most Popular)
- 100 GB Storage
- Priority Support
- 5 Users

### Enterprise - $49.99/month
- Unlimited Storage
- 24/7 Support
- Unlimited Users

## 💻 Technical Details

### Frontend
- Pure vanilla JavaScript (no frameworks)
- CSS Grid and Flexbox for layouts
- CSS animations and transitions
- Responsive design with media queries
- Form validation with custom error handling

### Backend
- Express.js server
- JSON request/response handling
- In-memory data storage
- RESTful API design

### Key JavaScript Features
- State management for wizard flow
- Step navigation logic
- Form validation functions
- Async/await for API calls
- Event delegation for plan selection
- Dynamic DOM updates

## 🎨 Color Scheme

- Primary: `#667eea` (Purple)
- Secondary: `#764ba2` (Darker Purple)
- Success: `#4caf50` (Green)
- Error: `#f44336` (Red)
- Background: Linear gradient from `#667eea` to `#764ba2`

## 📱 Responsive Design

The wizard is fully responsive and works seamlessly on:
- Desktop (800px+ width)
- Tablets (768px - 799px)
- Mobile phones (< 768px)

Mobile optimizations include:
- Stacked plan cards (single column)
- Full-width buttons
- Adjusted spacing and font sizes
- Touch-friendly interactive elements

## 🛠️ Customization

### Adding More Steps
1. Add a new step in `index.html` with `data-step="4"`
2. Update `totalSteps` in `script.js`
3. Add validation logic in `validateStep()`
4. Update progress bar HTML with new step indicator

### Changing Plans
Edit the plan cards in `index.html` and update the `planNames` object in `script.js`

### Styling
Modify `styles.css` to change colors, fonts, spacing, or animations

## 📝 License

MIT

## 🤝 Contributing

Feel free to fork, modify, and use this project for your own purposes!
