const toggleSwitch = document.getElementById('toggleSwitch');
const statusLabel = document.getElementById('statusLabel');

async function loadToggleState() {
  try {
    const response = await fetch('/api/toggle');
    const data = await response.json();
    updateUI(data.state);
  } catch (error) {
    console.error('Error loading toggle state:', error);
  }
}

async function toggleState() {
  try {
    const response = await fetch('/api/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    updateUI(data.state);
  } catch (error) {
    console.error('Error toggling state:', error);
  }
}

function updateUI(state) {
  if (state) {
    toggleSwitch.classList.add('on');
    statusLabel.classList.add('on');
    statusLabel.textContent = 'Status: ON';
  } else {
    toggleSwitch.classList.remove('on');
    statusLabel.classList.remove('on');
    statusLabel.textContent = 'Status: OFF';
  }
}

toggleSwitch.addEventListener('click', toggleState);

loadToggleState();
