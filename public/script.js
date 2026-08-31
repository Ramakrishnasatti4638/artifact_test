const urlInput = document.getElementById('urlInput');
const shortenBtn = document.getElementById('shortenBtn');
const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const urlsList = document.getElementById('urlsList');

shortenBtn.addEventListener('click', shortenUrl);
urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    shortenUrl();
  }
});

async function shortenUrl() {
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
      showError(data.error || 'Failed to shorten URL');
      return;
    }

    showSuccess(data);
    urlInput.value = '';
    loadUrls();
  } catch (error) {
    showError('An error occurred. Please try again.');
    console.error(error);
  }
}

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.style.display = 'block';
  successMsg.style.display = 'none';
}

function showSuccess(data) {
  document.getElementById('resultCode').textContent = data.shortCode;
  document.getElementById('resultUrl').textContent = data.shortUrl;
  document.getElementById('resultOriginal').textContent = data.originalUrl;
  successMsg.style.display = 'block';
  errorMsg.style.display = 'none';
}

async function loadUrls() {
  try {
    const response = await fetch('/api/urls');
    const urls = await response.json();

    if (urls.length === 0) {
      urlsList.innerHTML = '<p class="empty-message">No URLs shortened yet. Create one above!</p>';
      return;
    }

    urlsList.innerHTML = urls
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((item) => `
        <div class="url-item">
          <div class="url-item-content">
            <div class="url-item-row">
              <span class="url-item-label">Short Code:</span>
              <span class="url-item-value">${escapeHtml(item.shortCode)}</span>
            </div>
            <div class="url-item-row">
              <span class="url-item-label">Original:</span>
              <span class="url-item-value">${escapeHtml(item.originalUrl)}</span>
            </div>
            <div class="url-item-meta">
              <span>Created: ${new Date(item.createdAt).toLocaleDateString()}</span>
              <span>Clicks: ${item.clicks}</span>
            </div>
          </div>
          <div class="url-item-actions">
            <button class="btn-small btn-small-primary" onclick="copyToClipboard('${escapeHtml(item.shortCode)}')">Copy Code</button>
            <button class="btn-small btn-small-primary" onclick="copyUrl('${escapeHtml(item.shortCode)}')">Copy URL</button>
          </div>
        </div>
      `)
      .join('');
  } catch (error) {
    console.error('Failed to load URLs:', error);
  }
}

function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    copyText(element.textContent);
  }
}

function copyUrl(shortCode) {
  const url = `${window.location.origin}/${shortCode}`;
  copyText(url);
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    // Show brief feedback
    const originalText = event.target.textContent;
    event.target.textContent = 'Copied!';
    setTimeout(() => {
      event.target.textContent = originalText;
    }, 2000);
  });
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Load URLs on page load
loadUrls();
