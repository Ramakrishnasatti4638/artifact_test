// DOM elements
const urlInput = document.getElementById('urlInput');
const customAlias = document.getElementById('customAlias');
const shortenBtn = document.getElementById('shortenBtn');
const result = document.getElementById('result');
const shortUrl = document.getElementById('shortUrl');
const copyBtn = document.getElementById('copyBtn');
const error = document.getElementById('error');
const linksTableBody = document.getElementById('linksTableBody');
const totalLinksEl = document.getElementById('totalLinks');
const totalClicksEl = document.getElementById('totalClicks');

// Event listeners
shortenBtn.addEventListener('click', shortenUrl);
copyBtn.addEventListener('click', copyToClipboard);

// Load links on page load
document.addEventListener('DOMContentLoaded', loadLinks);

// Shorten URL
async function shortenUrl() {
  const url = urlInput.value.trim();
  const alias = customAlias.value.trim();

  // Hide previous results/errors
  result.style.display = 'none';
  error.style.display = 'none';

  if (!url) {
    showError('Please enter a URL');
    return;
  }

  try {
    const response = await fetch('/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, customAlias: alias || undefined }),
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.error || 'Failed to shorten URL');
      return;
    }

    // Show result
    shortUrl.href = data.shortUrl;
    shortUrl.textContent = data.shortUrl;
    result.style.display = 'block';

    // Clear inputs
    urlInput.value = '';
    customAlias.value = '';

    // Reload links
    loadLinks();
  } catch (err) {
    showError('Network error. Please try again.');
  }
}

// Copy to clipboard
async function copyToClipboard() {
  const url = shortUrl.textContent;
  
  try {
    await navigator.clipboard.writeText(url);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = 'Copy';
    }, 2000);
  } catch (err) {
    showError('Failed to copy to clipboard');
  }
}

// Load all links
async function loadLinks() {
  try {
    const response = await fetch('/api/links');
    const links = await response.json();

    // Update stats
    totalLinksEl.textContent = links.length;
    const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);
    totalClicksEl.textContent = totalClicks;

    // Update table
    if (links.length === 0) {
      linksTableBody.innerHTML = `
        <tr class="empty-state">
          <td colspan="5">No links yet. Create your first shortened link above!</td>
        </tr>
      `;
      return;
    }

    linksTableBody.innerHTML = links.map(link => `
      <tr>
        <td class="url-cell" title="${escapeHtml(link.originalUrl)}">${escapeHtml(truncateUrl(link.originalUrl, 50))}</td>
        <td><a href="/${link.shortCode}" target="_blank" class="short-url">${window.location.origin}/${link.shortCode}</a></td>
        <td class="click-count">${link.clickCount}</td>
        <td class="date-cell">${formatDate(link.createdAt)}</td>
        <td><button class="btn-delete" onclick="deleteLink('${link.shortCode}')">Delete</button></td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Failed to load links:', err);
  }
}

// Delete link
async function deleteLink(shortCode) {
  if (!confirm('Are you sure you want to delete this link?')) {
    return;
  }

  try {
    const response = await fetch(`/api/links/${shortCode}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      loadLinks();
    } else {
      showError('Failed to delete link');
    }
  } catch (err) {
    showError('Network error. Please try again.');
  }
}

// Helper functions
function showError(message) {
  error.textContent = message;
  error.style.display = 'block';
}

function truncateUrl(url, maxLength) {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + '...';
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Allow Enter key to submit
urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') shortenUrl();
});

customAlias.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') shortenUrl();
});
