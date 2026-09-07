# React Sample App

A modern React web application showcasing interactive components and state management.

## Features

- **Counter Component**: Increment, decrement, and reset a counter
- **Todo List Component**: Add, complete, and delete tasks
- **Tab Navigation**: Switch between different components
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean interface with gradient backgrounds and smooth animations

## Project Structure

```
src/
├── components/
│   ├── Counter.js          # Counter component with state
│   ├── Counter.css         # Counter styling
│   ├── TodoList.js         # Todo list component
│   └── TodoList.css        # Todo list styling
├── App.js                  # Main application component
├── App.css                 # Application styling
├── index.js                # React entry point
└── index.css               # Global styling
public/
└── index.html              # HTML template
```

## Getting Started

### Installation

```bash
npm install
```

### Running the App

```bash
npm start
```

The app will open at `http://localhost:3000` in your browser.

### Building for Production

```bash
npm run build
```

## Technologies Used

- **React 18**: JavaScript library for building user interfaces
- **CSS3**: Modern styling with gradients and animations
- **React Hooks**: useState for state management

## Components

### Counter
- Simple state management using useState
- Three buttons for incrementing, decrementing, and resetting
- Displays the current count value

### Todo List
- Add new tasks via input field
- Mark tasks as completed with checkboxes
- Delete individual tasks
- Displays task completion statistics
- Keyboard support (Enter key to add tasks)

## License

This project is open source and available for educational purposes.
