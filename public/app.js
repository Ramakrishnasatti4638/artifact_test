// State management
let currentStep = 1;
const totalSteps = 3;
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
const progressFill = document.getElementById('progressFill');
const successMessage = document.getElementById('successMessage');
const resetBtn = document.getElementById('resetBtn');

// Form inputs
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const planInput = document.getElementById('plan');

// Plan cards
const planCards = document.querySelectorAll('.plan-card');
const planSelectBtns = document.querySelectorAll('.plan-select-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateStepDisplay();
  attachEventListeners();
});

// Event listeners
function attachEventListeners() {
  prevBtn.addEventListener('click', goToPreviousStep);
  nextBtn.addEventListener('click', goToNextStep);
  form.addEventListener('submit', handleSubmit);
  resetBtn.addEventListener('click', resetForm);
  
  // Plan selection
  planCards.forEach((card, index) => {
    card.addEventListener('click', () => selectPlan(card.dataset.plan));
    planSelectBtns[index].addEventListener('click', (e) => {
      e.stopPropagation();
      selectPlan(card.dataset.plan);
    });
  });
  
  // Real-time validation
  nameInput.addEventListener('input', () => validateField('name'));
  emailInput.addEventListener('input', () => validateField('email'));
}

// Plan selection
function selectPlan(plan) {
  planCards.forEach(card => card.classList.remove('selected'));
  const selectedCard = document.querySelector(`[data-plan="${plan}"]`);
  selectedCard.classList.add('selected');
  planInput.value = plan;
  formData.plan = plan;
  clearError('plan');
}

// Validation
function validateField(field) {
  const input = document.getElementById(field);
  const errorElement = document.getElementById(`${field}Error`);
  let isValid = true;
  let errorMessage = '';
  
  if (field === 'name') {
    if (!input.value.trim()) {
      isValid = false;
      errorMessage = 'Name is required';
    } else if (input.value.trim().length < 2) {
      isValid = false;
      errorMessage = 'Name must be at least 2 characters';
    }
  }
  
  if (field === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!input.value.trim()) {
      isValid = false;
      errorMessage = 'Email is required';
    } else if (!emailRegex.test(input.value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }
  }
  
  if (field === 'plan') {
    if (!planInput.value) {
      isValid = false;
      errorMessage = 'Please select a plan';
    }
  }
  
  if (!isValid) {
    input.classList.add('error');
    errorElement.textContent = errorMessage;
  } else {
    input.classList.remove('error');
    errorElement.textContent = '';
  }
  
  return isValid;
}

function clearError(field) {
  const errorElement = document.getElementById(`${field}Error`);
  if (errorElement) {
    errorElement.textContent = '';
  }
  const input = document.getElementById(field);
  if (input) {
    input.classList.remove('error');
  }
}

function validateStep(step) {
  let isValid = true;
  
  if (step === 1) {
    const nameValid = validateField('name');
    const emailValid = validateField('email');
    isValid = nameValid && emailValid;
    
    if (isValid) {
      formData.name = nameInput.value.trim();
      formData.email = emailInput.value.trim();
    }
  }
  
  if (step === 2) {
    const planValid = validateField('plan');
    isValid = planValid;
  }
  
  return isValid;
}

// Navigation
function goToNextStep() {
  if (validateStep(currentStep)) {
    if (currentStep === 2) {
      updateConfirmation();
    }
    
    if (currentStep < totalSteps) {
      currentStep++;
      updateStepDisplay();
    }
  }
}

function goToPreviousStep() {
  if (currentStep > 1) {
    currentStep--;
    updateStepDisplay();
  }
}

function updateStepDisplay() {
  // Update form steps
  const formSteps = document.querySelectorAll('.form-step');
  formSteps.forEach((step, index) => {
    if (index + 1 === currentStep) {
      step.classList.add('active');
    } else {
      step.classList.remove('active');
    }
  });
  
  // Update progress steps
  const progressSteps = document.querySelectorAll('.step');
  progressSteps.forEach((step, index) => {
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
  
  // Update button visibility
  prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
  nextBtn.style.display = currentStep === totalSteps ? 'none' : 'block';
  submitBtn.style.display = currentStep === totalSteps ? 'block' : 'none';
}

function updateConfirmation() {
  document.getElementById('confirmName').textContent = formData.name;
  document.getElementById('confirmEmail').textContent = formData.email;
  document.getElementById('confirmPlan').textContent = formData.plan.charAt(0).toUpperCase() + formData.plan.slice(1);
}

// Form submission
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
      // Hide form and show success message
      form.style.display = 'none';
      document.querySelector('.progress-container').style.display = 'none';
      successMessage.style.display = 'block';
    } else {
      alert(result.error || 'Submission failed. Please try again.');
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    alert('An error occurred. Please try again.');
  }
}

function resetForm() {
  // Reset state
  currentStep = 1;
  formData.name = '';
  formData.email = '';
  formData.plan = '';
  
  // Reset form
  form.reset();
  planInput.value = '';
  
  // Remove selected plan
  planCards.forEach(card => card.classList.remove('selected'));
  
  // Clear errors
  document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
  document.querySelectorAll('input').forEach(input => input.classList.remove('error'));
  
  // Show form and hide success message
  form.style.display = 'block';
  document.querySelector('.progress-container').style.display = 'block';
  successMessage.style.display = 'none';
  
  // Update display
  updateStepDisplay();
}
