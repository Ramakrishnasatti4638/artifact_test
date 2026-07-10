// DOM Elements
const urlInput = document.getElementById('urlInput');
const customAlias = document.getElementById('customAlias');
const shortenBtn = document.getElementById('shortenBtn');
const errorMessage = document.getElementById('errorMessage');
const resultCard = document.getElementById('resultCard');
const shortUrlDisplay = document.getElementById('shortUrlDisplay');
const shortUrlLink = document.getElementById('shortUrlLink');
const copyBtn = document.getElementById('copyBtn');
const linksTableBody = document.getElementById('linksTableBody');
const totalLinksEl = document.getElementById('totalLinks');
const totalClicksEl = document.getElementById('totalClicks');

// Event Listeners
shortenBtn.addEventListener('click', shortenUrl);
copyBtn.addEventListener('click', copyToClipboard);

// Load links on page load
loadLinks();

// Shorten URL
async function shortenUrl() {
  const url = urlInput.value.trim();
  const alias = customAlias.value.trim();

  // Clear previous error
  errorMessage.textContent = '';
  resultCard.style.display = 'none';

  // Basic validation
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
    shortUrlDisplay.value = data.shortUrl;
    shortUrlLink.href = data.shortUrl;
    resultCard.style.display = 'block';

    // Clear form
    urlInput.value = '';
    customAlias.value = '';

    // Reload links
    loadLinks();

    // Scroll to result
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    showError('Network error. Please try again.');
  }
}

// Copy to clipboard
function copyToClipboard() {
  shortUrlDisplay.select();
  document.execCommand('copy');
  
  // Visual feedback
  const originalText = copyBtn.textContent;
  copyBtn.textContent = 'Copied!';
  copyBtn.style.background = '#059669';
  
  setTimeout(() => {
    copyBtn.textContent = originalText;
    copyBtn.style.background = '#10b981';
  }, 2000);
}

// Load all links
async function loadLinks() {
  try {
    const response = await fetch('/api/links');
    const links = await response.json();

    // Update stats
    const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);
    totalLinksEl.textContent = links.length;
    totalClicksEl.textContent = totalClicks;

    // Update table
    if (links.length === 0) {
      linksTableBody.innerHTML = '<tr><td colspan="5" class="no-data">No links created yet</td></tr>';
      return;
    }

    linksTableBody.innerHTML = links.map(link => {
      const shortUrl = `${window.location.origin}/${link.shortCode}`;
      const createdDate = new Date(link.createdAt).toLocaleDateString();
      const truncatedUrl = link.originalUrl.length > 50 
        ? link.originalUrl.substring(0, 50) + '...' 
        : link.originalUrl;

      return `
        <tr>
          <td class="url-cell" title="${link.originalUrl}">${truncatedUrl}</td>
          <td class="short-url-cell">
            <a href="${shortUrl}" target="_blank">${link.shortCode}</a>
          </td>
          <td class="click-count">${link.clickCount}</td>
          <td class="date-cell">${createdDate}</td>
          <td>
            <button class="btn btn-delete" onclick="deleteLink('${link.shortCode}')">Delete</button>
          </td>
        </tr>
      `;
    }).join('');
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
      method: 'DELETE',
    });

    if (response.ok) {
      loadLinks();
    } else {
      alert('Failed to delete link');
    }
  } catch (error) {
    alert('Network error. Please try again.');
  }
}

// Show error message
function showError(message) {
  errorMessage.textContent = message;
}

// Allow Enter key to submit
urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    shortenUrl();
  }
});

customAlias.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    shortenUrl();
  }
});
