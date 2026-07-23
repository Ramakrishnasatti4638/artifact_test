// Form wizard state
let currentStep = 1;
const totalSteps = 3;

// Form data storage
const formData = {
  personalDetails: {},
  preferences: {}
};

// DOM elements
const form = document.getElementById('wizardForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const progressFill = document.getElementById('progressFill');
const wizardContainer = document.querySelector('.wizard-container form');
const successMessage = document.getElementById('successMessage');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateUI();
  attachEventListeners();
});

// Event listeners
function attachEventListeners() {
  nextBtn.addEventListener('click', handleNext);
  prevBtn.addEventListener('click', handlePrevious);
  form.addEventListener('submit', handleSubmit);
  
  // Real-time validation
  document.getElementById('name').addEventListener('input', () => clearError('nameError'));
  document.getElementById('email').addEventListener('input', () => clearError('emailError'));
  
  // Plan selection
  const planInputs = document.querySelectorAll('input[name="plan"]');
  planInputs.forEach(input => {
    input.addEventListener('change', () => {
      clearError('planError');
      // Highlight selected plan
      document.querySelectorAll('.plan-card').forEach(card => {
        card.style.borderColor = '#e0e0e0';
      });
      input.closest('.plan-card').style.borderColor = '#667eea';
    });
  });
}

// Handle Next button
function handleNext() {
  if (validateCurrentStep()) {
    saveCurrentStepData();
    
    if (currentStep < totalSteps) {
      currentStep++;
      
      // If moving to step 3, populate confirmation
      if (currentStep === 3) {
        populateConfirmation();
      }
      
      updateUI();
    }
  }
}

// Handle Previous button
function handlePrevious() {
  if (currentStep > 1) {
    currentStep--;
    updateUI();
  }
}

// Handle form submission
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
    
    if (result.success) {
      // Hide form and show success message
      wizardContainer.style.display = 'none';
      document.querySelector('.progress-container').style.display = 'none';
      successMessage.style.display = 'block';
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    alert('An error occurred while submitting the form. Please try again.');
  }
}

// Validate current step
function validateCurrentStep() {
  clearAllErrors();
  
  switch (currentStep) {
    case 1:
      return validatePersonalDetails();
    case 2:
      return validatePreferences();
    case 3:
      return true; // Confirmation page doesn't need validation
    default:
      return false;
  }
}

// Validate Step 1: Personal Details
function validatePersonalDetails() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  let isValid = true;
  
  if (!name) {
    showError('nameError', 'Name is required');
    isValid = false;
  } else if (name.length < 2) {
    showError('nameError', 'Name must be at least 2 characters');
    isValid = false;
  }
  
  if (!email) {
    showError('emailError', 'Email is required');
    isValid = false;
  } else if (!isValidEmail(email)) {
    showError('emailError', 'Please enter a valid email address');
    isValid = false;
  }
  
  return isValid;
}

// Validate Step 2: Preferences
function validatePreferences() {
  const selectedPlan = document.querySelector('input[name="plan"]:checked');
  
  if (!selectedPlan) {
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

// Save current step data
function saveCurrentStepData() {
  switch (currentStep) {
    case 1:
      formData.personalDetails = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim()
      };
      break;
    case 2:
      const selectedPlan = document.querySelector('input[name="plan"]:checked');
      formData.preferences = {
        plan: selectedPlan ? selectedPlan.value : null
      };
      break;
  }
}

// Populate confirmation page
function populateConfirmation() {
  // Personal details
  document.getElementById('summaryName').textContent = formData.personalDetails.name;
  document.getElementById('summaryEmail').textContent = formData.personalDetails.email;
  
  // Plan details
  const planName = formData.preferences.plan;
  const planPrices = {
    'basic': '$9.99/month',
    'pro': '$19.99/month',
    'enterprise': '$49.99/month'
  };
  
  document.getElementById('summaryPlan').textContent = 
    planName.charAt(0).toUpperCase() + planName.slice(1);
  document.getElementById('summaryPrice').textContent = planPrices[planName];
}

// Update UI based on current step
function updateUI() {
  // Update form steps visibility
  document.querySelectorAll('.form-step').forEach((step, index) => {
    step.classList.toggle('active', index + 1 === currentStep);
  });
  
  // Update progress bar
  const progressPercent = (currentStep / totalSteps) * 100;
  progressFill.style.width = `${progressPercent}%`;
  
  // Update progress steps
  document.querySelectorAll('.progress-step').forEach((step, index) => {
    const stepNumber = index + 1;
    step.classList.toggle('active', stepNumber === currentStep);
    step.classList.toggle('completed', stepNumber < currentStep);
  });
  
  // Update button visibility
  prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
  nextBtn.style.display = currentStep === totalSteps ? 'none' : 'block';
  submitBtn.style.display = currentStep === totalSteps ? 'block' : 'none';
}

// Error handling
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
  }
}

function clearError(elementId) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = '';
  }
}

function clearAllErrors() {
  document.querySelectorAll('.error-message').forEach(element => {
    element.textContent = '';
  });
}
