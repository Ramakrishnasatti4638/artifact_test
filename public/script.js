// Form wizard state
let currentStep = 1;
const totalSteps = 3;

// DOM elements
const form = document.getElementById('wizardForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const progressBar = document.getElementById('progressBar');
const formSteps = document.querySelectorAll('.form-step');
const stepIndicators = document.querySelectorAll('.step-indicator');
const successMessage = document.getElementById('successMessage');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    loadSavedData();
});

// Navigation: Next button
nextBtn.addEventListener('click', async () => {
    if (validateCurrentStep()) {
        await saveStepData();
        
        if (currentStep < totalSteps) {
            currentStep++;
            updateUI();
            
            // If moving to step 3, populate summary
            if (currentStep === 3) {
                populateSummary();
            }
        }
    }
});

// Navigation: Previous button
prevBtn.addEventListener('click', () => {
    if (currentStep > 1) {
        currentStep--;
        updateUI();
    }
});

// Form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Hide the summary and show success message
            document.querySelector('[data-step="3"] .summary-container').style.display = 'none';
            successMessage.style.display = 'block';
            submitBtn.style.display = 'none';
            prevBtn.style.display = 'none';
            
            // Mark all steps as completed
            stepIndicators.forEach(indicator => {
                indicator.classList.add('completed');
            });
            
            // Reset after 5 seconds
            setTimeout(() => {
                resetForm();
            }, 5000);
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Error submitting form. Please try again.');
    }
});

// Update UI based on current step
function updateUI() {
    // Update form steps visibility
    formSteps.forEach((step, index) => {
        if (index + 1 === currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Update step indicators
    stepIndicators.forEach((indicator, index) => {
        if (index + 1 < currentStep) {
            indicator.classList.add('completed');
            indicator.classList.remove('active');
        } else if (index + 1 === currentStep) {
            indicator.classList.add('active');
            indicator.classList.remove('completed');
        } else {
            indicator.classList.remove('active', 'completed');
        }
    });
    
    // Update progress bar
    const progress = (currentStep / totalSteps) * 100;
    progressBar.style.width = `${progress}%`;
    
    // Update navigation buttons
    if (currentStep === 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    } else if (currentStep === totalSteps) {
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Validate current step
function validateCurrentStep() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const inputs = currentStepElement.querySelectorAll('input[required]');
    
    let isValid = true;
    
    inputs.forEach(input => {
        if (input.type === 'radio') {
            const radioGroup = currentStepElement.querySelectorAll(`input[name="${input.name}"]`);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);
            
            if (!isChecked && isValid) {
                alert('Please select a plan to continue.');
                isValid = false;
            }
        } else {
            if (!input.value.trim()) {
                input.focus();
                alert(`Please fill in the ${input.name} field.`);
                isValid = false;
                return;
            }
            
            if (input.type === 'email' && !validateEmail(input.value)) {
                input.focus();
                alert('Please enter a valid email address.');
                isValid = false;
                return;
            }
        }
    });
    
    return isValid;
}

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Save step data to server
async function saveStepData() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const inputs = currentStepElement.querySelectorAll('input');
    
    const data = {};
    inputs.forEach(input => {
        if (input.type === 'radio') {
            if (input.checked) {
                data[input.name] = input.value;
            }
        } else {
            data[input.name] = input.value;
        }
    });
    
    try {
        await fetch('/api/save-step', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                step: currentStep,
                data: data
            })
        });
    } catch (error) {
        console.error('Error saving step data:', error);
    }
}

// Load saved data from server
async function loadSavedData() {
    try {
        const response = await fetch('/api/form-data');
        const formData = await response.json();
        
        // Populate form fields with saved data
        Object.keys(formData).forEach(stepKey => {
            const stepData = formData[stepKey];
            Object.keys(stepData).forEach(fieldName => {
                const input = document.querySelector(`input[name="${fieldName}"]`);
                if (input) {
                    if (input.type === 'radio') {
                        const radioInput = document.querySelector(`input[name="${fieldName}"][value="${stepData[fieldName]}"]`);
                        if (radioInput) radioInput.checked = true;
                    } else {
                        input.value = stepData[fieldName];
                    }
                }
            });
        });
    } catch (error) {
        console.error('Error loading saved data:', error);
    }
}

// Populate summary on step 3
async function populateSummary() {
    try {
        const response = await fetch('/api/form-data');
        const formData = await response.json();
        
        // Personal details
        if (formData.step1) {
            document.getElementById('summaryName').textContent = formData.step1.name || '-';
            document.getElementById('summaryEmail').textContent = formData.step1.email || '-';
        }
        
        // Plan selection
        if (formData.step2) {
            document.getElementById('summaryPlan').textContent = formData.step2.plan || '-';
        }
    } catch (error) {
        console.error('Error populating summary:', error);
    }
}

// Reset form
async function resetForm() {
    try {
        await fetch('/api/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // Reset UI
        currentStep = 1;
        form.reset();
        successMessage.style.display = 'none';
        document.querySelector('[data-step="3"] .summary-container').style.display = 'block';
        updateUI();
        
    } catch (error) {
        console.error('Error resetting form:', error);
    }
}
