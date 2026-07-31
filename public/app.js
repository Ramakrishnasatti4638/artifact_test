// DOM Elements
const shortenForm = document.getElementById('shortenForm');
const urlInput = document.getElementById('urlInput');
const customAliasInput = document.getElementById('customAliasInput');
const resultSection = document.getElementById('resultSection');
const shortUrlLink = document.getElementById('shortUrlLink');
const copyBtn = document.getElementById('copyBtn');
const copyMessage = document.getElementById('copyMessage');
const linksTableBody = document.getElementById('linksTableBody');
const totalLinksEl = document.getElementById('totalLinks');
const totalClicksEl = document.getElementById('totalClicks');

// Initialize
loadLinks();

// Form submit handler
shortenForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const url = urlInput.value.trim();
  const customAlias = customAliasInput.value.trim();

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

    // Display result
    shortUrlLink.href = data.shortUrl;
    shortUrlLink.textContent = data.shortUrl;
    resultSection.style.display = 'block';

    // Reset form
    urlInput.value = '';
    customAliasInput.value = '';

    // Reload links table
    loadLinks();

    // Scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    alert('An error occurred. Please try again.');
    console.error('Error:', error);
  }
});

// Copy to clipboard
copyBtn.addEventListener('click', async () => {
  const url = shortUrlLink.textContent;

  try {
    await navigator.clipboard.writeText(url);
    copyMessage.style.display = 'block';

    setTimeout(() => {
      copyMessage.style.display = 'none';
    }, 2000);
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

    copyMessage.style.display = 'block';
    setTimeout(() => {
      copyMessage.style.display = 'none';
    }, 2000);
  }
});

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
          <td colspan="5">No links created yet. Start by shortening a URL above!</td>
        </tr>
      `;
      return;
    }

    linksTableBody.innerHTML = links.map(link => {
      const shortUrl = `${window.location.origin}/${link.shortCode}`;
      const createdDate = new Date(link.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      return `
        <tr>
          <td>
            <div class="original-url" title="${escapeHtml(link.originalUrl)}">
              ${escapeHtml(link.originalUrl)}
            </div>
          </td>
          <td>
            <a href="${shortUrl}" class="short-url" target="_blank">
              ${link.shortCode}
            </a>
          </td>
          <td class="click-count">${link.clickCount}</td>
          <td class="created-date">${createdDate}</td>
          <td>
            <button class="btn-delete" onclick="deleteLink('${link.shortCode}')">
              Delete
            </button>
          </td>
        </tr>
      `;
    }).join('');
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
      alert('Error deleting link');
    }
  } catch (error) {
    alert('An error occurred. Please try again.');
    console.error('Error:', error);
  }
}

// Helper function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Refresh links every 5 seconds to show updated click counts
setInterval(loadLinks, 5000);
