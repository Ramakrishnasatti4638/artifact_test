// Form wizard state
let currentStep = 1;
const totalSteps = 3;

// Form data
const formData = {
  name: '',
  email: '',
  plan: ''
};

// DOM elements
const form = document.getElementById('wizardForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const formSteps = document.querySelectorAll('.form-step');
const progressSteps = document.querySelectorAll('.progress-step');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  showStep(currentStep);
  attachEventListeners();
});

// Event listeners
function attachEventListeners() {
  // Navigation buttons
  prevBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      showStep(currentStep);
    }
  });

  nextBtn.addEventListener('click', () => {
    if (validateStep(currentStep)) {
      saveStepData(currentStep);
      if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
      }
    }
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    // Check terms checkbox
    const termsCheckbox = document.getElementById('terms');
    if (!termsCheckbox.checked) {
      showError('terms', 'You must agree to the terms');
      return;
    }
    
    await submitForm();
  });

  // Real-time validation
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  
  nameInput.addEventListener('blur', () => validateField('name'));
  emailInput.addEventListener('blur', () => validateField('email'));
  
  // Clear error on input
  nameInput.addEventListener('input', () => clearError('name'));
  emailInput.addEventListener('input', () => clearError('email'));
}

// Show specific step
function showStep(step) {
  // Hide all steps
  formSteps.forEach(s => s.classList.remove('active'));
  
  // Show current step
  const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
  currentStepElement.classList.add('active');
  
  // Update progress bar
  updateProgressBar(step);
  
  // Update buttons
  updateButtons(step);
  
  // If step 3, update confirmation
  if (step === 3) {
    updateConfirmation();
  }
}

// Update progress bar
function updateProgressBar(step) {
  progressSteps.forEach((progressStep, index) => {
    const stepNumber = index + 1;
    
    if (stepNumber < step) {
      progressStep.classList.add('completed');
      progressStep.classList.remove('active');
    } else if (stepNumber === step) {
      progressStep.classList.add('active');
      progressStep.classList.remove('completed');
    } else {
      progressStep.classList.remove('active', 'completed');
    }
  });
}

// Update navigation buttons
function updateButtons(step) {
  // Previous button
  if (step === 1) {
    prevBtn.style.display = 'none';
  } else {
    prevBtn.style.display = 'block';
  }
  
  // Next vs Submit button
  if (step === totalSteps) {
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'block';
  } else {
    nextBtn.style.display = 'block';
    submitBtn.style.display = 'none';
  }
}

// Validate current step
function validateStep(step) {
  switch (step) {
    case 1:
      return validatePersonalDetails();
    case 2:
      return validatePlan();
    case 3:
      return true; // Confirmation step, no validation needed
    default:
      return true;
  }
}

// Validate personal details
function validatePersonalDetails() {
  let isValid = true;
  
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  
  // Validate name
  if (!name) {
    showError('name', 'Name is required');
    isValid = false;
  } else if (name.length < 2) {
    showError('name', 'Name must be at least 2 characters');
    isValid = false;
  } else {
    clearError('name');
  }
  
  // Validate email
  if (!email) {
    showError('email', 'Email is required');
    isValid = false;
  } else if (!isValidEmail(email)) {
    showError('email', 'Please enter a valid email address');
    isValid = false;
  } else {
    clearError('email');
  }
  
  return isValid;
}

// Validate plan selection
function validatePlan() {
  const planInputs = document.querySelectorAll('input[name="plan"]');
  const selectedPlan = Array.from(planInputs).find(input => input.checked);
  
  if (!selectedPlan) {
    showError('plan', 'Please select a plan');
    return false;
  }
  
  clearError('plan');
  return true;
}

// Validate individual field
function validateField(fieldName) {
  const field = document.getElementById(fieldName);
  const value = field.value.trim();
  
  if (fieldName === 'name') {
    if (!value) {
      showError('name', 'Name is required');
      return false;
    } else if (value.length < 2) {
      showError('name', 'Name must be at least 2 characters');
      return false;
    } else {
      clearError('name');
      return true;
    }
  }
  
  if (fieldName === 'email') {
    if (!value) {
      showError('email', 'Email is required');
      return false;
    } else if (!isValidEmail(value)) {
      showError('email', 'Please enter a valid email address');
      return false;
    } else {
      clearError('email');
      return true;
    }
  }
  
  return true;
}

// Email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Show error message
function showError(fieldName, message) {
  const errorElement = document.getElementById(`${fieldName}-error`);
  if (errorElement) {
    errorElement.textContent = message;
  }
}

// Clear error message
function clearError(fieldName) {
  const errorElement = document.getElementById(`${fieldName}-error`);
  if (errorElement) {
    errorElement.textContent = '';
  }
}

// Save step data
function saveStepData(step) {
  if (step === 1) {
    formData.name = document.getElementById('name').value.trim();
    formData.email = document.getElementById('email').value.trim();
  } else if (step === 2) {
    const planInputs = document.querySelectorAll('input[name="plan"]');
    const selectedPlan = Array.from(planInputs).find(input => input.checked);
    formData.plan = selectedPlan ? selectedPlan.value : '';
  }
}

// Update confirmation summary
function updateConfirmation() {
  document.getElementById('confirm-name').textContent = formData.name;
  document.getElementById('confirm-email').textContent = formData.email;
  document.getElementById('confirm-plan').textContent = formData.plan.charAt(0).toUpperCase() + formData.plan.slice(1);
}

// Submit form
async function submitForm() {
  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    const response = await fetch('/api/submit-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      // Show success message
      document.querySelector('.wizard-container form').style.display = 'none';
      document.querySelector('.progress-bar').style.display = 'none';
      document.querySelector('h1').style.display = 'none';
      document.getElementById('successMessage').style.display = 'block';
    } else {
      alert('Error: ' + (result.error || 'Failed to submit form'));
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  } catch (error) {
    console.error('Submission error:', error);
    alert('An error occurred while submitting the form. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  }
}
