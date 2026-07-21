// DOM Elements
const shortenForm = document.getElementById('shortenForm');
const urlInput = document.getElementById('urlInput');
const customAlias = document.getElementById('customAlias');
const resultDiv = document.getElementById('result');
const shortUrlLink = document.getElementById('shortUrl');
const copyBtn = document.getElementById('copyBtn');
const linksTableBody = document.getElementById('linksTableBody');
const totalLinksEl = document.getElementById('totalLinks');
const totalClicksEl = document.getElementById('totalClicks');

// Load links on page load
document.addEventListener('DOMContentLoaded', () => {
  loadLinks();
});

// Form submission
shortenForm.addEventListener('submit', async (e) => {
  e.preventDefault();

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
      alert(data.error || 'Failed to shorten URL');
      return;
    }

    // Show result
    shortUrlLink.href = data.shortUrl;
    shortUrlLink.textContent = data.shortUrl;
    resultDiv.classList.remove('hidden');

    // Reset form
    urlInput.value = '';
    customAlias.value = '';

    // Reload links
    loadLinks();
  } catch (error) {
    alert('Error: ' + error.message);
  }
});

// Copy to clipboard
copyBtn.addEventListener('click', async () => {
  const url = shortUrlLink.textContent;
  
  try {
    await navigator.clipboard.writeText(url);
    copyBtn.textContent = '✓ Copied!';
    copyBtn.style.background = '#38a169';
    
    setTimeout(() => {
      copyBtn.textContent = '📋 Copy';
      copyBtn.style.background = '#48bb78';
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

    updateStats(links);
    renderLinksTable(links);
  } catch (error) {
    console.error('Error loading links:', error);
  }
}

// Update stats
function updateStats(links) {
  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);

  totalLinksEl.textContent = totalLinks;
  totalClicksEl.textContent = totalClicks;
}

// Render links table
function renderLinksTable(links) {
  if (links.length === 0) {
    linksTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">No links yet. Create your first short link!</td>
      </tr>
    `;
    return;
  }

  linksTableBody.innerHTML = links.map(link => {
    const shortUrl = `${window.location.origin}/${link.shortCode}`;
    const truncatedUrl = link.originalUrl.length > 50 
      ? link.originalUrl.substring(0, 50) + '...' 
      : link.originalUrl;
    const date = new Date(link.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return `
      <tr>
        <td class="url-cell" title="${link.originalUrl}">
          <a href="${link.originalUrl}" target="_blank">${truncatedUrl}</a>
        </td>
        <td>
          <a href="${shortUrl}" target="_blank" class="short-code">${link.shortCode}</a>
        </td>
        <td class="click-count">${link.clickCount}</td>
        <td class="date-cell">${date}</td>
        <td>
          <button class="btn btn-delete" onclick="deleteLink('${link.shortCode}')">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
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
      const data = await response.json();
      alert(data.error || 'Failed to delete link');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}
