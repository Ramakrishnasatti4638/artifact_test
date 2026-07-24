// State management
let currentStep = 1;
const totalSteps = 3;

// Form data
const formData = {
    name: '',
    email: '',
    plan: ''
};

// DOM Elements
const form = document.getElementById('wizardForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const formSteps = document.querySelectorAll('.form-step');
const progressSteps = document.querySelectorAll('.progress-step');
const progressLines = document.querySelectorAll('.progress-line');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    attachEventListeners();
});

// Event Listeners
function attachEventListeners() {
    nextBtn.addEventListener('click', handleNext);
    prevBtn.addEventListener('click', handlePrev);
    form.addEventListener('submit', handleSubmit);

    // Real-time validation
    document.getElementById('name').addEventListener('input', clearError);
    document.getElementById('email').addEventListener('input', clearError);
    
    // Plan selection
    const planInputs = document.querySelectorAll('input[name="plan"]');
    planInputs.forEach(input => {
        input.addEventListener('change', () => {
            formData.plan = input.value;
            clearError({ target: input });
        });
    });
}

// Navigation Handlers
function handleNext() {
    if (validateStep(currentStep)) {
        saveStepData(currentStep);
        currentStep++;
        updateUI();
        
        // Update confirmation if on step 3
        if (currentStep === 3) {
            updateConfirmation();
        }
    }
}

function handlePrev() {
    currentStep--;
    updateUI();
}

// Form Submission
async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
        return;
    }

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            showSuccess();
        } else {
            alert(result.message || 'Submission failed. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
    } catch (error) {
        console.error('Submission error:', error);
        alert('An error occurred. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
    }
}

// Validation
function validateStep(step) {
    clearAllErrors();
    
    if (step === 1) {
        return validatePersonalDetails();
    } else if (step === 2) {
        return validatePlan();
    }
    
    return true;
}

function validatePersonalDetails() {
    let isValid = true;
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');

    // Name validation
    if (!nameInput.value.trim()) {
        showError('name', 'Name is required');
        isValid = false;
    } else if (nameInput.value.trim().length < 2) {
        showError('name', 'Name must be at least 2 characters');
        isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim()) {
        showError('email', 'Email is required');
        isValid = false;
    } else if (!emailRegex.test(emailInput.value)) {
        showError('email', 'Please enter a valid email address');
        isValid = false;
    }

    return isValid;
}

function validatePlan() {
    const selectedPlan = document.querySelector('input[name="plan"]:checked');
    
    if (!selectedPlan) {
        showError('plan', 'Please select a plan');
        return false;
    }
    
    return true;
}

// Error Handling
function showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.textContent = message;
    }
    
    if (inputElement) {
        inputElement.classList.add('error');
    }
}

function clearError(e) {
    const input = e.target;
    const fieldId = input.id || input.name;
    const errorElement = document.getElementById(`${fieldId}-error`);
    
    if (errorElement) {
        errorElement.textContent = '';
    }
    
    input.classList.remove('error');
}

function clearAllErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => error.textContent = '');
    
    const errorInputs = document.querySelectorAll('.error');
    errorInputs.forEach(input => input.classList.remove('error'));
}

// Data Management
function saveStepData(step) {
    if (step === 1) {
        formData.name = document.getElementById('name').value.trim();
        formData.email = document.getElementById('email').value.trim();
    } else if (step === 2) {
        const selectedPlan = document.querySelector('input[name="plan"]:checked');
        formData.plan = selectedPlan ? selectedPlan.value : '';
    }
}

function updateConfirmation() {
    document.getElementById('confirm-name').textContent = formData.name;
    document.getElementById('confirm-email').textContent = formData.email;
    
    // Format plan name
    const planNames = {
        'basic': 'Basic - $9/month',
        'pro': 'Pro - $29/month',
        'enterprise': 'Enterprise - $99/month'
    };
    document.getElementById('confirm-plan').textContent = planNames[formData.plan] || formData.plan;
}

// UI Updates
function updateUI() {
    // Update form steps visibility
    formSteps.forEach((step, index) => {
        step.classList.toggle('active', index === currentStep - 1);
    });

    // Update progress bar
    progressSteps.forEach((step, index) => {
        if (index < currentStep - 1) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (index === currentStep - 1) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });

    // Update progress lines
    progressLines.forEach((line, index) => {
        if (index < currentStep - 1) {
            line.classList.add('completed');
        } else {
            line.classList.remove('completed');
        }
    });

    // Update button visibility
    prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
    nextBtn.style.display = currentStep === totalSteps ? 'none' : 'block';
    submitBtn.style.display = currentStep === totalSteps ? 'block' : 'none';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showSuccess() {
    document.querySelector('.confirmation-box').style.display = 'none';
    document.getElementById('success-message').classList.add('show');
    submitBtn.style.display = 'none';
    prevBtn.style.display = 'none';

    // Mark all progress steps as completed
    progressSteps.forEach(step => {
        step.classList.add('completed');
        step.classList.remove('active');
    });

    progressLines.forEach(line => {
        line.classList.add('completed');
    });
}
