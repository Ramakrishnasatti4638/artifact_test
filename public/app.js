// DOM elements
const shortenForm = document.getElementById('shortenForm');
const urlInput = document.getElementById('urlInput');
const aliasInput = document.getElementById('aliasInput');
const resultContainer = document.getElementById('result');
const shortUrlDisplay = document.getElementById('shortUrlDisplay');
const copyBtn = document.getElementById('copyBtn');
const linksTableBody = document.getElementById('linksTableBody');
const totalLinksEl = document.getElementById('totalLinks');
const totalClicksEl = document.getElementById('totalClicks');

// Initialize
loadLinks();

// Form submission
shortenForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const url = urlInput.value.trim();
  const customAlias = aliasInput.value.trim();

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
      alert(`Error: ${data.error}`);
      return;
    }

    // Show result
    shortUrlDisplay.value = data.shortUrl;
    resultContainer.style.display = 'block';

    // Reset form
    urlInput.value = '';
    aliasInput.value = '';

    // Reload links
    loadLinks();

  } catch (error) {
    alert('Failed to shorten URL. Please try again.');
    console.error(error);
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
      linksTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state">No links created yet</td>
        </tr>
      `;
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
          <td>
            <a href="${shortUrl}" class="short-url" target="_blank">${shortUrl}</a>
          </td>
          <td class="click-count">${link.clickCount}</td>
          <td class="date-cell">${createdDate}</td>
          <td>
            <button class="btn-delete" onclick="deleteLink('${link.shortCode}')">Delete</button>
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
      method: 'DELETE'
    });

    if (response.ok) {
      loadLinks();
    } else {
      alert('Failed to delete link');
    }
  } catch (error) {
    alert('Failed to delete link');
    console.error(error);
  }
}
