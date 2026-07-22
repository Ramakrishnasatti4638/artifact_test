// Get DOM elements
const toggle = document.getElementById('toggle');
const statusLabel = document.getElementById('status');

let isOn = false;

// Initialize toggle state from server
async function initToggle() {
  try {
    const response = await fetch('/api/toggle');
    const data = await response.json();
    isOn = data.isOn;
    updateUI();
  } catch (error) {
    console.error('Failed to fetch initial toggle state:', error);
  }
}

// Update UI based on current state
function updateUI() {
  if (isOn) {
    toggle.classList.add('on');
    toggle.setAttribute('aria-checked', 'true');
    statusLabel.textContent = 'Status: ON';
    statusLabel.classList.add('on');
  } else {
    toggle.classList.remove('on');
    toggle.setAttribute('aria-checked', 'false');
    statusLabel.textContent = 'Status: OFF';
    statusLabel.classList.remove('on');
  }
}

// Toggle the switch
async function toggleSwitch() {
  isOn = !isOn;
  
  // Optimistically update UI
  updateUI();
  
  // Sync with server
  try {
    const response = await fetch('/api/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isOn }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update toggle state');
    }
    
    const data = await response.json();
    isOn = data.isOn;
    updateUI();
  } catch (error) {
    console.error('Failed to update toggle state:', error);
    // Revert on error
    isOn = !isOn;
    updateUI();
  }
}

// Event listeners
toggle.addEventListener('click', toggleSwitch);

// Keyboard accessibility
toggle.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    toggleSwitch();
  }
});

// Initialize on page load
initToggle();
