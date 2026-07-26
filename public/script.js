// Form wizard state
let currentStep = 1;
const totalSteps = 3;
const formData = {
  name: '',
  email: '',
  plan: ''
};

// Get DOM elements
const form = document.getElementById('wizardForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const startOverBtn = document.getElementById('startOverBtn');
const formSteps = document.querySelectorAll('.form-step');
const progressSteps = document.querySelectorAll('.progress-step');
const progressLines = document.querySelectorAll('.progress-line');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  showStep(currentStep);
  
  // Add plan card click handlers
  const planCards = document.querySelectorAll('.plan-card');
  planCards.forEach(card => {
    card.addEventListener('click', () => {
      const radio = card.querySelector('input[type="radio"]');
      radio.checked = true;
      planCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      formData.plan = radio.value;
    });
  });
});

// Navigation button handlers
nextBtn.addEventListener('click', () => {
  if (validateStep(currentStep)) {
    currentStep++;
    showStep(currentStep);
  }
});

prevBtn.addEventListener('click', () => {
  currentStep--;
  showStep(currentStep);
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (validateStep(currentStep)) {
    await submitForm();
  }
});

startOverBtn.addEventListener('click', () => {
  resetForm();
});

// Show specific step
function showStep(step) {
  // Hide all steps
  formSteps.forEach(stepEl => {
    stepEl.classList.remove('active');
  });

  // Show current step
  const currentStepEl = document.querySelector(`.form-step[data-step="${step}"]`);
  if (currentStepEl) {
    currentStepEl.classList.add('active');
  }

  // Update progress bar
  updateProgressBar(step);

  // Update navigation buttons
  updateNavigationButtons(step);

  // If step 3, show confirmation
  if (step === 3) {
    showConfirmation();
  }
}

// Update progress bar
function updateProgressBar(step) {
  progressSteps.forEach((stepEl, index) => {
    const stepNumber = index + 1;
    
    if (stepNumber < step) {
      stepEl.classList.add('completed');
      stepEl.classList.remove('active');
    } else if (stepNumber === step) {
      stepEl.classList.add('active');
      stepEl.classList.remove('completed');
    } else {
      stepEl.classList.remove('active', 'completed');
    }
  });

  // Update progress lines
  progressLines.forEach((line, index) => {
    if (index < step - 1) {
      line.classList.add('completed');
    } else {
      line.classList.remove('completed');
    }
  });
}

// Update navigation buttons visibility
function updateNavigationButtons(step) {
  prevBtn.style.display = step === 1 ? 'none' : 'block';
  nextBtn.style.display = step === totalSteps ? 'none' : 'block';
  submitBtn.style.display = step === totalSteps ? 'block' : 'none';
}

// Validate current step
function validateStep(step) {
  clearErrors();

  if (step === 1) {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    
    let isValid = true;

    if (!name) {
      showError('nameError', 'Please enter your name');
      isValid = false;
    } else {
      formData.name = name;
    }

    if (!email) {
      showError('emailError', 'Please enter your email');
      isValid = false;
    } else if (!isValidEmail(email)) {
      showError('emailError', 'Please enter a valid email address');
      isValid = false;
    } else {
      formData.email = email;
    }

    return isValid;
  }

  if (step === 2) {
    const selectedPlan = document.querySelector('input[name="plan"]:checked');
    
    if (!selectedPlan) {
      showError('planError', 'Please select a plan');
      return false;
    }
    
    formData.plan = selectedPlan.value;
    return true;
  }

  return true;
}

// Show confirmation details
function showConfirmation() {
  document.getElementById('confirmName').textContent = formData.name;
  document.getElementById('confirmEmail').textContent = formData.email;
  
  const planNames = {
    'basic': 'Basic - $9.99/month',
    'pro': 'Pro - $19.99/month',
    'enterprise': 'Enterprise - $49.99/month'
  };
  
  document.getElementById('confirmPlan').textContent = planNames[formData.plan] || formData.plan;
}

// Submit form to server
async function submitForm() {
  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (response.ok) {
      showSuccess();
    } else {
      alert('Error: ' + (data.error || 'Something went wrong'));
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to submit form. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  }
}

// Show success message
function showSuccess() {
  document.getElementById('successName').textContent = formData.name;
  document.getElementById('successEmail').textContent = formData.email;
  
  const successStep = document.querySelector('.form-step[data-step="success"]');
  formSteps.forEach(step => step.classList.remove('active'));
  successStep.classList.add('active');
  
  prevBtn.style.display = 'none';
  nextBtn.style.display = 'none';
  submitBtn.style.display = 'none';
  startOverBtn.style.display = 'block';
  
  // Update progress bar to show all completed
  progressSteps.forEach(step => {
    step.classList.add('completed');
    step.classList.remove('active');
  });
  progressLines.forEach(line => line.classList.add('completed'));
}

// Reset form
function resetForm() {
  currentStep = 1;
  formData.name = '';
  formData.email = '';
  formData.plan = '';
  
  form.reset();
  
  document.querySelectorAll('.plan-card').forEach(card => {
    card.classList.remove('selected');
  });
  
  submitBtn.disabled = false;
  submitBtn.textContent = 'Submit';
  startOverBtn.style.display = 'none';
  
  clearErrors();
  showStep(currentStep);
}

// Helper functions
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
  }
}

function clearErrors() {
  document.querySelectorAll('.error-message').forEach(el => {
    el.textContent = '';
  });
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
