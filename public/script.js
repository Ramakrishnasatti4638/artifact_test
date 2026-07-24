// Form wizard state
let currentStep = 1;
const totalSteps = 3;

// Form data storage
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
const successMessage = document.getElementById('successMessage');

// Initialize form
function init() {
  updateFormDisplay();
  attachEventListeners();
}

// Event Listeners
function attachEventListeners() {
  prevBtn.addEventListener('click', handlePrevious);
  nextBtn.addEventListener('click', handleNext);
  form.addEventListener('submit', handleSubmit);
  
  // Real-time validation
  document.getElementById('name').addEventListener('input', validateStep1);
  document.getElementById('email').addEventListener('input', validateStep1);
  
  // Plan selection
  const planInputs = document.querySelectorAll('input[name="plan"]');
  planInputs.forEach(input => {
    input.addEventListener('change', () => {
      document.getElementById('planError').textContent = '';
    });
  });
  
  // Terms checkbox
  document.getElementById('terms').addEventListener('change', function() {
    document.getElementById('termsError').textContent = '';
  });
}

// Navigation handlers
function handleNext() {
  if (validateCurrentStep()) {
    saveCurrentStepData();
    
    if (currentStep === 2) {
      updateSummary();
    }
    
    currentStep++;
    updateFormDisplay();
  }
}

function handlePrevious() {
  currentStep--;
  updateFormDisplay();
}

// Form submission
async function handleSubmit(e) {
  e.preventDefault();
  
  if (!validateCurrentStep()) {
    return;
  }
  
  // Check terms checkbox
  const termsCheckbox = document.getElementById('terms');
  if (!termsCheckbox.checked) {
    document.getElementById('termsError').textContent = 'You must agree to the terms';
    return;
  }
  
  saveCurrentStepData();
  
  // Submit to backend
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
      showSuccess();
    } else {
      alert('Error: ' + (result.message || 'Submission failed'));
    }
  } catch (error) {
    console.error('Submission error:', error);
    alert('Failed to submit form. Please try again.');
  }
}

// Validation functions
function validateCurrentStep() {
  switch(currentStep) {
    case 1:
      return validateStep1();
    case 2:
      return validateStep2();
    case 3:
      return true; // Summary page, no validation needed
    default:
      return true;
  }
}

function validateStep1() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  
  let isValid = true;
  
  // Validate name
  if (!name) {
    nameError.textContent = 'Name is required';
    isValid = false;
  } else if (name.length < 2) {
    nameError.textContent = 'Name must be at least 2 characters';
    isValid = false;
  } else {
    nameError.textContent = '';
  }
  
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    emailError.textContent = 'Email is required';
    isValid = false;
  } else if (!emailRegex.test(email)) {
    emailError.textContent = 'Please enter a valid email address';
    isValid = false;
  } else {
    emailError.textContent = '';
  }
  
  return isValid;
}

function validateStep2() {
  const planError = document.getElementById('planError');
  const selectedPlan = document.querySelector('input[name="plan"]:checked');
  
  if (!selectedPlan) {
    planError.textContent = 'Please select a plan';
    return false;
  }
  
  planError.textContent = '';
  return true;
}

// Data management
function saveCurrentStepData() {
  switch(currentStep) {
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

function updateSummary() {
  document.getElementById('summaryName').textContent = formData.name;
  document.getElementById('summaryEmail').textContent = formData.email;
  
  const planNames = {
    'basic': 'Basic Plan - $9.99/mo',
    'pro': 'Pro Plan - $19.99/mo',
    'enterprise': 'Enterprise Plan - $49.99/mo'
  };
  
  document.getElementById('summaryPlan').textContent = planNames[formData.plan] || formData.plan;
}

// UI Updates
function updateFormDisplay() {
  // Update form steps
  formSteps.forEach((step, index) => {
    step.classList.remove('active');
    if (index === currentStep - 1) {
      step.classList.add('active');
    }
  });
  
  // Update progress bar
  progressSteps.forEach((step, index) => {
    const stepNumber = index + 1;
    step.classList.remove('active', 'completed');
    
    if (stepNumber === currentStep) {
      step.classList.add('active');
    } else if (stepNumber < currentStep) {
      step.classList.add('completed');
    }
  });
  
  // Update progress lines
  progressLines.forEach((line, index) => {
    line.classList.remove('completed');
    if (index < currentStep - 1) {
      line.classList.add('completed');
    }
  });
  
  // Update navigation buttons
  prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
  nextBtn.style.display = currentStep === totalSteps ? 'none' : 'block';
  submitBtn.style.display = currentStep === totalSteps ? 'block' : 'none';
}

function showSuccess() {
  // Hide form and navigation
  formSteps.forEach(step => step.classList.remove('active'));
  document.querySelector('.form-navigation').style.display = 'none';
  document.querySelector('.progress-bar').style.display = 'none';
  
  // Show success message
  successMessage.classList.add('active');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
