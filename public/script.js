// Multi-Step Form Wizard
let currentStep = 1;
const totalSteps = 3;
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
const progressFill = document.getElementById('progressFill');
const successMessage = document.getElementById('successMessage');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateFormDisplay();
  attachEventListeners();
});

// Attach event listeners
function attachEventListeners() {
  prevBtn.addEventListener('click', goToPreviousStep);
  nextBtn.addEventListener('click', goToNextStep);
  form.addEventListener('submit', handleSubmit);

  // Clear errors on input
  document.getElementById('name').addEventListener('input', () => clearError('nameError'));
  document.getElementById('email').addEventListener('input', () => clearError('emailError'));
  
  // Listen for plan selection
  document.querySelectorAll('input[name="plan"]').forEach(radio => {
    radio.addEventListener('change', () => clearError('planError'));
  });
}

// Navigate to previous step
function goToPreviousStep() {
  if (currentStep > 1) {
    currentStep--;
    updateFormDisplay();
  }
}

// Navigate to next step
function goToNextStep() {
  if (validateCurrentStep()) {
    saveCurrentStepData();
    
    if (currentStep < totalSteps) {
      currentStep++;
      
      // If moving to confirmation step, populate summary
      if (currentStep === 3) {
        populateConfirmation();
      }
      
      updateFormDisplay();
    }
  }
}

// Validate current step
function validateCurrentStep() {
  let isValid = true;

  if (currentStep === 1) {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();

    if (!name) {
      showError('nameError', 'Please enter your name');
      isValid = false;
    }

    if (!email) {
      showError('emailError', 'Please enter your email');
      isValid = false;
    } else if (!isValidEmail(email)) {
      showError('emailError', 'Please enter a valid email address');
      isValid = false;
    }
  } else if (currentStep === 2) {
    const plan = document.querySelector('input[name="plan"]:checked');
    
    if (!plan) {
      showError('planError', 'Please select a plan');
      isValid = false;
    }
  }

  return isValid;
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Save current step data
function saveCurrentStepData() {
  if (currentStep === 1) {
    formData.name = document.getElementById('name').value.trim();
    formData.email = document.getElementById('email').value.trim();
  } else if (currentStep === 2) {
    const selectedPlan = document.querySelector('input[name="plan"]:checked');
    formData.plan = selectedPlan ? selectedPlan.value : '';
  }
}

// Populate confirmation summary
function populateConfirmation() {
  document.getElementById('summaryName').textContent = formData.name;
  document.getElementById('summaryEmail').textContent = formData.email;
  
  const planNames = {
    basic: 'Basic - $9/month',
    pro: 'Pro - $29/month',
    enterprise: 'Enterprise - $99/month'
  };
  
  document.getElementById('summaryPlan').textContent = planNames[formData.plan] || formData.plan;
}

// Update form display
function updateFormDisplay() {
  // Update form steps
  document.querySelectorAll('.form-step').forEach(step => {
    step.classList.remove('active');
  });
  document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('active');

  // Update progress steps
  document.querySelectorAll('.step').forEach((step, index) => {
    const stepNumber = index + 1;
    step.classList.remove('active', 'completed');
    
    if (stepNumber === currentStep) {
      step.classList.add('active');
    } else if (stepNumber < currentStep) {
      step.classList.add('completed');
    }
  });

  // Update progress bar
  const progress = (currentStep / totalSteps) * 100;
  progressFill.style.width = `${progress}%`;

  // Update navigation buttons
  if (currentStep === 1) {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'block';
    submitBtn.style.display = 'none';
  } else if (currentStep === totalSteps) {
    prevBtn.style.display = 'block';
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'block';
  } else {
    prevBtn.style.display = 'block';
    nextBtn.style.display = 'block';
    submitBtn.style.display = 'none';
  }
}

// Handle form submission
async function handleSubmit(e) {
  e.preventDefault();
  
  saveCurrentStepData();

  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error('Submission failed');
    }

    const result = await response.json();
    console.log('Submission successful:', result);

    // Show success message
    document.querySelector('.form-navigation').style.display = 'none';
    document.querySelectorAll('.form-step').forEach(step => {
      step.style.display = 'none';
    });
    successMessage.classList.add('active');

  } catch (error) {
    console.error('Error submitting form:', error);
    alert('An error occurred. Please try again.');
  }
}

// Show error message
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  errorElement.textContent = message;
  
  const inputId = elementId.replace('Error', '');
  const inputElement = document.getElementById(inputId);
  if (inputElement) {
    inputElement.classList.add('error');
  }
}

// Clear error message
function clearError(elementId) {
  const errorElement = document.getElementById(elementId);
  errorElement.textContent = '';
  
  const inputId = elementId.replace('Error', '');
  const inputElement = document.getElementById(inputId);
  if (inputElement) {
    inputElement.classList.remove('error');
  }
}
