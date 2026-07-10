const urlInput = document.getElementById('urlInput');
const customAlias = document.getElementById('customAlias');
const shortenBtn = document.getElementById('shortenBtn');
const result = document.getElementById('result');
const shortUrl = document.getElementById('shortUrl');
const copyBtn = document.getElementById('copyBtn');
const error = document.getElementById('error');
const linksBody = document.getElementById('linksBody');
const totalLinks = document.getElementById('totalLinks');
const totalClicks = document.getElementById('totalClicks');

async function shortenUrl() {
  const url = urlInput.value.trim();
  const alias = customAlias.value.trim();

  if (!url) {
    showError('Please enter a URL');
    return;
  }

  try {
    const response = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, customAlias: alias || undefined })
    });

    const data = await response.json();

    if (response.ok) {
      shortUrl.href = data.shortUrl;
      shortUrl.textContent = data.shortUrl;
      result.classList.remove('hidden');
      error.classList.add('hidden');
      urlInput.value = '';
      customAlias.value = '';
      loadLinks();
    } else {
      showError(data.error);
    }
  } catch (err) {
    showError('Failed to shorten URL');
  }
}

function showError(message) {
  error.textContent = message;
  error.classList.remove('hidden');
  result.classList.add('hidden');
}

async function loadLinks() {
  try {
    const response = await fetch('/api/links');
    const links = await response.json();

    if (links.length === 0) {
      linksBody.innerHTML = '<tr><td colspan="5" class="empty-state">No links yet. Create your first one above!</td></tr>';
    } else {
      linksBody.innerHTML = links.map(link => `
        <tr>
          <td class="url-cell" title="${link.originalUrl}">${link.originalUrl}</td>
          <td class="short-code">${link.shortCode}</td>
          <td>${link.clickCount}</td>
          <td>${new Date(link.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
          <td><button class="delete-btn" onclick="deleteLink('${link.shortCode}')">Delete</button></td>
        </tr>
      `).join('');
    }

    const stats = links.reduce((acc, link) => {
      acc.totalLinks++;
      acc.totalClicks += link.clickCount;
      return acc;
    }, { totalLinks: 0, totalClicks: 0 });

    totalLinks.textContent = stats.totalLinks;
    totalClicks.textContent = stats.totalClicks;
  } catch (err) {
    console.error('Failed to load links', err);
  }
}

async function deleteLink(shortCode) {
  if (!confirm('Are you sure you want to delete this link?')) return;

  try {
    const response = await fetch(`/api/links/${shortCode}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      loadLinks();
    }
  } catch (err) {
    alert('Failed to delete link');
  }
}

copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(shortUrl.href);
  copyBtn.textContent = 'Copied!';
  setTimeout(() => {
    copyBtn.textContent = 'Copy';
  }, 2000);
});

shortenBtn.addEventListener('click', shortenUrl);

urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') shortenUrl();
});

customAlias.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') shortenUrl();
});

loadLinks();
