// Form wizard state
let currentStep = 1;
const totalSteps = 3;

// DOM elements
const form = document.getElementById('wizardForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const progressBar = document.getElementById('progressBar');
const successMessage = document.getElementById('successMessage');
const wizardContainer = document.querySelector('.wizard-container');

// Form data storage
const formData = {
  name: '',
  email: '',
  plan: ''
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  showStep(currentStep);
  updateProgressBar();
  attachEventListeners();
});

// Event listeners
function attachEventListeners() {
  prevBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      showStep(currentStep);
      updateProgressBar();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (validateStep(currentStep)) {
      saveStepData(currentStep);
      
      if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
        updateProgressBar();
        
        // If moving to step 3, update summary
        if (currentStep === 3) {
          updateSummary();
        }
      }
    }
  });

  submitBtn.addEventListener('click', async () => {
    await submitForm();
  });

  resetBtn.addEventListener('click', () => {
    resetForm();
  });

  // Real-time validation
  document.getElementById('name').addEventListener('input', clearError);
  document.getElementById('email').addEventListener('input', clearError);
  
  // Plan selection
  const planRadios = document.querySelectorAll('input[name="plan"]');
  planRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      document.getElementById('planError').textContent = '';
    });
  });
}

// Show specific step
function showStep(step) {
  // Hide all steps
  const steps = document.querySelectorAll('.form-step');
  steps.forEach(s => s.classList.remove('active'));

  // Show current step
  const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
  if (currentStepElement) {
    currentStepElement.classList.add('active');
  }

  // Update button visibility
  prevBtn.style.display = step === 1 ? 'none' : 'block';
  nextBtn.style.display = step === totalSteps ? 'none' : 'block';
  submitBtn.style.display = step === totalSteps ? 'block' : 'none';

  // Update progress steps
  const progressSteps = document.querySelectorAll('.progress-step');
  progressSteps.forEach((ps, index) => {
    ps.classList.remove('active', 'completed');
    if (index + 1 < step) {
      ps.classList.add('completed');
    } else if (index + 1 === step) {
      ps.classList.add('active');
    }
  });
}

// Update progress bar
function updateProgressBar() {
  progressBar.setAttribute('data-progress', currentStep);
}

// Validate current step
function validateStep(step) {
  let isValid = true;

  if (step === 1) {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');

    // Clear previous errors
    nameError.textContent = '';
    emailError.textContent = '';
    document.getElementById('name').classList.remove('error');
    document.getElementById('email').classList.remove('error');

    // Validate name
    if (!name) {
      nameError.textContent = 'Name is required';
      document.getElementById('name').classList.add('error');
      isValid = false;
    } else if (name.length < 2) {
      nameError.textContent = 'Name must be at least 2 characters';
      document.getElementById('name').classList.add('error');
      isValid = false;
    }

    // Validate email
    if (!email) {
      emailError.textContent = 'Email is required';
      document.getElementById('email').classList.add('error');
      isValid = false;
    } else if (!isValidEmail(email)) {
      emailError.textContent = 'Please enter a valid email address';
      document.getElementById('email').classList.add('error');
      isValid = false;
    }
  }

  if (step === 2) {
    const plan = document.querySelector('input[name="plan"]:checked');
    const planError = document.getElementById('planError');
    
    planError.textContent = '';
    
    if (!plan) {
      planError.textContent = 'Please select a plan';
      isValid = false;
    }
  }

  return isValid;
}

// Save step data
function saveStepData(step) {
  if (step === 1) {
    formData.name = document.getElementById('name').value.trim();
    formData.email = document.getElementById('email').value.trim();
  }

  if (step === 2) {
    const selectedPlan = document.querySelector('input[name="plan"]:checked');
    formData.plan = selectedPlan ? selectedPlan.value : '';
  }
}

// Update summary on step 3
function updateSummary() {
  document.getElementById('summaryName').textContent = formData.name;
  document.getElementById('summaryEmail').textContent = formData.email;
  
  // Capitalize plan name
  const planName = formData.plan.charAt(0).toUpperCase() + formData.plan.slice(1);
  document.getElementById('summaryPlan').textContent = planName;
}

// Submit form
async function submitForm() {
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (result.success) {
      // Hide form, show success message
      form.style.display = 'none';
      document.querySelector('.button-group').style.display = 'none';
      document.querySelector('.progress-container').style.display = 'none';
      document.querySelector('h1').style.display = 'none';
      successMessage.style.display = 'block';
    } else {
      alert('Error: ' + result.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  } catch (error) {
    console.error('Submission error:', error);
    alert('An error occurred. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  }
}

// Reset form
function resetForm() {
  // Reset form data
  formData.name = '';
  formData.email = '';
  formData.plan = '';

  // Reset form fields
  form.reset();

  // Clear errors
  document.querySelectorAll('.error-message').forEach(error => {
    error.textContent = '';
  });
  document.querySelectorAll('input').forEach(input => {
    input.classList.remove('error');
  });

  // Reset to step 1
  currentStep = 1;
  showStep(currentStep);
  updateProgressBar();

  // Show form elements, hide success message
  form.style.display = 'block';
  document.querySelector('.button-group').style.display = 'flex';
  document.querySelector('.progress-container').style.display = 'block';
  document.querySelector('h1').style.display = 'block';
  successMessage.style.display = 'none';

  // Reset submit button
  submitBtn.disabled = false;
  submitBtn.textContent = 'Submit';
}

// Helper functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function clearError(event) {
  const input = event.target;
  const errorElement = document.getElementById(input.id + 'Error');
  
  if (errorElement) {
    errorElement.textContent = '';
  }
  input.classList.remove('error');
}
