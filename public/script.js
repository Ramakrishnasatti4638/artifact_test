let currentStep = 1;
const totalSteps = 3;
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
const progressFill = document.getElementById('progressFill');
const successMessage = document.getElementById('successMessage');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateUI();
  attachEventListeners();
});

function attachEventListeners() {
  nextBtn.addEventListener('click', handleNext);
  prevBtn.addEventListener('click', handlePrev);
  form.addEventListener('submit', handleSubmit);

  // Real-time validation
  document.getElementById('name').addEventListener('input', (e) => {
    formData.name = e.target.value;
  });

  document.getElementById('email').addEventListener('input', (e) => {
    formData.email = e.target.value;
  });

  document.querySelectorAll('input[name="plan"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      formData.plan = e.target.value;
    });
  });
}

function handleNext() {
  if (!validateStep(currentStep)) {
    return;
  }

  if (currentStep < totalSteps) {
    currentStep++;
    updateUI();
    
    // Update confirmation summary when moving to step 3
    if (currentStep === 3) {
      updateConfirmation();
    }
  }
}

function handlePrev() {
  if (currentStep > 1) {
    currentStep--;
    updateUI();
  }
}

function validateStep(step) {
  const currentStepEl = document.querySelector(`.form-step[data-step="${step}"]`);
  const inputs = currentStepEl.querySelectorAll('input[required]');
  
  let isValid = true;
  
  inputs.forEach(input => {
    if (input.type === 'radio') {
      // Check if at least one radio in the group is checked
      const radioGroup = currentStepEl.querySelectorAll(`input[name="${input.name}"]`);
      const isChecked = Array.from(radioGroup).some(radio => radio.checked);
      
      if (!isChecked) {
        isValid = false;
        showError('Please select a plan');
      }
    } else if (!input.value.trim()) {
      isValid = false;
      input.style.borderColor = '#f44336';
      showError(`Please fill in all required fields`);
    } else if (input.type === 'email' && !isValidEmail(input.value)) {
      isValid = false;
      input.style.borderColor = '#f44336';
      showError('Please enter a valid email address');
    } else {
      input.style.borderColor = '#e0e0e0';
    }
  });
  
  return isValid;
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showError(message) {
  // Remove existing error if any
  const existingError = document.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }

  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    background: #ffebee;
    color: #c62828;
    padding: 12px 16px;
    border-radius: 6px;
    margin-bottom: 15px;
    font-size: 14px;
    border-left: 4px solid #f44336;
  `;

  const activeStep = document.querySelector('.form-step.active');
  activeStep.insertBefore(errorDiv, activeStep.firstChild);

  setTimeout(() => errorDiv.remove(), 3000);
}

function updateUI() {
  // Update form steps visibility
  document.querySelectorAll('.form-step').forEach(step => {
    step.classList.remove('active');
  });
  document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('active');

  // Update progress steps
  document.querySelectorAll('.step').forEach((step, index) => {
    step.classList.remove('active', 'completed');
    const stepNumber = index + 1;
    
    if (stepNumber < currentStep) {
      step.classList.add('completed');
    } else if (stepNumber === currentStep) {
      step.classList.add('active');
    }
  });

  // Update progress bar
  const progress = (currentStep / totalSteps) * 100;
  progressFill.style.width = `${progress}%`;

  // Update navigation buttons
  prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-block';
  nextBtn.style.display = currentStep === totalSteps ? 'none' : 'inline-block';
  submitBtn.style.display = currentStep === totalSteps ? 'inline-block' : 'none';
}

function updateConfirmation() {
  document.getElementById('summaryName').textContent = formData.name;
  document.getElementById('summaryEmail').textContent = formData.email;
  
  // Format plan name
  const planNames = {
    'basic': 'Basic Plan ($9/month)',
    'pro': 'Pro Plan ($29/month)',
    'enterprise': 'Enterprise Plan ($99/month)'
  };
  document.getElementById('summaryPlan').textContent = planNames[formData.plan] || formData.plan;
}

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

    const data = await response.json();

    if (response.ok) {
      // Show success message
      form.style.display = 'none';
      document.querySelector('.progress-container').style.display = 'none';
      successMessage.style.display = 'block';
      
      console.log('Form submitted successfully:', data);
    } else {
      showError(data.error || 'Submission failed. Please try again.');
    }
  } catch (error) {
    showError('Network error. Please check your connection and try again.');
    console.error('Submission error:', error);
  }
}
