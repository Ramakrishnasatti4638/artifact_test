// Form wizard state
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
const progressBar = document.getElementById('progressBar');
const steps = document.querySelectorAll('.form-step');
const stepIndicators = document.querySelectorAll('.step-indicator');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  showStep(currentStep);
  
  // Event listeners
  nextBtn.addEventListener('click', nextStep);
  prevBtn.addEventListener('click', prevStep);
  form.addEventListener('submit', handleSubmit);
  
  // Real-time validation
  document.getElementById('name').addEventListener('input', clearError);
  document.getElementById('email').addEventListener('input', clearError);
  
  // Plan selection
  const planInputs = document.querySelectorAll('input[name="plan"]');
  planInputs.forEach(input => {
    input.addEventListener('change', () => {
      clearError();
      // Add visual feedback
      document.querySelectorAll('.plan-card').forEach(card => {
        card.style.borderColor = '#e0e0e0';
        card.style.transform = 'translateY(0)';
      });
      const selectedCard = input.closest('.plan-card');
      selectedCard.style.borderColor = '#667eea';
      selectedCard.style.transform = 'translateY(-4px)';
    });
  });
});

// Show specific step
function showStep(step) {
  // Hide all steps
  steps.forEach(s => s.classList.remove('active'));
  stepIndicators.forEach(s => {
    s.classList.remove('active');
    if (parseInt(s.dataset.step) < step) {
      s.classList.add('completed');
    } else {
      s.classList.remove('completed');
    }
  });
  
  // Show current step
  const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
  const currentIndicator = document.querySelector(`.step-indicator[data-step="${step}"]`);
  
  if (currentStepElement) currentStepElement.classList.add('active');
  if (currentIndicator) currentIndicator.classList.add('active');
  
  // Update progress bar
  const progress = (step / totalSteps) * 100;
  progressBar.style.width = `${progress}%`;
  
  // Update navigation buttons
  updateNavigationButtons();
}

// Update button visibility
function updateNavigationButtons() {
  // Show/hide back button
  if (currentStep === 1) {
    prevBtn.style.display = 'none';
  } else {
    prevBtn.style.display = 'block';
  }
  
  // Show/hide next and submit buttons
  if (currentStep === totalSteps) {
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'block';
  } else {
    nextBtn.style.display = 'block';
    submitBtn.style.display = 'none';
  }
}

// Go to next step
function nextStep() {
  if (validateStep(currentStep)) {
    saveStepData(currentStep);
    
    if (currentStep < totalSteps) {
      currentStep++;
      
      // If moving to confirmation step, update summary
      if (currentStep === 3) {
        updateConfirmationSummary();
      }
      
      showStep(currentStep);
    }
  }
}

// Go to previous step
function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
  }
}

// Validate current step
function validateStep(step) {
  clearAllErrors();
  
  switch(step) {
    case 1:
      return validatePersonalDetails();
    case 2:
      return validatePreferences();
    case 3:
      return true;
    default:
      return false;
  }
}

// Validate personal details
function validatePersonalDetails() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  let isValid = true;
  
  if (!name) {
    showError('nameError', 'Please enter your name');
    document.getElementById('name').classList.add('error');
    isValid = false;
  } else if (name.length < 2) {
    showError('nameError', 'Name must be at least 2 characters');
    document.getElementById('name').classList.add('error');
    isValid = false;
  }
  
  if (!email) {
    showError('emailError', 'Please enter your email');
    document.getElementById('email').classList.add('error');
    isValid = false;
  } else if (!isValidEmail(email)) {
    showError('emailError', 'Please enter a valid email address');
    document.getElementById('email').classList.add('error');
    isValid = false;
  }
  
  return isValid;
}

// Validate preferences
function validatePreferences() {
  const plan = document.querySelector('input[name="plan"]:checked');
  
  if (!plan) {
    showError('planError', 'Please select a plan');
    return false;
  }
  
  return true;
}

// Email validation helper
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Save step data
function saveStepData(step) {
  switch(step) {
    case 1:
      formData.name = document.getElementById('name').value.trim();
      formData.email = document.getElementById('email').value.trim();
      break;
    case 2:
      const selectedPlan = document.querySelector('input[name="plan"]:checked');
      formData.plan = selectedPlan ? selectedPlan.value : '';
      break;
  }
}

// Update confirmation summary
function updateConfirmationSummary() {
  document.getElementById('summaryName').textContent = formData.name;
  document.getElementById('summaryEmail').textContent = formData.email;
  
  // Capitalize plan name
  const planName = formData.plan.charAt(0).toUpperCase() + formData.plan.slice(1);
  document.getElementById('summaryPlan').textContent = planName;
}

// Handle form submission
async function handleSubmit(e) {
  e.preventDefault();
  
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
    
    if (response.ok) {
      // Show success message
      document.querySelector('.confirmation-summary').style.display = 'none';
      document.getElementById('successMessage').style.display = 'block';
      document.querySelector('.form-navigation').style.display = 'none';
      
      // Reset form after 3 seconds
      setTimeout(() => {
        resetForm();
      }, 3000);
    } else {
      alert('Error: ' + (result.error || 'Something went wrong'));
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  } catch (error) {
    console.error('Submission error:', error);
    alert('Failed to submit form. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  }
}

// Reset form
function resetForm() {
  // Reset form data
  formData.name = '';
  formData.email = '';
  formData.plan = '';
  
  // Reset form fields
  form.reset();
  
  // Reset visual state
  document.querySelector('.confirmation-summary').style.display = 'block';
  document.getElementById('successMessage').style.display = 'none';
  document.querySelector('.form-navigation').style.display = 'flex';
  
  // Reset plan cards
  document.querySelectorAll('.plan-card').forEach(card => {
    card.style.borderColor = '#e0e0e0';
    card.style.transform = 'translateY(0)';
  });
  
  // Go back to step 1
  currentStep = 1;
  showStep(currentStep);
  
  // Re-enable submit button
  submitBtn.disabled = false;
  submitBtn.textContent = 'Submit';
}

// Error handling
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
  }
}

function clearError() {
  const errorElements = document.querySelectorAll('.error-message');
  errorElements.forEach(el => el.textContent = '');
  
  const inputs = document.querySelectorAll('input.error');
  inputs.forEach(input => input.classList.remove('error'));
}

function clearAllErrors() {
  clearError();
}
