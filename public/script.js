let currentStep = 1;
const totalSteps = 3;

// Initialize form
document.addEventListener('DOMContentLoaded', () => {
  showStep(currentStep);
  
  // Add form submit handler
  document.getElementById('wizardForm').addEventListener('submit', handleSubmit);
});

function showStep(step) {
  const formSteps = document.querySelectorAll('.form-step');
  const progressSteps = document.querySelectorAll('.progress-step');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');

  // Hide all steps
  formSteps.forEach(s => s.classList.remove('active'));
  
  // Show current step
  const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
  if (currentStepElement) {
    currentStepElement.classList.add('active');
  }

  // Update progress bar
  progressSteps.forEach((s, index) => {
    const stepNumber = index + 1;
    s.classList.remove('active', 'completed');
    
    if (stepNumber < step) {
      s.classList.add('completed');
    } else if (stepNumber === step) {
      s.classList.add('active');
    }
  });

  // Update button visibility
  prevBtn.style.display = step === 1 ? 'none' : 'inline-block';
  
  if (step === totalSteps) {
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'inline-block';
  } else {
    nextBtn.style.display = 'inline-block';
    submitBtn.style.display = 'none';
  }
}

function changeStep(direction) {
  if (direction === 1) {
    // Moving forward - validate current step
    if (!validateStep(currentStep)) {
      return;
    }
    
    // Update confirmation summary when moving to step 3
    if (currentStep === 2) {
      updateConfirmation();
    }
  }

  const newStep = currentStep + direction;
  
  if (newStep >= 1 && newStep <= totalSteps) {
    currentStep = newStep;
    showStep(currentStep);
  }
}

function validateStep(step) {
  let isValid = true;

  if (step === 1) {
    // Validate name
    const name = document.getElementById('name');
    const nameError = document.getElementById('name-error');
    
    if (!name.value.trim()) {
      name.classList.add('invalid');
      nameError.textContent = 'Name is required';
      isValid = false;
    } else {
      name.classList.remove('invalid');
      nameError.textContent = '';
    }

    // Validate email
    const email = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email.value.trim()) {
      email.classList.add('invalid');
      emailError.textContent = 'Email is required';
      isValid = false;
    } else if (!emailPattern.test(email.value)) {
      email.classList.add('invalid');
      emailError.textContent = 'Please enter a valid email address';
      isValid = false;
    } else {
      email.classList.remove('invalid');
      emailError.textContent = '';
    }
  }

  if (step === 2) {
    // Validate plan selection
    const plan = document.querySelector('input[name="plan"]:checked');
    const planError = document.getElementById('plan-error');
    
    if (!plan) {
      planError.textContent = 'Please select a plan';
      isValid = false;
    } else {
      planError.textContent = '';
    }
  }

  return isValid;
}

function updateConfirmation() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const plan = document.querySelector('input[name="plan"]:checked');

  document.getElementById('confirm-name').textContent = name;
  document.getElementById('confirm-email').textContent = email;

  if (plan) {
    const planValue = plan.value;
    const planLabels = {
      basic: { name: 'Basic', price: '$9.99/month', features: ['5 Projects', '10GB Storage', 'Email Support'] },
      pro: { name: 'Pro', price: '$19.99/month', features: ['Unlimited Projects', '100GB Storage', 'Priority Support', 'Advanced Analytics'] },
      enterprise: { name: 'Enterprise', price: '$49.99/month', features: ['Everything in Pro', 'Unlimited Storage', '24/7 Phone Support', 'Dedicated Manager', 'Custom Integrations'] }
    };

    const selectedPlan = planLabels[planValue];
    const planHTML = `
      <div class="summary-section">
        <p><strong>Plan:</strong> ${selectedPlan.name}</p>
        <p><strong>Price:</strong> ${selectedPlan.price}</p>
        <p><strong>Features:</strong></p>
        <ul style="margin-left: 20px; color: #666;">
          ${selectedPlan.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
    `;
    
    document.getElementById('confirm-plan').innerHTML = planHTML;
  }
}

async function handleSubmit(e) {
  e.preventDefault();

  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    plan: document.querySelector('input[name="plan"]:checked').value
  };

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
      // Show success step
      document.getElementById('success-email').textContent = formData.email;
      const formSteps = document.querySelectorAll('.form-step');
      formSteps.forEach(s => s.classList.remove('active'));
      document.querySelector('.form-step[data-step="success"]').classList.add('active');
      
      // Hide navigation buttons
      document.querySelector('.form-navigation').style.display = 'none';
      
      // Update progress bar to show all completed
      document.querySelectorAll('.progress-step').forEach(s => {
        s.classList.remove('active');
        s.classList.add('completed');
      });
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    alert('Error submitting form. Please try again.');
    console.error('Submit error:', error);
  }
}

function resetForm() {
  // Reset form
  document.getElementById('wizardForm').reset();
  
  // Reset to step 1
  currentStep = 1;
  showStep(currentStep);
  
  // Show navigation buttons
  document.querySelector('.form-navigation').style.display = 'flex';
  
  // Clear any error messages
  document.querySelectorAll('.error-message').forEach(e => e.textContent = '');
  document.querySelectorAll('.invalid').forEach(e => e.classList.remove('invalid'));
}
