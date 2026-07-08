const toggleButton = document.getElementById('toggleButton');
const statusLabel = document.getElementById('statusLabel');
const toggleText = toggleButton.querySelector('.toggle-text');

let isOn = false;

const renderToggle = () => {
  toggleButton.classList.toggle('on', isOn);
  toggleButton.setAttribute('aria-checked', String(isOn));
  toggleText.textContent = isOn ? 'ON' : 'OFF';
  statusLabel.textContent = `Status: ${isOn ? 'ON' : 'OFF'}`;
};

toggleButton.addEventListener('click', () => {
  isOn = !isOn;
  renderToggle();
});

renderToggle();
