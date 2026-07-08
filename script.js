// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        eyeIcon.textContent = '👁️';
    }
}

// Validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password length
function validatePassword(password) {
    return password.length >= 6;
}

// Clear error message
function clearError(fieldId) {
    const errorElement = document.getElementById(fieldId + 'Error');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

// Show error message
function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();

    // Get form values
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.querySelector('input[name="remember"]').checked;

    // Clear previous errors
    clearError('email');
    clearError('password');

    let isValid = true;

    // Validate email
    if (!email) {
        showError('email', 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('email', 'Please enter a valid email');
        isValid = false;
    }

    // Validate password
    if (!password) {
        showError('password', 'Password is required');
        isValid = false;
    } else if (!validatePassword(password)) {
        showError('password', 'Password must be at least 6 characters');
        isValid = false;
    }

    // If validation passes, show success message
    if (isValid) {
        showSuccessMessage(`Welcome back! Logged in as ${email}`);
        
        // Store login data if remember me is checked
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        // Simulate successful login
        setTimeout(() => {
            alert(`Login successful!\nEmail: ${email}\nRemember Me: ${rememberMe}`);
            document.getElementById('loginForm').reset();
        }, 1500);
    }
}

// Show success message
function showSuccessMessage(message) {
    const successElement = document.getElementById('successMessage');
    successElement.textContent = message;
    successElement.classList.add('show');

    setTimeout(() => {
        successElement.classList.remove('show');
    }, 3000);
}

// Load remembered email on page load
document.addEventListener('DOMContentLoaded', () => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.querySelector('input[name="remember"]').checked = true;
    }

    // Real-time email validation
    document.getElementById('email').addEventListener('blur', () => {
        const email = document.getElementById('email').value.trim();
        if (email && !validateEmail(email)) {
            showError('email', 'Please enter a valid email');
        } else {
            clearError('email');
        }
    });

    // Real-time password validation
    document.getElementById('password').addEventListener('blur', () => {
        const password = document.getElementById('password').value;
        if (password && !validatePassword(password)) {
            showError('password', 'Password must be at least 6 characters');
        } else {
            clearError('password');
        }
    });
});
