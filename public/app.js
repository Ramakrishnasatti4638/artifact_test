const form = document.getElementById('shorten-form');
const urlInput = document.getElementById('url-input');
const submitBtn = document.getElementById('submit-btn');
const btnText = submitBtn.querySelector('.btn-text');
const btnSpinner = submitBtn.querySelector('.btn-spinner');
const errorMsg = document.getElementById('error-msg');

const resultSection = document.getElementById('result-section');
const shortUrlLink = document.getElementById('short-url-link');
const originalUrlEl = document.getElementById('original-url');
const visitCount = document.getElementById('visit-count');
const copyBtn = document.getElementById('copy-btn');
const copyLabel = document.getElementById('copy-label');

const historySection = document.getElementById('history-section');
const historyList = document.getElementById('history-list');

const history = [];

// Pre-fill from query param error
const params = new URLSearchParams(window.location.search);
if (params.get('error') === 'not_found') {
  showError('Short link not found. It may have expired or never existed.');
  window.history.replaceState({}, '', '/');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = urlInput.value.trim();
  if (!url) return;

  setLoading(true);
  hideError();

  try {
    const res = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Something went wrong.');
      return;
    }

    displayResult(data, url);
    addToHistory(data, url);
  } catch {
    showError('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
});

function displayResult(data, originalUrl) {
  shortUrlLink.href = data.shortUrl;
  shortUrlLink.textContent = data.shortUrl;
  originalUrlEl.textContent = originalUrl;
  visitCount.textContent = data.visits;
  resetCopyBtn();
  resultSection.hidden = false;
}

function addToHistory(data, originalUrl) {
  // Avoid duplicates
  if (history.some(h => h.shortUrl === data.shortUrl)) return;
  history.unshift({ shortUrl: data.shortUrl, originalUrl });
  if (history.length > 10) history.pop();
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = '';
  history.forEach(({ shortUrl, originalUrl }) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `
      <a class="short" href="${escHtml(shortUrl)}" target="_blank" rel="noopener noreferrer">${escHtml(shortUrl)}</a>
      <span class="orig" title="${escHtml(originalUrl)}">${escHtml(originalUrl)}</span>
      <button class="hist-copy" title="Copy" data-url="${escHtml(shortUrl)}">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      </button>`;
    historyList.appendChild(li);
  });

  historyList.querySelectorAll('.hist-copy').forEach(btn => {
    btn.addEventListener('click', () => copyToClipboard(btn.dataset.url, btn));
  });

  historySection.hidden = false;
}

copyBtn.addEventListener('click', () => {
  copyToClipboard(shortUrlLink.href, copyBtn);
});

function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const label = btn.querySelector('span') || btn;
    if (btn === copyBtn) {
      copyLabel.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(resetCopyBtn, 2000);
    } else {
      btn.style.color = 'var(--success)';
      setTimeout(() => { btn.style.color = ''; }, 2000);
    }
  });
}

function resetCopyBtn() {
  copyLabel.textContent = 'Copy';
  copyBtn.classList.remove('copied');
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  btnText.hidden = loading;
  btnSpinner.hidden = !loading;
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.hidden = false;
}

function hideError() {
  errorMsg.hidden = true;
}

function escHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
