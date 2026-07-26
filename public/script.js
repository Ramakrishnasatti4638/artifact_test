// Form wizard state
let currentStep = 1;
const totalSteps = 3;

// DOM elements
const form = document.getElementById('wizardForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const progressBar = document.getElementById('progressBar');
const successMessage = document.getElementById('successMessage');

// Plan details for summary
const planDetails = {
  basic: { name: 'Basic Plan', price: '$9/month' },
  pro: { name: 'Pro Plan', price: '$29/month' },
  enterprise: { name: 'Enterprise Plan', price: '$99/month' }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  showStep(currentStep);
  updateProgressBar();
});

// Event listeners
nextBtn.addEventListener('click', () => {
  if (validateStep(currentStep)) {
    if (currentStep === 2) {
      updateSummary();
    }
    currentStep++;
    showStep(currentStep);
    updateProgressBar();
    updateButtons();
  }
});

prevBtn.addEventListener('click', () => {
  currentStep--;
  showStep(currentStep);
  updateProgressBar();
  updateButtons();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (validateStep(currentStep)) {
    await submitForm();
  }
});

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
  
  // Update step indicators
  const indicators = document.querySelectorAll('.step-indicator');
  indicators.forEach((indicator, index) => {
    indicator.classList.remove('active', 'completed');
    
    if (index + 1 < step) {
      indicator.classList.add('completed');
    } else if (index + 1 === step) {
      indicator.classList.add('active');
    }
  });
  
  updateButtons();
}

// Update navigation buttons
function updateButtons() {
  // Back button
  if (currentStep === 1) {
    prevBtn.style.display = 'none';
  } else {
    prevBtn.style.display = 'block';
  }
  
  // Next button
  if (currentStep === totalSteps) {
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'block';
  } else {
    nextBtn.style.display = 'block';
    submitBtn.style.display = 'none';
  }
}

// Update progress bar
function updateProgressBar() {
  const progress = (currentStep / totalSteps) * 100;
  progressBar.style.width = `${progress}%`;
}

// Validate current step
function validateStep(step) {
  const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
  
  if (step === 1) {
    // Validate personal details
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    
    if (!name.value.trim()) {
      alert('Please enter your name');
      name.focus();
      return false;
    }
    
    if (!email.value.trim() || !isValidEmail(email.value)) {
      alert('Please enter a valid email address');
      email.focus();
      return false;
    }
  }
  
  if (step === 2) {
    // Validate plan selection
    const selectedPlan = document.querySelector('input[name="plan"]:checked');
    if (!selectedPlan) {
      alert('Please select a plan');
      return false;
    }
  }
  
  return true;
}

// Email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Update confirmation summary
function updateSummary() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const selectedPlan = document.querySelector('input[name="plan"]:checked').value;
  
  document.getElementById('summaryName').textContent = name;
  document.getElementById('summaryEmail').textContent = email;
  document.getElementById('summaryPlan').textContent = planDetails[selectedPlan].name;
  document.getElementById('summaryPrice').textContent = planDetails[selectedPlan].price;
}

// Submit form
async function submitForm() {
  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    plan: document.querySelector('input[name="plan"]:checked').value
  };
  
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
      // Hide form and show success message
      form.style.display = 'none';
      document.querySelector('.wizard-header').style.display = 'none';
      successMessage.style.display = 'block';
    } else {
      alert('Something went wrong. Please try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    alert('Something went wrong. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  }
}

// Add visual feedback for plan selection
document.querySelectorAll('.plan-card').forEach(card => {
  card.addEventListener('click', function() {
    // Remove selection from all cards
    document.querySelectorAll('.plan-card').forEach(c => {
      c.style.transform = '';
    });
    
    // Add selection to clicked card
    this.style.transform = 'translateY(-4px)';
  });
});
