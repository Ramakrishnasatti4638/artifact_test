/* ── DOM Refs ── */
const form        = document.getElementById('shorten-form');
const urlInput    = document.getElementById('url-input');
const slugInput   = document.getElementById('slug-input');
const shortenBtn  = document.getElementById('shorten-btn');
const btnLabel    = shortenBtn.querySelector('.btn-label');
const btnSpinner  = shortenBtn.querySelector('.btn-spinner');

const resultBanner = document.getElementById('result-banner');
const resultLink   = document.getElementById('result-link');
const resultMeta   = document.getElementById('result-meta');
const copyBtn      = document.getElementById('copy-btn');
const errorBanner  = document.getElementById('error-banner');

const refreshBtn  = document.getElementById('refresh-btn');
const urlTable    = document.getElementById('url-table');
const urlTbody    = document.getElementById('url-tbody');
const emptyMsg    = document.getElementById('empty-msg');

/* ── Utilities ── */
function showError(msg) {
  errorBanner.textContent = msg;
  errorBanner.classList.remove('hidden');
  resultBanner.classList.add('hidden');
}

function clearMessages() {
  errorBanner.classList.add('hidden');
  resultBanner.classList.add('hidden');
}

function setLoading(loading) {
  shortenBtn.disabled = loading;
  btnLabel.classList.toggle('hidden', loading);
  btnSpinner.classList.toggle('hidden', !loading);
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── Shorten ── */
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessages();
  setLoading(true);

  const url        = urlInput.value.trim();
  const customSlug = slugInput.value.trim();

  try {
    const res = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, customSlug: customSlug || undefined }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Something went wrong.');
    } else {
      resultLink.href        = data.shortUrl;
      resultLink.textContent = data.shortUrl;
      resultMeta.textContent = `Created successfully · 0 clicks so far`;
      resultBanner.classList.remove('hidden');
      copyBtn.classList.remove('copied');
      copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`;
      form.reset();
      loadURLs();
    }
  } catch {
    showError('Network error — is the server running?');
  } finally {
    setLoading(false);
  }
});

/* ── Copy ── */
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(resultLink.href);
    copyBtn.classList.add('copied');
    copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
    setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`;
    }, 2000);
  } catch {
    /* clipboard not available in non-secure context */
  }
});

/* ── Load URLs ── */
async function loadURLs() {
  try {
    const res  = await fetch('/api/urls');
    const list = await res.json();

    if (!list.length) {
      urlTable.classList.add('hidden');
      emptyMsg.classList.remove('hidden');
      return;
    }

    emptyMsg.classList.add('hidden');
    urlTable.classList.remove('hidden');
    urlTbody.innerHTML = list.map(item => `
      <tr data-slug="${escHtml(item.slug)}">
        <td class="td-short"><a href="${escHtml(item.shortUrl)}" target="_blank" rel="noopener noreferrer">${escHtml(item.shortUrl)}</a></td>
        <td class="td-original" title="${escHtml(item.original)}">${escHtml(item.original)}</td>
        <td><span class="badge-clicks">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          ${item.clicks}
        </span></td>
        <td class="td-date">${formatDate(item.created)}</td>
        <td>
          <button class="btn-delete" title="Delete" onclick="deleteURL('${escHtml(item.slug)}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </td>
      </tr>
    `).join('');
  } catch {
    /* silently ignore refresh errors */
  }
}

/* ── Delete ── */
async function deleteURL(slug) {
  if (!confirm(`Delete /${slug}?`)) return;
  try {
    await fetch(`/api/urls/${encodeURIComponent(slug)}`, { method: 'DELETE' });
    loadURLs();
  } catch {
    alert('Failed to delete.');
  }
}

/* ── XSS guard ── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ── Refresh button ── */
refreshBtn.addEventListener('click', loadURLs);

/* ── Init ── */
loadURLs();
