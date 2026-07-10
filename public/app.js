const urlInput = document.getElementById('urlInput');
const customAlias = document.getElementById('customAlias');
const shortenBtn = document.getElementById('shortenBtn');
const result = document.getElementById('result');
const shortUrl = document.getElementById('shortUrl');
const copyBtn = document.getElementById('copyBtn');
const error = document.getElementById('error');
const linksTableBody = document.getElementById('linksTableBody');
const totalLinksEl = document.getElementById('totalLinks');
const totalClicksEl = document.getElementById('totalClicks');

async function shortenUrl() {
    const url = urlInput.value.trim();
    const alias = customAlias.value.trim();

    if (!url) {
        showError('Please enter a URL');
        return;
    }

    hideError();
    hideResult();

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
            showError(data.error || 'Failed to shorten URL');
            return;
        }

        shortUrl.textContent = data.shortUrl;
        shortUrl.href = data.shortUrl;
        showResult();

        urlInput.value = '';
        customAlias.value = '';

        await loadLinks();
    } catch (err) {
        showError('Network error. Please try again.');
    }
}

async function loadLinks() {
    try {
        const response = await fetch('/api/links');
        const links = await response.json();

        if (links.length === 0) {
            linksTableBody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="5">No links yet. Create your first one above!</td>
                </tr>
            `;
            totalLinksEl.textContent = '0';
            totalClicksEl.textContent = '0';
            return;
        }

        const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);
        totalLinksEl.textContent = links.length;
        totalClicksEl.textContent = totalClicks;

        linksTableBody.innerHTML = links.map(link => {
            const shortUrlFull = `${window.location.origin}/${link.shortCode}`;
            const date = new Date(link.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const truncatedUrl = link.originalUrl.length > 50 
                ? link.originalUrl.substring(0, 50) + '...' 
                : link.originalUrl;

            return `
                <tr>
                    <td class="url-cell" title="${link.originalUrl}">${truncatedUrl}</td>
                    <td>
                        <a href="${shortUrlFull}" class="short-url" target="_blank">
                            ${link.shortCode}
                        </a>
                    </td>
                    <td class="click-count">${link.clickCount}</td>
                    <td class="date-cell">${date}</td>
                    <td>
                        <button class="btn-delete" onclick="deleteLink('${link.shortCode}')">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error('Failed to load links:', err);
    }
}

async function deleteLink(shortCode) {
    if (!confirm('Are you sure you want to delete this link?')) {
        return;
    }

    try {
        const response = await fetch(`/api/links/${shortCode}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await loadLinks();
        } else {
            showError('Failed to delete link');
        }
    } catch (err) {
        showError('Network error. Please try again.');
    }
}

function copyToClipboard() {
    const url = shortUrl.textContent;
    navigator.clipboard.writeText(url).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }).catch(() => {
        showError('Failed to copy to clipboard');
    });
}

function showResult() {
    result.classList.remove('hidden');
}

function hideResult() {
    result.classList.add('hidden');
}

function showError(message) {
    error.textContent = message;
    error.classList.remove('hidden');
}

function hideError() {
    error.classList.add('hidden');
}

shortenBtn.addEventListener('click', shortenUrl);
copyBtn.addEventListener('click', copyToClipboard);

urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        shortenUrl();
    }
});

customAlias.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        shortenUrl();
    }
});

loadLinks();
