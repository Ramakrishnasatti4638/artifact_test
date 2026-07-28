const API_URL = 'http://localhost:3001';

const elements = {
    form: document.getElementById('shortenForm'),
    urlInput: document.getElementById('urlInput'),
    aliasInput: document.getElementById('aliasInput'),
    result: document.getElementById('result'),
    error: document.getElementById('error'),
    shortUrl: document.getElementById('shortUrl'),
    copyBtn: document.getElementById('copyBtn'),
    linksTableBody: document.getElementById('linksTableBody'),
    totalLinks: document.getElementById('totalLinks'),
    totalClicks: document.getElementById('totalClicks')
};

elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await createShortLink();
});

elements.copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(elements.shortUrl.href);
    const originalText = elements.copyBtn.textContent;
    elements.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
        elements.copyBtn.textContent = originalText;
    }, 2000);
});

async function createShortLink() {
    const url = elements.urlInput.value.trim();
    const customAlias = elements.aliasInput.value.trim();

    hideMessages();

    try {
        const response = await fetch(`${API_URL}/api/shorten`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url,
                ...(customAlias && { customAlias })
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showError(data.error || 'Failed to shorten URL');
            return;
        }

        elements.shortUrl.href = data.shortUrl;
        elements.shortUrl.textContent = data.shortUrl;
        elements.result.classList.remove('hidden');

        elements.urlInput.value = '';
        elements.aliasInput.value = '';

        await loadLinks();
    } catch (error) {
        showError('Failed to connect to the server. Make sure the API is running on port 3001.');
    }
}

async function loadLinks() {
    try {
        const response = await fetch(`${API_URL}/api/links`);
        const data = await response.json();

        updateStats(data.stats);
        renderLinks(data.links);
    } catch (error) {
        console.error('Failed to load links:', error);
    }
}

function updateStats(stats) {
    elements.totalLinks.textContent = stats.totalLinks;
    elements.totalClicks.textContent = stats.totalClicks;
}

function renderLinks(links) {
    if (links.length === 0) {
        elements.linksTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">No links yet. Create your first short link above!</td>
            </tr>
        `;
        return;
    }

    elements.linksTableBody.innerHTML = links.map(link => {
        const createdDate = new Date(link.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const shortUrl = `${window.location.origin.replace('3000', '3001')}/${link.shortCode}`;

        return `
            <tr>
                <td class="url-cell" title="${link.originalUrl}">${link.originalUrl}</td>
                <td>
                    <a href="${shortUrl}" target="_blank" class="short-link">${link.shortCode}</a>
                </td>
                <td class="click-count">${link.clickCount}</td>
                <td class="date-cell">${createdDate}</td>
                <td>
                    <button class="btn btn-delete" onclick="deleteLink('${link.shortCode}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

async function deleteLink(shortCode) {
    if (!confirm('Are you sure you want to delete this link?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/links/${shortCode}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await loadLinks();
            hideMessages();
        } else {
            showError('Failed to delete link');
        }
    } catch (error) {
        showError('Failed to connect to the server');
    }
}

function showError(message) {
    elements.error.textContent = message;
    elements.error.classList.remove('hidden');
}

function hideMessages() {
    elements.result.classList.add('hidden');
    elements.error.classList.add('hidden');
}

loadLinks();
