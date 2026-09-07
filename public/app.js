(() => {
  const form        = document.getElementById('shorten-form');
  const urlInput    = document.getElementById('url-input');
  const shortenBtn  = document.getElementById('shorten-btn');
  const btnText     = shortenBtn.querySelector('.btn-text');
  const btnSpinner  = shortenBtn.querySelector('.btn-spinner');
  const errorMsg    = document.getElementById('error-msg');
  const resultCard  = document.getElementById('result-card');
  const shortLink   = document.getElementById('short-link');
  const origPreview = document.getElementById('original-preview');
  const copyBtn     = document.getElementById('copy-btn');
  const copyIcon    = document.getElementById('copy-icon');
  const checkIcon   = document.getElementById('check-icon');
  const copyLabel   = document.getElementById('copy-label');
  const linksSection= document.getElementById('links-section');
  const linksTbody  = document.getElementById('links-tbody');

  // ── Shorten form ────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return showError('Please enter a URL.');

    setLoading(true);
    hideError();
    resultCard.hidden = true;

    try {
      const res  = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();

      if (!res.ok) return showError(data.error || 'Something went wrong.');

      showResult(data.shortUrl, url);
      loadLinks();
    } catch {
      showError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  });

  // ── Copy button ──────────────────────────────────────
  copyBtn.addEventListener('click', async () => {
    const url = shortLink.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    copyBtn.classList.add('copied');
    copyIcon.hidden = true;
    checkIcon.hidden = false;
    copyLabel.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyIcon.hidden = false;
      checkIcon.hidden = true;
      copyLabel.textContent = 'Copy';
    }, 2000);
  });

  // ── Load links table ─────────────────────────────────
  async function loadLinks() {
    try {
      const res   = await fetch('/api/links');
      const links = await res.json();

      if (!links.length) {
        linksSection.hidden = true;
        return;
      }

      linksSection.hidden = false;
      linksTbody.innerHTML = links.map(link => `
        <tr data-code="${link.shortCode}">
          <td><a href="${link.shortUrl}" target="_blank" rel="noopener noreferrer">${link.shortUrl}</a></td>
          <td class="td-original" title="${escHtml(link.originalUrl)}">${escHtml(link.originalUrl)}</td>
          <td><span class="clicks-badge">${link.clicks}</span></td>
          <td>${formatDate(link.createdAt)}</td>
          <td><button class="delete-btn" data-code="${link.shortCode}">Delete</button></td>
        </tr>
      `).join('');

      // Delete handlers
      linksTbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteLink(btn.dataset.code));
      });
    } catch {
      // silently fail
    }
  }

  async function deleteLink(code) {
    try {
      const res = await fetch(`/api/links/${code}`, { method: 'DELETE' });
      if (res.ok) {
        const row = linksTbody.querySelector(`tr[data-code="${code}"]`);
        if (row) row.remove();
        if (!linksTbody.querySelector('tr')) linksSection.hidden = true;
        // Hide result card if it shows this link
        if (shortLink.href.endsWith('/' + code)) resultCard.hidden = true;
      }
    } catch {
      // silently fail
    }
  }

  // ── Helpers ──────────────────────────────────────────
  function showResult(shortUrl, originalUrl) {
    shortLink.href = shortUrl;
    shortLink.textContent = shortUrl;
    origPreview.textContent = `→ ${originalUrl}`;
    resultCard.hidden = false;
    // reset copy state
    copyIcon.hidden = false;
    checkIcon.hidden = true;
    copyLabel.textContent = 'Copy';
    copyBtn.classList.remove('copied');
  }

  function setLoading(on) {
    shortenBtn.disabled = on;
    btnText.hidden = on;
    btnSpinner.hidden = !on;
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.hidden = false;
  }

  function hideError() {
    errorMsg.hidden = true;
  }

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // Initial load
  loadLinks();
})();
