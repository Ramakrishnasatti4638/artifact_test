// DOM Elements
const urlInput = document.getElementById('urlInput');
const customAlias = document.getElementById('customAlias');
const shortenBtn = document.getElementById('shortenBtn');
const resultDiv = document.getElementById('result');
const shortUrlLink = document.getElementById('shortUrl');
const copyBtn = document.getElementById('copyBtn');
const linksTableBody = document.getElementById('linksTableBody');
const totalLinksEl = document.getElementById('totalLinks');
const totalClicksEl = document.getElementById('totalClicks');

// Event Listeners
shortenBtn.addEventListener('click', handleShorten);
copyBtn.addEventListener('click', copyToClipboard);

// Allow Enter key to submit
urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleShorten();
});

customAlias.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleShorten();
});

// Initialize
loadLinks();

// Shorten URL
async function handleShorten() {
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

    // Show result
    shortUrlLink.href = data.shortUrl;
    shortUrlLink.textContent = data.shortUrl;
    resultDiv.classList.remove('hidden');

    // Clear inputs
    urlInput.value = '';
    customAlias.value = '';

    // Reload links
    loadLinks();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// Copy to clipboard
async function copyToClipboard() {
  const url = shortUrlLink.textContent;
  
  try {
    await navigator.clipboard.writeText(url);
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✓ Copied!';
    copyBtn.style.background = '#059669';
    
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.background = '#10b981';
    }, 2000);
  } catch (error) {
    alert('Failed to copy to clipboard');
  }
}

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
        <td colspan="5" class="no-data">No links yet. Create your first short URL!</td>
      </tr>
    `;
    return;
  }

  linksTableBody.innerHTML = links.map(link => {
    const shortUrl = `${window.location.origin}/${link.shortCode}`;
    const date = new Date(link.createdAt).toLocaleDateString();
    const truncatedUrl = link.originalUrl.length > 50 
      ? link.originalUrl.substring(0, 50) + '...' 
      : link.originalUrl;

    return `
      <tr>
        <td>
          <div class="original-url" title="${link.originalUrl}">
            ${truncatedUrl}
          </div>
        </td>
        <td>
          <a href="${shortUrl}" class="short-link" target="_blank">
            ${link.shortCode}
          </a>
        </td>
        <td class="click-count">${link.clickCount}</td>
        <td>${date}</td>
        <td>
          <button class="delete-btn" onclick="deleteLink('${link.shortCode}')">
            Delete
          </button>
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
      alert('Failed to delete link');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}
