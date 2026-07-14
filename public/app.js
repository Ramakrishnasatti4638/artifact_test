const urlInput = document.getElementById('urlInput');
const customAliasInput = document.getElementById('customAliasInput');
const shortenBtn = document.getElementById('shortenBtn');
const result = document.getElementById('result');
const shortLink = document.getElementById('shortLink');
const copyBtn = document.getElementById('copyBtn');
const errorEl = document.getElementById('error');
const totalLinksEl = document.getElementById('totalLinks');
const totalClicksEl = document.getElementById('totalClicks');
const tbody = document.querySelector('#linksTable tbody');

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.classList.remove('hidden');
  result.classList.add('hidden');
}

function hideError() {
  errorEl.classList.add('hidden');
}

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

function truncate(text, max = 50) {
  if (text.length <= max) return text;
  return text.slice(0, max) + '...';
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (m) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
  );
}

async function loadLinks() {
  try {
    const res = await fetch('/api/links');
    const links = await res.json();

    totalLinksEl.textContent = links.length;
    totalClicksEl.textContent = links.reduce((sum, l) => sum + l.clickCount, 0);

    tbody.innerHTML = '';
    links.forEach((link) => {
      const shortUrl = `${window.location.origin}/${link.shortCode}`;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td title="${escapeHtml(link.originalUrl)}">${escapeHtml(truncate(link.originalUrl))}</td>
        <td><a href="${escapeHtml(shortUrl)}" target="_blank">${escapeHtml(shortUrl)}</a></td>
        <td>${link.clickCount}</td>
        <td>${formatDate(link.createdAt)}</td>
        <td><button class="delete-btn" data-code="${escapeHtml(link.shortCode)}">Delete</button></td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    showError('Failed to load links');
  }
}

shortenBtn.addEventListener('click', async () => {
  hideError();
  const url = urlInput.value.trim();
  const customAlias = customAliasInput.value.trim() || undefined;

  if (!url) {
    showError('Please enter a URL');
    return;
  }

  const res = await fetch('/api/shorten', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, customAlias }),
  });
  const data = await res.json();

  if (!res.ok) {
    showError(data.error || 'Failed to shorten URL');
    return;
  }

  const shortUrl = `${window.location.origin}/${data.shortCode}`;
  shortLink.href = shortUrl;
  shortLink.textContent = shortUrl;
  result.classList.remove('hidden');

  urlInput.value = '';
  customAliasInput.value = '';
  await loadLinks();
});

copyBtn.addEventListener('click', async () => {
  const text = shortLink.textContent;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = 'Copied!';
  } catch (err) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    copyBtn.textContent = 'Copied!';
  }
  setTimeout(() => {
    copyBtn.textContent = 'Copy';
  }, 1500);
});

tbody.addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const code = e.target.getAttribute('data-code');
    await fetch(`/api/links/${code}`, { method: 'DELETE' });
    await loadLinks();
  }
});

loadLinks();
