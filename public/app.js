const urlInput = document.getElementById('urlInput');
const shortenBtn = document.getElementById('shortenBtn');
const resultSection = document.getElementById('resultSection');
const originalUrlDisplay = document.getElementById('originalUrlDisplay');
const shortUrlDisplay = document.getElementById('shortUrlDisplay');
const copyBtn = document.getElementById('copyBtn');
const urlsList = document.getElementById('urlsList');
const errorMessage = document.getElementById('errorMessage');

const API_BASE_URL = 'http://localhost:3000/api';

// Load URLs on page load
document.addEventListener('DOMContentLoaded', loadUrls);

shortenBtn.addEventListener('click', shortenUrl);
copyBtn.addEventListener('click', copyToClipboard);
urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    shortenUrl();
  }
});

async function shortenUrl() {
  const originalUrl = urlInput.value.trim();

  if (!originalUrl) {
    showError('Please enter a URL');
    return;
  }

  hideError();

  try {
    const response = await fetch(`${API_BASE_URL}/shorten`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ originalUrl })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to shorten URL');
    }

    const data = await response.json();
    displayResult(data);
    urlInput.value = '';
    loadUrls();
  } catch (error) {
    showError(error.message);
  }
}

function displayResult(data) {
  originalUrlDisplay.textContent = data.originalUrl;
  shortUrlDisplay.href = data.shortUrl;
  shortUrlDisplay.textContent = data.shortUrl;
  resultSection.style.display = 'block';
}

function copyToClipboard() {
  const shortUrl = shortUrlDisplay.textContent;
  navigator.clipboard.writeText(shortUrl).then(() => {
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✓ Copied!';
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  }).catch(() => {
    showError('Failed to copy to clipboard');
  });
}

async function loadUrls() {
  try {
    const response = await fetch(`${API_BASE_URL}/urls`);
    if (!response.ok) throw new Error('Failed to load URLs');

    const urls = await response.json();
    displayUrls(urls);
  } catch (error) {
    console.error(error);
  }
}

function displayUrls(urls) {
  if (urls.length === 0) {
    urlsList.innerHTML = '<p class="empty-message">No URLs shortened yet</p>';
    return;
  }

  urlsList.innerHTML = urls.map(url => `
    <div class="url-item">
      <a href="${url.shortUrl}" class="url-item-short">${url.shortUrl}</a>
      <div class="url-item-original">${url.originalUrl}</div>
      <div class="url-item-label">Short ID: ${url.shortId}</div>
    </div>
  `).join('');
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
}

function hideError() {
  errorMessage.style.display = 'none';
}
