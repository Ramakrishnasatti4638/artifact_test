// State
let currentStep = 1;
const totalSteps = 3;
const formData = {
  name: '',
  email: '',
  plan: ''
};

// DOM Elements
const wizardForm = document.getElementById('wizardForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const progressFill = document.getElementById('progressFill');
const successMessage = document.getElementById('successMessage');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateUI();
  attachEventListeners();
});

// Event Listeners
function attachEventListeners() {
  nextBtn.addEventListener('click', handleNext);
  prevBtn.addEventListener('click', handlePrev);
  wizardForm.addEventListener('submit', handleSubmit);
  
  // Real-time validation
  document.getElementById('name').addEventListener('input', validateName);
  document.getElementById('email').addEventListener('input', validateEmail);
  
  // Plan selection
  const planInputs = document.querySelectorAll('input[name="plan"]');
  planInputs.forEach(input => {
    input.addEventListener('change', () => {
      formData.plan = input.value;
      document.getElementById('planError').textContent = '';
    });
  });
}

// Navigation Handlers
function handleNext() {
  if (validateCurrentStep()) {
    if (currentStep < totalSteps) {
      currentStep++;
      updateUI();
      if (currentStep === 3) {
        updateSummary();
      }
    }
  }
}

function handlePrev() {
  if (currentStep > 1) {
    currentStep--;
    updateUI();
  }
}

function handleSubmit(e) {
  e.preventDefault();
  
  if (currentStep === totalSteps) {
    submitForm();
  }
}

// Validation
function validateCurrentStep() {
  if (currentStep === 1) {
    return validateName() && validateEmail();
  } else if (currentStep === 2) {
    return validatePlan();
  }
  return true;
}

function validateName() {
  const nameInput = document.getElementById('name');
  const nameError = document.getElementById('nameError');
  const name = nameInput.value.trim();
  
  if (!name) {
    nameInput.classList.add('invalid');
    nameError.textContent = 'Name is required';
    return false;
  } else if (name.length < 2) {
    nameInput.classList.add('invalid');
    nameError.textContent = 'Name must be at least 2 characters';
    return false;
  } else {
    nameInput.classList.remove('invalid');
    nameError.textContent = '';
    formData.name = name;
    return true;
  }
}

function validateEmail() {
  const emailInput = document.getElementById('email');
  const emailError = document.getElementById('emailError');
  const email = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    emailInput.classList.add('invalid');
    emailError.textContent = 'Email is required';
    return false;
  } else if (!emailRegex.test(email)) {
    emailInput.classList.add('invalid');
    emailError.textContent = 'Please enter a valid email address';
    return false;
  } else {
    emailInput.classList.remove('invalid');
    emailError.textContent = '';
    formData.email = email;
    return true;
  }
}

function validatePlan() {
  const planError = document.getElementById('planError');
  const selectedPlan = document.querySelector('input[name="plan"]:checked');
  
  if (!selectedPlan) {
    planError.textContent = 'Please select a plan';
    return false;
  } else {
    planError.textContent = '';
    formData.plan = selectedPlan.value;
    return true;
  }
}

// UI Updates
function updateUI() {
  // Update steps visibility
  const formSteps = document.querySelectorAll('.form-step');
  formSteps.forEach((step, index) => {
    if (index + 1 === currentStep) {
      step.classList.add('active');
    } else {
      step.classList.remove('active');
    }
  });
  
  // Update progress indicators
  const stepIndicators = document.querySelectorAll('.step');
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
  const progress = (currentStep / totalSteps) * 100;
  progressFill.style.width = `${progress}%`;
  
  // Update buttons
  prevBtn.style.display = currentStep > 1 ? 'block' : 'none';
  nextBtn.style.display = currentStep < totalSteps ? 'block' : 'none';
  submitBtn.style.display = currentStep === totalSteps ? 'block' : 'none';
}

function updateSummary() {
  document.getElementById('summaryName').textContent = formData.name;
  document.getElementById('summaryEmail').textContent = formData.email;
  document.getElementById('summaryPlan').textContent = formData.plan.charAt(0).toUpperCase() + formData.plan.slice(1);
}

// Form Submission
async function submitForm() {
  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Hide summary, show success message
      document.querySelector('.summary-container').style.display = 'none';
      successMessage.style.display = 'block';
      submitBtn.style.display = 'none';
      prevBtn.style.display = 'none';
      
      // Reset form after 3 seconds
      setTimeout(() => {
        resetForm();
      }, 5000);
    } else {
      alert('Error: ' + (data.error || 'Submission failed'));
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    alert('An error occurred. Please try again.');
  }
}

function resetForm() {
  currentStep = 1;
  formData.name = '';
  formData.email = '';
  formData.plan = '';
  
  wizardForm.reset();
  successMessage.style.display = 'none';
  document.querySelector('.summary-container').style.display = 'block';
  
  updateUI();
}
