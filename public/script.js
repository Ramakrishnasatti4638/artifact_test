const form = document.getElementById('shortenForm');
const urlInput = document.getElementById('urlInput');
const errorEl = document.getElementById('error');
const successEl = document.getElementById('success');
const resultSection = document.getElementById('resultSection');
const shortUrlDisplay = document.getElementById('shortUrlDisplay');
const copyBtn = document.getElementById('copyBtn');
const urlsList = document.getElementById('urlsList');

const API_BASE = window.location.origin;

// Form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessages();

  const url = urlInput.value.trim();
  if (!url) {
    showError('Please enter a URL');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.error || 'Failed to shorten URL');
      return;
    }

    const shortUrl = `${API_BASE}/${data.short}`;
    shortUrlDisplay.value = shortUrl;
    resultSection.style.display = 'block';
    showSuccess(`URL shortened successfully!`);
    urlInput.value = '';

    // Reload the list
    loadUrls();
  } catch (err) {
    showError('An error occurred. Please try again.');
    console.error(err);
  }
});

// Copy to clipboard
copyBtn.addEventListener('click', () => {
  shortUrlDisplay.select();
  document.execCommand('copy');
  
  const originalText = copyBtn.textContent;
  copyBtn.textContent = 'Copied!';
  setTimeout(() => {
    copyBtn.textContent = originalText;
  }, 2000);
});

// Load and display all URLs
async function loadUrls() {
  try {
    const response = await fetch(`${API_BASE}/api/urls`);
    const urls = await response.json();

    if (urls.length === 0) {
      urlsList.innerHTML = '<p class="empty-state">No URLs shortened yet</p>';
      return;
    }

    urlsList.innerHTML = urls
      .sort((a, b) => new Date(b.created) - new Date(a.created))
      .map(url => {
        const createdDate = new Date(url.created).toLocaleDateString();
        return `
          <div class="url-item">
            <div class="url-info">
              <div class="url-short">${API_BASE}/${url.short}</div>
              <div class="url-original" title="${url.original}">${truncateUrl(url.original)}</div>
              <div class="url-meta">Created: ${createdDate} • Clicks: ${url.clicks}</div>
            </div>
            <div class="url-actions">
              <button class="btn-small btn-visit" onclick="visitUrl('${url.short}')">Visit</button>
              <button class="btn-small btn-delete" onclick="deleteUrl('${url.short}')">Delete</button>
            </div>
          </div>
        `;
      })
      .join('');
  } catch (err) {
    console.error('Error loading URLs:', err);
  }
}

// Delete URL
async function deleteUrl(shortId) {
  if (!confirm('Are you sure you want to delete this shortened URL?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/urls/${shortId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      showError('Failed to delete URL');
      return;
    }

    clearMessages();
    showSuccess('URL deleted successfully');
    await loadUrls();
  } catch (err) {
    showError('An error occurred while deleting');
    console.error(err);
  }
}

// Visit URL
async function visitUrl(shortId) {
  try {
    // Increment clicks via API
    const response = await fetch(`${API_BASE}/api/visit/${shortId}`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      showError('Could not visit URL');
      return;
    }
    
    const urlData = await response.json();
    
    // Reload the list to show updated click count
    await loadUrls();
    
    // Open the original URL in a new tab
    window.open(urlData.original, '_blank');
  } catch (err) {
    console.error('Error visiting URL:', err);
    showError('An error occurred while visiting the URL');
  }
}

// Utility functions
function truncateUrl(url, length = 60) {
  return url.length > length ? url.substring(0, length) + '...' : url;
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.add('show');
}

function showSuccess(message) {
  successEl.textContent = message;
  successEl.classList.add('show');
}

function clearMessages() {
  errorEl.classList.remove('show');
  successEl.classList.remove('show');
}

// Load URLs on page load
loadUrls();
