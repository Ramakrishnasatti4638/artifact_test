'use strict';

const form = document.getElementById('shorten-form');
const urlInput = document.getElementById('url');
const aliasInput = document.getElementById('alias');
const formError = document.getElementById('form-error');
const result = document.getElementById('result');
const resultLink = document.getElementById('result-link');
const copyBtn = document.getElementById('copy-btn');
const totalLinksEl = document.getElementById('total-links');
const totalClicksEl = document.getElementById('total-clicks');
const linksBody = document.getElementById('links-body');
const emptyState = document.getElementById('empty-state');

function truncate(text, max = 45) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

async function fetchLinks() {
  const res = await fetch('/api/links');
  const links = await res.json();
  renderLinks(links);
}

function renderLinks(links) {
  linksBody.innerHTML = '';
  const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);
  totalLinksEl.textContent = String(links.length);
  totalClicksEl.textContent = String(totalClicks);

  emptyState.style.display = links.length === 0 ? 'block' : 'none';

  links.forEach((link) => {
    const row = document.createElement('tr');

    const originalCell = document.createElement('td');
    originalCell.className = 'original-url';
    originalCell.title = link.originalUrl;
    originalCell.textContent = truncate(link.originalUrl);

    const shortCell = document.createElement('td');
    const shortAnchor = document.createElement('a');
    shortAnchor.href = link.shortUrl;
    shortAnchor.target = '_blank';
    shortAnchor.rel = 'noopener';
    shortAnchor.textContent = link.shortCode;
    shortCell.appendChild(shortAnchor);

    const clicksCell = document.createElement('td');
    clicksCell.textContent = String(link.clickCount);

    const createdCell = document.createElement('td');
    createdCell.textContent = formatDate(link.createdAt);

    const actionCell = document.createElement('td');
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteLink(link.shortCode));
    actionCell.appendChild(deleteBtn);

    row.append(originalCell, shortCell, clicksCell, createdCell, actionCell);
    linksBody.appendChild(row);
  });
}

async function deleteLink(shortCode) {
  await fetch(`/api/links/${encodeURIComponent(shortCode)}`, {
    method: 'DELETE',
  });
  fetchLinks();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  formError.textContent = '';
  result.classList.add('hidden');

  const body = { url: urlInput.value.trim() };
  const alias = aliasInput.value.trim();
  if (alias) {
    body.customAlias = alias;
  }

  const res = await fetch('/api/shorten', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    formError.textContent = data.error || 'Something went wrong.';
    return;
  }

  resultLink.href = data.shortUrl;
  resultLink.textContent = data.shortUrl;
  result.classList.remove('hidden');
  form.reset();
  fetchLinks();
});

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(resultLink.href);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = 'Copy';
    }, 1500);
  } catch {
    copyBtn.textContent = 'Failed';
  }
});

fetchLinks();
