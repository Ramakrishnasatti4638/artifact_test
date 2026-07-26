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
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const submitBtn = document.getElementById('submitBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateUI();
  attachEventListeners();
});

// Event Listeners
function attachEventListeners() {
  nextBtn.addEventListener('click', handleNext);
  prevBtn.addEventListener('click', handlePrev);
  form.addEventListener('submit', handleSubmit);
  
  // Track input changes
  document.getElementById('name').addEventListener('input', (e) => {
    formData.name = e.target.value;
    clearError('name');
  });
  
  document.getElementById('email').addEventListener('input', (e) => {
    formData.email = e.target.value;
    clearError('email');
  });
  
  // Track plan selection
  document.querySelectorAll('input[name="plan"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      formData.plan = e.target.value;
      clearError('plan');
    });
  });
}

// Handle Next Button
function handleNext() {
  if (validateStep(currentStep)) {
    if (currentStep < totalSteps) {
      currentStep++;
      updateUI();
      
      // Update confirmation page if moving to step 3
      if (currentStep === 3) {
        updateConfirmation();
      }
    }
  }
}

// Handle Previous Button
function handlePrev() {
  if (currentStep > 1) {
    currentStep--;
    updateUI();
  }
}

// Handle Form Submit
async function handleSubmit(e) {
  e.preventDefault();
  
  if (!validateStep(currentStep)) {
    return;
  }
  
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
      document.getElementById('success-message').style.display = 'block';
      document.querySelector('.confirmation-summary').style.display = 'none';
      submitBtn.style.display = 'none';
      prevBtn.style.display = 'none';
      
      // Reset form after 3 seconds
      setTimeout(() => {
        resetForm();
      }, 3000);
    } else {
      alert('Error submitting form: ' + (result.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error submitting form. Please try again.');
  }
}

// Validate Current Step
function validateStep(step) {
  let isValid = true;
  
  if (step === 1) {
    // Validate name
    const name = formData.name.trim();
    if (!name) {
      showError('name', 'Please enter your name');
      isValid = false;
    } else if (name.length < 2) {
      showError('name', 'Name must be at least 2 characters');
      isValid = false;
    }
    
    // Validate email
    const email = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      showError('email', 'Please enter your email');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      showError('email', 'Please enter a valid email address');
      isValid = false;
    }
  } else if (step === 2) {
    // Validate plan selection
    if (!formData.plan) {
      showError('plan', 'Please select a plan');
      isValid = false;
    }
  }
  
  return isValid;
}

// Show Error Message
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

// Clear Error Message
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

// Update UI based on current step
function updateUI() {
  // Update form steps visibility
  document.querySelectorAll('.form-step').forEach((step, index) => {
    if (index + 1 === currentStep) {
      step.classList.add('active');
    } else {
      step.classList.remove('active');
    }
  });
  
  // Update progress bar
  document.querySelectorAll('.progress-step').forEach((step, index) => {
    const stepNum = index + 1;
    if (stepNum < currentStep) {
      step.classList.add('completed');
      step.classList.remove('active');
    } else if (stepNum === currentStep) {
      step.classList.add('active');
      step.classList.remove('completed');
    } else {
      step.classList.remove('active', 'completed');
    }
  });
  
  // Update progress lines
  document.querySelectorAll('.progress-line').forEach((line, index) => {
    if (index + 1 < currentStep) {
      line.classList.add('completed');
    } else {
      line.classList.remove('completed');
    }
  });
  
  // Update button visibility
  prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
  nextBtn.style.display = currentStep === totalSteps ? 'none' : 'block';
  submitBtn.style.display = currentStep === totalSteps ? 'block' : 'none';
}

// Update Confirmation Summary
function updateConfirmation() {
  document.getElementById('confirm-name').textContent = formData.name;
  document.getElementById('confirm-email').textContent = formData.email;
  
  // Capitalize plan name
  const planName = formData.plan.charAt(0).toUpperCase() + formData.plan.slice(1);
  const planPrices = {
    basic: '$9/month',
    pro: '$29/month',
    enterprise: '$99/month'
  };
  
  document.getElementById('confirm-plan').textContent = `${planName} (${planPrices[formData.plan]})`;
}

// Reset Form
function resetForm() {
  currentStep = 1;
  formData.name = '';
  formData.email = '';
  formData.plan = '';
  
  form.reset();
  document.getElementById('success-message').style.display = 'none';
  document.querySelector('.confirmation-summary').style.display = 'block';
  
  updateUI();
}
