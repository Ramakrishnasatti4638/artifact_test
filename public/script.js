// Form wizard state
let currentStep = 1;
const totalSteps = 3;

// Form data storage
const formData = {
  name: '',
  email: '',
  plan: ''
};

// Plan pricing mapping
const planPricing = {
  basic: '$9.99/month',
  pro: '$19.99/month',
  enterprise: '$49.99/month'
};

// DOM elements
const form = document.getElementById('wizardForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const formSteps = document.querySelectorAll('.form-step');
const progressSteps = document.querySelectorAll('.progress-step');
const progressLines = document.querySelectorAll('.progress-line');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateFormDisplay();
  attachEventListeners();
});

// Attach event listeners
function attachEventListeners() {
  nextBtn.addEventListener('click', handleNext);
  prevBtn.addEventListener('click', handlePrevious);
  form.addEventListener('submit', handleSubmit);

  // Real-time validation
  document.getElementById('name').addEventListener('input', validateName);
  document.getElementById('email').addEventListener('input', validateEmail);
  
  // Plan selection
  const planRadios = document.querySelectorAll('input[name="plan"]');
  planRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      formData.plan = radio.value;
      clearError('planError');
    });
  });
}

// Navigate to next step
function handleNext() {
  if (validateCurrentStep()) {
    saveCurrentStepData();
    
    if (currentStep === 2) {
      updateConfirmationSummary();
    }
    
    currentStep++;
    updateFormDisplay();
  }
}

// Navigate to previous step
function handlePrevious() {
  if (currentStep > 1) {
    currentStep--;
    updateFormDisplay();
  }
}

// Update form display based on current step
function updateFormDisplay() {
  // Update form steps visibility
  formSteps.forEach((step, index) => {
    if (index + 1 === currentStep) {
      step.classList.add('active');
    } else {
      step.classList.remove('active');
    }
  });

  // Update progress bar
  progressSteps.forEach((step, index) => {
    const stepNumber = index + 1;
    
    if (stepNumber < currentStep) {
      step.classList.add('completed');
      step.classList.remove('active');
    } else if (stepNumber === currentStep) {
      step.classList.add('active');
      step.classList.remove('completed');
    } else {
      step.classList.remove('active', 'completed');
    }
  });

  // Update progress lines
  progressLines.forEach((line, index) => {
    if (index + 1 < currentStep) {
      line.classList.add('completed');
    } else {
      line.classList.remove('completed');
    }
  });

  // Update button visibility
  prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-block';
  nextBtn.style.display = currentStep === totalSteps ? 'none' : 'inline-block';
  submitBtn.style.display = currentStep === totalSteps ? 'inline-block' : 'none';

  // Populate fields with saved data when going back
  if (currentStep === 1) {
    document.getElementById('name').value = formData.name;
    document.getElementById('email').value = formData.email;
  } else if (currentStep === 2) {
    if (formData.plan) {
      const planRadio = document.querySelector(`input[name="plan"][value="${formData.plan}"]`);
      if (planRadio) planRadio.checked = true;
    }
  }
}

// Validate current step
function validateCurrentStep() {
  if (currentStep === 1) {
    return validateStep1();
  } else if (currentStep === 2) {
    return validateStep2();
  }
  return true;
}

// Validate step 1 (Personal details)
function validateStep1() {
  const nameValid = validateName();
  const emailValid = validateEmail();
  return nameValid && emailValid;
}

// Validate name
function validateName() {
  const nameInput = document.getElementById('name');
  const name = nameInput.value.trim();
  
  if (name === '') {
    showError('nameError', 'Name is required');
    nameInput.classList.add('error');
    return false;
  } else if (name.length < 2) {
    showError('nameError', 'Name must be at least 2 characters');
    nameInput.classList.add('error');
    return false;
  } else {
    clearError('nameError');
    nameInput.classList.remove('error');
    return true;
  }
}

// Validate email
function validateEmail() {
  const emailInput = document.getElementById('email');
  const email = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (email === '') {
    showError('emailError', 'Email is required');
    emailInput.classList.add('error');
    return false;
  } else if (!emailRegex.test(email)) {
    showError('emailError', 'Please enter a valid email address');
    emailInput.classList.add('error');
    return false;
  } else {
    clearError('emailError');
    emailInput.classList.remove('error');
    return true;
  }
}

// Validate step 2 (Plan selection)
function validateStep2() {
  const selectedPlan = document.querySelector('input[name="plan"]:checked');
  
  if (!selectedPlan) {
    showError('planError', 'Please select a plan');
    return false;
  }
  
  clearError('planError');
  return true;
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

// Update confirmation summary
function updateConfirmationSummary() {
  document.getElementById('confirmName').textContent = formData.name;
  document.getElementById('confirmEmail').textContent = formData.email;
  document.getElementById('confirmPlan').textContent = formData.plan;
  document.getElementById('confirmPrice').textContent = planPricing[formData.plan] || '-';
}

// Show error message
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  errorElement.textContent = message;
}

// Clear error message
function clearError(elementId) {
  const errorElement = document.getElementById(elementId);
  errorElement.textContent = '';
}

// Handle form submission
async function handleSubmit(e) {
  e.preventDefault();
  
  // Disable submit button to prevent double submission
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

    if (result.success) {
      showSuccessMessage();
    } else {
      alert('Error: ' + result.message);
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

// Show success message
function showSuccessMessage() {
  // Hide form steps and navigation
  formSteps.forEach(step => step.style.display = 'none');
  document.querySelector('.form-navigation').style.display = 'none';
  
  // Show success message
  const successMessage = document.getElementById('successMessage');
  successMessage.classList.add('active');
  
  // Update all progress steps to completed
  progressSteps.forEach(step => {
    step.classList.remove('active');
    step.classList.add('completed');
  });
  
  progressLines.forEach(line => {
    line.classList.add('completed');
  });

  // Optional: Reset form after a delay
  setTimeout(() => {
    if (confirm('Would you like to submit another form?')) {
      location.reload();
    }
  }, 3000);
}
