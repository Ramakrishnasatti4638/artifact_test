// Multi-Step Form Wizard
let currentStep = 1;
const totalSteps = 3;

// Form data
const formData = {
  name: '',
  email: '',
  plan: ''
};

// DOM Elements
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const progressFill = document.getElementById('progressFill');
const formSteps = document.querySelectorAll('.form-step');
const stepIndicators = document.querySelectorAll('.step');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateUI();
  attachEventListeners();
});

// Event Listeners
function attachEventListeners() {
  prevBtn.addEventListener('click', previousStep);
  nextBtn.addEventListener('click', nextStep);
  submitBtn.addEventListener('click', submitForm);

  // Real-time validation
  document.getElementById('name').addEventListener('input', validateName);
  document.getElementById('email').addEventListener('input', validateEmail);
  
  // Plan selection
  const planRadios = document.querySelectorAll('input[name="plan"]');
  planRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      formData.plan = e.target.value;
      clearError('planError');
    });
  });
}

// Navigation Functions
function nextStep() {
  if (validateCurrentStep()) {
    if (currentStep < totalSteps) {
      currentStep++;
      updateUI();
      
      // Update confirmation on step 3
      if (currentStep === 3) {
        updateConfirmation();
      }
    }
  }
}

function previousStep() {
  if (currentStep > 1) {
    currentStep--;
    updateUI();
  }
}

// Update UI based on current step
function updateUI() {
  // Update form steps visibility
  formSteps.forEach((step, index) => {
    if (index + 1 === currentStep) {
      step.classList.add('active');
    } else {
      step.classList.remove('active');
    }
  });

  // Update step indicators
  stepIndicators.forEach((step, index) => {
    if (index + 1 < currentStep) {
      step.classList.add('completed');
      step.classList.remove('active');
    } else if (index + 1 === currentStep) {
      step.classList.add('active');
      step.classList.remove('completed');
    } else {
      step.classList.remove('active', 'completed');
    }
  });

  // Update progress bar
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
  progressFill.style.width = `${progress}%`;

  // Update button visibility
  prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
  nextBtn.style.display = currentStep === totalSteps ? 'none' : 'block';
  submitBtn.style.display = currentStep === totalSteps ? 'block' : 'none';
}

// Validation Functions
function validateCurrentStep() {
  switch (currentStep) {
    case 1:
      return validateStep1();
    case 2:
      return validateStep2();
    case 3:
      return true; // No validation needed for confirmation step
    default:
      return false;
  }
}

function validateStep1() {
  const nameValid = validateName();
  const emailValid = validateEmail();
  
  return nameValid && emailValid;
}

function validateStep2() {
  const planRadios = document.querySelectorAll('input[name="plan"]');
  const isSelected = Array.from(planRadios).some(radio => radio.checked);
  
  if (!isSelected) {
    showError('planError', 'Please select a plan');
    return false;
  }
  
  clearError('planError');
  return true;
}

function validateName() {
  const nameInput = document.getElementById('name');
  const name = nameInput.value.trim();
  
  if (!name) {
    showError('nameError', 'Name is required');
    return false;
  }
  
  if (name.length < 2) {
    showError('nameError', 'Name must be at least 2 characters');
    return false;
  }
  
  formData.name = name;
  clearError('nameError');
  return true;
}

function validateEmail() {
  const emailInput = document.getElementById('email');
  const email = emailInput.value.trim();
  
  if (!email) {
    showError('emailError', 'Email is required');
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError('emailError', 'Please enter a valid email address');
    return false;
  }
  
  formData.email = email;
  clearError('emailError');
  return true;
}

// Error handling
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  errorElement.textContent = message;
}

function clearError(elementId) {
  const errorElement = document.getElementById(elementId);
  errorElement.textContent = '';
}

// Update confirmation summary
function updateConfirmation() {
  document.getElementById('confirmName').textContent = formData.name;
  document.getElementById('confirmEmail').textContent = formData.email;
  document.getElementById('confirmPlan').textContent = formData.plan;
}

// Submit form
async function submitForm() {
  const resultDiv = document.getElementById('submissionResult');
  
  try {
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      resultDiv.className = 'submission-result success';
      resultDiv.textContent = `✓ ${result.message} Your submission ID is #${result.data.id}`;
      
      // Disable form after successful submission
      setTimeout(() => {
        prevBtn.disabled = true;
        submitBtn.textContent = 'Submitted';
      }, 500);
    } else {
      resultDiv.className = 'submission-result error';
      resultDiv.textContent = `✗ ${result.message}`;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  } catch (error) {
    resultDiv.className = 'submission-result error';
    resultDiv.textContent = '✗ An error occurred. Please try again.';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  }
}
