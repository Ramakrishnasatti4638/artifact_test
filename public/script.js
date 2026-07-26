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
const successMessage = document.getElementById('successMessage');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateStepDisplay();
  attachEventListeners();
});

function attachEventListeners() {
  // Navigation buttons
  prevBtn.addEventListener('click', () => navigateStep(-1));
  nextBtn.addEventListener('click', () => navigateStep(1));
  
  // Form submission
  form.addEventListener('submit', handleSubmit);

  // Input change listeners
  document.getElementById('name').addEventListener('input', (e) => {
    formData.name = e.target.value;
    clearError('name');
  });

  document.getElementById('email').addEventListener('input', (e) => {
    formData.email = e.target.value;
    clearError('email');
  });

  document.querySelectorAll('input[name="plan"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      formData.plan = e.target.value;
      clearError('plan');
    });
  });
}

function navigateStep(direction) {
  // Validate current step before proceeding forward
  if (direction === 1 && !validateStep(currentStep)) {
    return;
  }

  // Update current step
  currentStep += direction;

  // Update confirmation page if on step 3
  if (currentStep === 3) {
    updateConfirmation();
  }

  // Update display
  updateStepDisplay();
}

function validateStep(step) {
  let isValid = true;

  if (step === 1) {
    // Validate name
    const name = document.getElementById('name').value.trim();
    if (!name) {
      showError('name', 'Please enter your name');
      isValid = false;
    }

    // Validate email
    const email = document.getElementById('email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      showError('email', 'Please enter your email');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      showError('email', 'Please enter a valid email address');
      isValid = false;
    }
  }

  if (step === 2) {
    // Validate plan selection
    const selectedPlan = document.querySelector('input[name="plan"]:checked');
    if (!selectedPlan) {
      showError('plan', 'Please select a plan');
      isValid = false;
    }
  }

  return isValid;
}

function showError(fieldName, message) {
  const errorElement = document.getElementById(`${fieldName}-error`);
  const inputElement = document.getElementById(fieldName);
  
  if (errorElement) {
    errorElement.textContent = message;
  }
  
  if (inputElement) {
    inputElement.classList.add('error');
  }
}

function clearError(fieldName) {
  const errorElement = document.getElementById(`${fieldName}-error`);
  const inputElement = document.getElementById(fieldName);
  
  if (errorElement) {
    errorElement.textContent = '';
  }
  
  if (inputElement) {
    inputElement.classList.remove('error');
  }
}

function updateStepDisplay() {
  // Update form steps
  document.querySelectorAll('.form-step').forEach((step, index) => {
    step.classList.toggle('active', index + 1 === currentStep);
  });

  // Update progress bar
  document.querySelectorAll('.progress-step').forEach((step, index) => {
    const stepNumber = index + 1;
    step.classList.toggle('active', stepNumber === currentStep);
    step.classList.toggle('completed', stepNumber < currentStep);
  });

  // Update navigation buttons
  prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
  nextBtn.style.display = currentStep === totalSteps ? 'none' : 'block';
  submitBtn.style.display = currentStep === totalSteps ? 'block' : 'none';
}

function updateConfirmation() {
  document.getElementById('confirm-name').textContent = formData.name;
  document.getElementById('confirm-email').textContent = formData.email;
  document.getElementById('confirm-plan').textContent = formData.plan.charAt(0).toUpperCase() + formData.plan.slice(1);
}

async function handleSubmit(e) {
  e.preventDefault();

  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (response.ok) {
      // Hide form, show success message
      document.querySelectorAll('.form-step').forEach(step => {
        step.style.display = 'none';
      });
      document.querySelector('.form-navigation').style.display = 'none';
      document.querySelector('.progress-bar').style.display = 'none';
      
      document.getElementById('success-email').textContent = formData.email;
      successMessage.classList.add('show');
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    console.error('Submission error:', error);
    alert('An error occurred. Please try again.');
  }
}

function resetForm() {
  // Reset form data
  formData.name = '';
  formData.email = '';
  formData.plan = '';

  // Reset form inputs
  form.reset();

  // Reset to step 1
  currentStep = 1;

  // Show form elements
  document.querySelector('.progress-bar').style.display = 'flex';
  document.querySelector('.form-navigation').style.display = 'flex';
  successMessage.classList.remove('show');

  // Update display
  updateStepDisplay();

  // Clear any errors
  clearError('name');
  clearError('email');
  clearError('plan');
}
