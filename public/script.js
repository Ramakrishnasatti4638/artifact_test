const API_BASE = '';

// DOM Elements
const form = document.getElementById('shortenForm');
const longUrlInput = document.getElementById('longUrl');
const customAliasInput = document.getElementById('customAlias');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');
const shortUrlDisplay = document.getElementById('shortUrlDisplay');
const longUrlDisplay = document.getElementById('longUrlDisplay');
const urlsList = document.getElementById('urlsList');

// Form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const longUrl = longUrlInput.value.trim();
  const customAlias = customAliasInput.value.trim();
  
  hideError();
  
  try {
    const response = await fetch(`${API_BASE}/api/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        longUrl,
        customAlias: customAlias || undefined
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      showError(data.error || 'Failed to shorten URL');
      return;
    }
    
    // Display result
    shortUrlDisplay.textContent = data.shortUrl;
    longUrlDisplay.textContent = data.longUrl;
    resultDiv.classList.remove('hidden');
    
    // Clear form
    longUrlInput.value = '';
    customAliasInput.value = '';
    
    // Refresh list
    loadUrls();
    
  } catch (error) {
    showError('Error creating shortened URL: ' + error.message);
  }
});

// Copy to clipboard
function copyToClipboard() {
  const text = shortUrlDisplay.textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  }).catch(() => {
    showError('Failed to copy to clipboard');
  });
}

// Load and display all URLs
async function loadUrls() {
  try {
    const response = await fetch(`${API_BASE}/api/urls`);
    const urls = await response.json();
    
    if (urls.length === 0) {
      urlsList.innerHTML = '<p class="empty-state">No URLs shortened yet. Create one above!</p>';
      return;
    }
    
    urlsList.innerHTML = urls.map(url => `
      <div class="url-item">
        <div class="url-item-row">
          <div class="url-item-content">
            <div class="url-item-label">Short URL</div>
            <div class="url-item-value">${escapeHtml(url.shortUrl)}</div>
          </div>
          <div class="url-item-actions">
            <button type="button" class="btn btn-small btn-primary" onclick="copyUrl('${escapeHtml(url.shortUrl)}')">Copy</button>
            <button type="button" class="btn btn-small btn-danger" onclick="deleteUrl('${escapeHtml(url.shortCode)}')">Delete</button>
          </div>
        </div>
        <div class="url-item-meta">
          <span>
            <strong>Original:</strong> 
            <span>${escapeHtml(url.longUrl.substring(0, 50))}${url.longUrl.length > 50 ? '...' : ''}</span>
          </span>
          <span>
            <strong>Created:</strong> 
            <span>${new Date(url.createdAt).toLocaleDateString()} ${new Date(url.createdAt).toLocaleTimeString()}</span>
          </span>
          <span>
            <strong>Clicks:</strong> 
            <span>${url.clicks}</span>
          </span>
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Error loading URLs:', error);
  }
}

// Copy individual URL
async function copyUrl(url) {
  try {
    await navigator.clipboard.writeText(url);
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  } catch (error) {
    showError('Failed to copy URL');
  }
}

// Delete URL
async function deleteUrl(code) {
  if (!confirm('Are you sure you want to delete this shortened URL?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/urls/${code}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      showError('Failed to delete URL');
      return;
    }
    
    loadUrls();
  } catch (error) {
    showError('Error deleting URL: ' + error.message);
  }
}

// Helper functions
function showError(message) {
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
  resultDiv.classList.add('hidden');
}

function hideError() {
  errorDiv.classList.add('hidden');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Load URLs on page load
loadUrls();
