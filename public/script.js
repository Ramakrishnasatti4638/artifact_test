document.addEventListener('DOMContentLoaded', () => {
  const toggleSwitch = document.getElementById('toggleSwitch');
  const statusLabel = document.getElementById('statusLabel');
  let isOn = false;

  toggleSwitch.addEventListener('click', () => {
    isOn = !isOn;
    
    if (isOn) {
      toggleSwitch.classList.add('active');
      statusLabel.classList.add('active');
      statusLabel.textContent = 'Status: ON';
    } else {
      toggleSwitch.classList.remove('active');
      statusLabel.classList.remove('active');
      statusLabel.textContent = 'Status: OFF';
    }
  });
});
