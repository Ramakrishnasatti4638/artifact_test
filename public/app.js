const API_BASE = 'http://localhost:3000';

let allLinks = [];

document.addEventListener('DOMContentLoaded', () => {
  loadLinks();
  
  document.getElementById('shortenForm').addEventListener('submit', handleSubmit);
  document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
});

async function handleSubmit(e) {
  e.preventDefault();
  
  const urlInput = document.getElementById('urlInput');
  const customAliasInput = document.getElementById('customAliasInput');
  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error');
  
  resultDiv.classList.add('hidden');
  errorDiv.classList.add('hidden');
  
  const payload = {
    url: urlInput.value.trim()
  };
  
  if (customAliasInput.value.trim()) {
    payload.customAlias = customAliasInput.value.trim();
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/shorten`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to shorten URL');
    }
    
    const shortUrl = `${API_BASE}/${data.shortCode}`;
    document.getElementById('shortUrl').href = shortUrl;
    document.getElementById('shortUrl').textContent = shortUrl;
    resultDiv.classList.remove('hidden');
    
    urlInput.value = '';
    customAliasInput.value = '';
    
    loadLinks();
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.classList.remove('hidden');
  }
}

function copyToClipboard() {
  const shortUrl = document.getElementById('shortUrl').textContent;
  navigator.clipboard.writeText(shortUrl).then(() => {
    const copyBtn = document.getElementById('copyBtn');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  });
}

async function loadLinks() {
  try {
    const response = await fetch(`${API_BASE}/api/links`);
    allLinks = await response.json();
    
    updateStats();
    renderLinksTable();
  } catch (error) {
    console.error('Failed to load links:', error);
  }
}

function updateStats() {
  const totalLinks = allLinks.length;
  const totalClicks = allLinks.reduce((sum, link) => sum + link.clickCount, 0);
  
  document.getElementById('totalLinks').textContent = totalLinks;
  document.getElementById('totalClicks').textContent = totalClicks;
}

function renderLinksTable() {
  const tbody = document.getElementById('linksTableBody');
  
  if (allLinks.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No links yet. Create your first one above!</td></tr>';
    return;
  }
  
  tbody.innerHTML = allLinks.map(link => {
    const shortUrl = `${API_BASE}/${link.shortCode}`;
    const date = new Date(link.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `
      <tr>
        <td>
          <span class="url-truncate" title="${escapeHtml(link.originalUrl)}">
            ${escapeHtml(link.originalUrl)}
          </span>
        </td>
        <td>
          <a href="${shortUrl}" target="_blank" class="short-link">
            ${link.shortCode}
          </a>
        </td>
        <td><span class="click-count">${link.clickCount}</span></td>
        <td><span class="date-text">${date}</span></td>
        <td>
          <button class="btn btn-delete" onclick="deleteLink('${link.shortCode}')">
            Delete
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function deleteLink(shortCode) {
  if (!confirm(`Delete link "${shortCode}"?`)) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/links/${shortCode}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete link');
    }
    
    loadLinks();
  } catch (error) {
    alert('Error deleting link: ' + error.message);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
