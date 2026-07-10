// State
let allLinks = [];

// DOM Elements
const shortenForm = document.getElementById('shortenForm');
const urlInput = document.getElementById('urlInput');
const customAlias = document.getElementById('customAlias');
const resultContainer = document.getElementById('resultContainer');
const errorContainer = document.getElementById('errorContainer');
const errorMessage = document.getElementById('errorMessage');
const shortUrlResult = document.getElementById('shortUrlResult');
const copyBtn = document.getElementById('copyBtn');
const linksTableBody = document.getElementById('linksTableBody');
const totalLinksEl = document.getElementById('totalLinks');
const totalClicksEl = document.getElementById('totalClicks');

// Initialize
loadLinks();

// Event Listeners
shortenForm.addEventListener('submit', handleShortenSubmit);
copyBtn.addEventListener('click', handleCopy);

// Form submission handler
async function handleShortenSubmit(e) {
  e.preventDefault();
  hideMessages();

  const url = urlInput.value.trim();
  const alias = customAlias.value.trim();

  try {
    const response = await fetch('/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
        customAlias: alias || undefined
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.error || 'Failed to shorten URL');
      return;
    }

    showSuccess(data.shortUrl);
    shortenForm.reset();
    loadLinks();
  } catch (error) {
    showError('Network error. Please try again.');
  }
}

// Copy to clipboard handler
function handleCopy() {
  shortUrlResult.select();
  document.execCommand('copy');
  
  const originalText = copyBtn.textContent;
  copyBtn.textContent = 'Copied!';
  setTimeout(() => {
    copyBtn.textContent = originalText;
  }, 2000);
}

// Delete link handler
async function handleDelete(shortCode) {
  if (!confirm('Are you sure you want to delete this link?')) {
    return;
  }

  try {
    const response = await fetch(`/api/links/${shortCode}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      loadLinks();
    } else {
      showError('Failed to delete link');
    }
  } catch (error) {
    showError('Network error. Please try again.');
  }
}

// Load all links
async function loadLinks() {
  try {
    const response = await fetch('/api/links');
    allLinks = await response.json();
    renderLinks();
    updateStats();
  } catch (error) {
    console.error('Failed to load links:', error);
  }
}

// Render links table
function renderLinks() {
  if (allLinks.length === 0) {
    linksTableBody.innerHTML = '<tr><td colspan="5" class="no-data">No links created yet</td></tr>';
    return;
  }

  linksTableBody.innerHTML = allLinks.map(link => {
    const shortUrl = `${window.location.origin}/${link.shortCode}`;
    const date = new Date(link.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    return `
      <tr>
        <td class="url-cell" title="${link.originalUrl}">${link.originalUrl}</td>
        <td>
          <a href="${shortUrl}" class="short-url-link" target="_blank">${link.shortCode}</a>
        </td>
        <td class="click-count">${link.clickCount}</td>
        <td class="date-cell">${date}</td>
        <td>
          <button class="btn-delete" onclick="handleDelete('${link.shortCode}')">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Update stats
function updateStats() {
  totalLinksEl.textContent = allLinks.length;
  const totalClicks = allLinks.reduce((sum, link) => sum + link.clickCount, 0);
  totalClicksEl.textContent = totalClicks;
}

// Show success message
function showSuccess(shortUrl) {
  resultContainer.style.display = 'block';
  shortUrlResult.value = shortUrl;
}

// Show error message
function showError(message) {
  errorContainer.style.display = 'block';
  errorMessage.textContent = message;
}

// Hide messages
function hideMessages() {
  resultContainer.style.display = 'none';
  errorContainer.style.display = 'none';
}
