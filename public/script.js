const form = document.getElementById('shortenForm');
const urlInput = document.getElementById('urlInput');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');
const shortUrlOutput = document.getElementById('shortUrlOutput');
const originalUrlOutput = document.getElementById('originalUrlOutput');
const copyBtn = document.getElementById('copyBtn');
const historyList = document.getElementById('historyList');

let recentUrls = JSON.parse(localStorage.getItem('recentUrls')) || [];

// Load history on page load
document.addEventListener('DOMContentLoaded', () => {
  renderHistory();
});

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = urlInput.value.trim();

  if (!url) {
    showError('Please enter a URL');
    return;
  }

  try {
    const response = await fetch('/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.error || 'Error shortening URL');
      return;
    }

    displayResult(data);
    addToHistory(data);
    urlInput.value = '';
  } catch (error) {
    showError('Failed to connect to server');
  }
});

// Display the result
function displayResult(data) {
  shortUrlOutput.value = data.shortUrl;
  originalUrlOutput.textContent = data.originalUrl;
  resultDiv.classList.remove('hidden');
  errorDiv.classList.add('hidden');
}

// Show error message
function showError(message) {
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
  resultDiv.classList.add('hidden');
}

// Copy to clipboard
copyBtn.addEventListener('click', () => {
  shortUrlOutput.select();
  document.execCommand('copy');

  copyBtn.textContent = '✓ Copied!';
  copyBtn.classList.add('copied');

  setTimeout(() => {
    copyBtn.textContent = 'Copy';
    copyBtn.classList.remove('copied');
  }, 2000);
});

// Add URL to history
function addToHistory(data) {
  const historyItem = {
    code: data.code,
    shortUrl: data.shortUrl,
    originalUrl: data.originalUrl,
    timestamp: new Date().toISOString()
  };

  // Remove duplicate if it exists
  recentUrls = recentUrls.filter(item => item.code !== data.code);

  // Add to beginning and keep only last 10
  recentUrls.unshift(historyItem);
  recentUrls = recentUrls.slice(0, 10);

  // Save to localStorage
  localStorage.setItem('recentUrls', JSON.stringify(recentUrls));

  renderHistory();
}

// Render history list
function renderHistory() {
  if (recentUrls.length === 0) {
    historyList.innerHTML = '<div class="empty-history">No shortened URLs yet</div>';
    return;
  }

  historyList.innerHTML = recentUrls
    .map(item => `
      <div class="history-item">
        <div class="history-item-code">
          <strong>${item.code}</strong>
          <span style="color: #999; font-weight: normal;"> → </span>
          <a href="${item.shortUrl}" target="_blank" style="color: #667eea; text-decoration: none;">${item.shortUrl}</a>
        </div>
        <div class="history-item-url">${item.originalUrl}</div>
      </div>
    `)
    .join('');
}
