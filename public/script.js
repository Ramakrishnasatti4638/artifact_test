let currentStep = 1;
const totalSteps = 3;

// DOM Elements
const form = document.getElementById('wizardForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

// Plan pricing data
const planPricing = {
    basic: '$9.99/month',
    pro: '$19.99/month',
    enterprise: '$49.99/month'
};

// Initialize on page load
window.addEventListener('DOMContentLoaded', async () => {
    await loadFormData();
    updateUI();
    attachEventListeners();
});

// Load saved form data from session
async function loadFormData() {
    try {
        const response = await fetch('/api/form-data');
        const data = await response.json();
        
        if (data.step1 && data.step1.name) {
            document.getElementById('name').value = data.step1.name;
        }
        if (data.step1 && data.step1.email) {
            document.getElementById('email').value = data.step1.email;
        }
        if (data.step2 && data.step2.plan) {
            const planRadio = document.querySelector(`input[name="plan"][value="${data.step2.plan}"]`);
            if (planRadio) planRadio.checked = true;
        }
        if (data.currentStep) {
            currentStep = data.currentStep;
        }
    } catch (error) {
        console.error('Error loading form data:', error);
    }
}

// Attach event listeners
function attachEventListeners() {
    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateUI();
        }
    });

    nextBtn.addEventListener('click', async () => {
        if (await validateAndSaveStep()) {
            currentStep++;
            updateUI();
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitForm();
    });

    resetBtn.addEventListener('click', async () => {
        await fetch('/api/reset', { method: 'POST' });
        location.reload();
    });

    // Add change listeners to plan cards for visual feedback
    document.querySelectorAll('input[name="plan"]').forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.plan-card').forEach(card => {
                card.style.borderColor = '#e0e0e0';
                card.style.boxShadow = 'none';
            });
            const selectedCard = radio.closest('.plan-card');
            selectedCard.style.borderColor = '#667eea';
            selectedCard.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
        });
    });
}

// Validate and save current step
async function validateAndSaveStep() {
    hideError();

    if (currentStep === 1) {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();

        if (!name || !email) {
            showError('Please fill in all required fields');
            return false;
        }

        if (!email.includes('@')) {
            showError('Please enter a valid email address');
            return false;
        }

        try {
            const response = await fetch('/api/step1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email })
            });

            const data = await response.json();
            
            if (!response.ok) {
                showError(data.error || 'An error occurred');
                return false;
            }

            return true;
        } catch (error) {
            showError('Network error. Please try again.');
            return false;
        }
    }

    if (currentStep === 2) {
        const plan = document.querySelector('input[name="plan"]:checked');

        if (!plan) {
            showError('Please select a plan');
            return false;
        }

        try {
            const response = await fetch('/api/step2', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: plan.value })
            });

            const data = await response.json();
            
            if (!response.ok) {
                showError(data.error || 'An error occurred');
                return false;
            }

            // Update confirmation summary
            updateConfirmation();
            return true;
        } catch (error) {
            showError('Network error. Please try again.');
            return false;
        }
    }

    return true;
}

// Update confirmation summary
function updateConfirmation() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const plan = document.querySelector('input[name="plan"]:checked').value;

    document.getElementById('confirm-name').textContent = name;
    document.getElementById('confirm-email').textContent = email;
    document.getElementById('confirm-plan').textContent = plan.charAt(0).toUpperCase() + plan.slice(1);
    document.getElementById('confirm-price').textContent = planPricing[plan];
}

// Submit final form
async function submitForm() {
    hideError();

    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (!response.ok) {
            showError(data.error || 'Submission failed');
            return;
        }

        // Show success message
        document.querySelector('.confirmation-summary').style.display = 'none';
        successMessage.style.display = 'block';
        submitBtn.style.display = 'none';
        prevBtn.style.display = 'none';
        resetBtn.style.display = 'block';

        console.log('Form submitted:', data.data);
    } catch (error) {
        showError('Network error. Please try again.');
    }
}

// Update UI based on current step
function updateUI() {
    // Update form steps visibility
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('active');

    // Update progress bar
    document.querySelectorAll('.progress-step').forEach(step => {
        const stepNum = parseInt(step.dataset.step);
        step.classList.remove('active', 'completed');
        
        if (stepNum === currentStep) {
            step.classList.add('active');
        } else if (stepNum < currentStep) {
            step.classList.add('completed');
        }
    });

    // Update buttons
    prevBtn.style.display = currentStep > 1 ? 'block' : 'none';
    nextBtn.style.display = currentStep < totalSteps ? 'block' : 'none';
    submitBtn.style.display = currentStep === totalSteps ? 'block' : 'none';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Hide error message
function hideError() {
    errorMessage.style.display = 'none';
}
