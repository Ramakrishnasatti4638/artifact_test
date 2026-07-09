const urlInput = document.getElementById('urlInput');
const customAlias = document.getElementById('customAlias');
const shortenBtn = document.getElementById('shortenBtn');
const result = document.getElementById('result');
const shortUrl = document.getElementById('shortUrl');
const copyBtn = document.getElementById('copyBtn');
const linksTableBody = document.getElementById('linksTableBody');
const totalLinksEl = document.getElementById('totalLinks');
const totalClicksEl = document.getElementById('totalClicks');

// Load links on page load
document.addEventListener('DOMContentLoaded', () => {
  loadLinks();
});

// Shorten URL
shortenBtn.addEventListener('click', async () => {
  const url = urlInput.value.trim();
  const alias = customAlias.value.trim();

  if (!url) {
    alert('Please enter a URL');
    return;
  }

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
      alert(data.error || 'Failed to shorten URL');
      return;
    }

    // Display result
    shortUrl.href = data.shortUrl;
    shortUrl.textContent = data.shortUrl;
    result.classList.remove('hidden');

    // Clear inputs
    urlInput.value = '';
    customAlias.value = '';

    // Reload links
    loadLinks();
  } catch (error) {
    alert('Error shortening URL: ' + error.message);
  }
});

// Copy to clipboard
copyBtn.addEventListener('click', async () => {
  const url = shortUrl.textContent;
  
  try {
    await navigator.clipboard.writeText(url);
    copyBtn.textContent = '✓ Copied!';
    copyBtn.classList.add('copied');
    
    setTimeout(() => {
      copyBtn.textContent = '📋 Copy';
      copyBtn.classList.remove('copied');
    }, 2000);
  } catch (error) {
    alert('Failed to copy to clipboard');
  }
});

// Load all links
async function loadLinks() {
  try {
    const response = await fetch('/api/links');
    const links = await response.json();

    if (links.length === 0) {
      linksTableBody.innerHTML = `
        <tr class="empty-state">
          <td colspan="5">No links yet. Create your first one above!</td>
        </tr>
      `;
      totalLinksEl.textContent = '0';
      totalClicksEl.textContent = '0';
      return;
    }

    // Update stats
    totalLinksEl.textContent = links.length;
    totalClicksEl.textContent = links.reduce((sum, link) => sum + link.clickCount, 0);

    // Render table
    linksTableBody.innerHTML = links.map(link => `
      <tr>
        <td>
          <span class="original-url" title="${escapeHtml(link.originalUrl)}">
            ${escapeHtml(link.originalUrl)}
          </span>
        </td>
        <td>
          <a href="/${link.shortCode}" class="short-link" target="_blank">
            ${window.location.origin}/${link.shortCode}
          </a>
        </td>
        <td class="click-count">${link.clickCount}</td>
        <td class="date">${formatDate(link.createdAt)}</td>
        <td>
          <button class="btn-delete" onclick="deleteLink('${link.shortCode}')">
            Delete
          </button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading links:', error);
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

    if (response.ok) {
      loadLinks();
    } else {
      alert('Failed to delete link');
    }
  } catch (error) {
    alert('Error deleting link: ' + error.message);
  }
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
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

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Allow Enter key to shorten
urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    shortenBtn.click();
  }
});

customAlias.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    shortenBtn.click();
  }
});
