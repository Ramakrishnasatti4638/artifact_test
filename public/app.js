// DOM Elements
const shortenForm = document.getElementById('shortenForm');
const urlInput = document.getElementById('url');
const customAliasInput = document.getElementById('customAlias');
const resultContainer = document.getElementById('result');
const errorContainer = document.getElementById('error');
const shortUrlInput = document.getElementById('shortUrlInput');
const shortUrlLink = document.getElementById('shortUrlLink');
const copyBtn = document.getElementById('copyBtn');
const linksTableBody = document.getElementById('linksTableBody');
const totalLinksEl = document.getElementById('totalLinks');
const totalClicksEl = document.getElementById('totalClicks');

// Load all links on page load
document.addEventListener('DOMContentLoaded', () => {
  loadLinks();
});

// Form submission
shortenForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const url = urlInput.value.trim();
  const customAlias = customAliasInput.value.trim();

  // Hide previous results/errors
  resultContainer.style.display = 'none';
  errorContainer.style.display = 'none';

  try {
    const response = await fetch('/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
        customAlias: customAlias || undefined
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to shorten URL');
    }

    // Display result
    shortUrlInput.value = data.shortUrl;
    shortUrlLink.href = data.shortUrl;
    shortUrlLink.textContent = `Visit ${data.shortUrl}`;
    resultContainer.style.display = 'block';

    // Clear form
    urlInput.value = '';
    customAliasInput.value = '';

    // Reload links table
    loadLinks();

  } catch (error) {
    errorContainer.textContent = error.message;
    errorContainer.style.display = 'block';
  }
});

// Copy to clipboard
copyBtn.addEventListener('click', () => {
  shortUrlInput.select();
  document.execCommand('copy');
  
  const originalText = copyBtn.textContent;
  copyBtn.textContent = 'Copied!';
  setTimeout(() => {
    copyBtn.textContent = originalText;
  }, 2000);
});

// Load all links
async function loadLinks() {
  try {
    const response = await fetch('/api/links');
    const links = await response.json();

    if (links.length === 0) {
      linksTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state">No links yet. Create your first short link above!</td>
        </tr>
      `;
      totalLinksEl.textContent = '0';
      totalClicksEl.textContent = '0';
      return;
    }

    // Calculate stats
    const totalLinks = links.length;
    const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);

    totalLinksEl.textContent = totalLinks;
    totalClicksEl.textContent = totalClicks;

    // Render table
    linksTableBody.innerHTML = links.map(link => `
      <tr>
        <td class="url-cell" title="${escapeHtml(link.originalUrl)}">
          ${escapeHtml(truncate(link.originalUrl, 50))}
        </td>
        <td class="short-url-cell">
          <a href="/${escapeHtml(link.shortCode)}" target="_blank">
            ${window.location.origin}/${escapeHtml(link.shortCode)}
          </a>
        </td>
        <td class="click-count">${link.clickCount}</td>
        <td class="date-cell">${formatDate(link.createdAt)}</td>
        <td>
          <button class="btn-delete" onclick="deleteLink('${escapeHtml(link.shortCode)}')">
            Delete
          </button>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('Failed to load links:', error);
  }
}

// Delete link
async function deleteLink(shortCode) {
  if (!confirm('Are you sure you want to delete this link?')) {
    return;
  }

  try {
    const response = await fetch(`/api/links/${shortCode}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete link');
    }

    // Reload links
    loadLinks();

  } catch (error) {
    alert('Failed to delete link: ' + error.message);
  }
}

// Helper: Truncate text
function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Helper: Format date
function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

// Helper: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
