const API_BASE_URL = '';

const shortenForm = document.getElementById('shortenForm');
const urlInput = document.getElementById('urlInput');
const errorMessage = document.getElementById('errorMessage');
const resultSection = document.getElementById('resultSection');
const shortUrlOutput = document.getElementById('shortUrlOutput');
const originalUrlOutput = document.getElementById('originalUrlOutput');
const createdAtOutput = document.getElementById('createdAtOutput');
const clicksOutput = document.getElementById('clicksOutput');
const copyBtn = document.getElementById('copyBtn');
const urlsList = document.getElementById('urlsList');

shortenForm.addEventListener('submit', handleShorten);
copyBtn.addEventListener('click', handleCopy);

async function handleShorten(e) {
  e.preventDefault();
  const url = urlInput.value.trim();
  errorMessage.textContent = '';

  try {
    const response = await fetch(`${API_BASE_URL}/api/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok) {
      errorMessage.textContent = data.error || 'Failed to shorten URL';
      resultSection.classList.add('hidden');
      return;
    }

    // Display result
    shortUrlOutput.value = data.shortUrl;
    originalUrlOutput.value = data.originalUrl;
    createdAtOutput.value = new Date(data.createdAt).toLocaleString();
    clicksOutput.value = data.clicks;
    resultSection.classList.remove('hidden');

    // Clear input
    urlInput.value = '';

    // Refresh list
    loadUrls();
  } catch (error) {
    errorMessage.textContent = 'Error: ' + error.message;
    resultSection.classList.add('hidden');
  }
}

function handleCopy() {
  const text = shortUrlOutput.value;
  navigator.clipboard.writeText(text).then(() => {
    const btn = copyBtn;
    const originalText = btn.textContent;
    btn.textContent = '✓ Copied!';
    btn.classList.add('copy-feedback');

    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('copy-feedback');
    }, 2000);
  });
}

async function loadUrls() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/urls`);
    const urls = await response.json();

    if (urls.length === 0) {
      urlsList.innerHTML = '<p class="empty-state">No URLs shortened yet. Create one above!</p>';
      return;
    }

    urlsList.innerHTML = urls
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(
        (item) => `
      <div class="url-item">
        <div class="url-item-content">
          <div class="url-item-short">${item.shortUrl}</div>
          <div class="url-item-original">${item.originalUrl}</div>
          <div class="url-item-meta">
            <span>📅 ${new Date(item.createdAt).toLocaleString()}</span>
            <span>👆 ${item.clicks} clicks</span>
          </div>
        </div>
        <div class="url-item-actions">
          <button class="btn-sm btn-copy" onclick="copyToClipboard('${item.shortUrl}')">
            Copy
          </button>
        </div>
      </div>
    `
      )
      .join('');
  } catch (error) {
    console.error('Error loading URLs:', error);
    urlsList.innerHTML = '<p class="empty-state">Error loading URLs</p>';
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓ Copied!';
    btn.style.backgroundColor = '#10b981';
    btn.style.color = 'white';

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.backgroundColor = '';
      btn.style.color = '';
    }, 2000);
  });
}

// Load URLs on page load
loadUrls();

// Auto-refresh stats every 30 seconds
setInterval(loadUrls, 30000);
