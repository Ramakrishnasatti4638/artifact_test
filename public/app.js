const urlInput = document.getElementById('urlInput');
const customAlias = document.getElementById('customAlias');
const shortenBtn = document.getElementById('shortenBtn');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');
const shortUrl = document.getElementById('shortUrl');
const copyBtn = document.getElementById('copyBtn');
const linksTableBody = document.getElementById('linksTableBody');
const totalLinks = document.getElementById('totalLinks');
const totalClicks = document.getElementById('totalClicks');

async function fetchLinks() {
    try {
        const response = await fetch('/api/links');
        const links = await response.json();
        updateStats(links);
        renderLinks(links);
    } catch (error) {
        console.error('Error fetching links:', error);
    }
}

function updateStats(links) {
    totalLinks.textContent = links.length;
    const clicks = links.reduce((sum, link) => sum + link.clickCount, 0);
    totalClicks.textContent = clicks;
}

function renderLinks(links) {
    if (links.length === 0) {
        linksTableBody.innerHTML = '<tr class="empty-state"><td colspan="5">No links yet. Create your first one above!</td></tr>';
        return;
    }

    linksTableBody.innerHTML = links.map(link => {
        const shortLink = `${window.location.origin}/${link.shortCode}`;
        const createdDate = new Date(link.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });

        return `
            <tr>
                <td class="url-cell" title="${link.originalUrl}">${link.originalUrl}</td>
                <td><a href="${shortLink}" class="short-code" target="_blank">${link.shortCode}</a></td>
                <td class="click-count">${link.clickCount}</td>
                <td>${createdDate}</td>
                <td><button class="delete-btn" onclick="deleteLink('${link.shortCode}')">Delete</button></td>
            </tr>
        `;
    }).join('');
}

shortenBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    const alias = customAlias.value.trim();

    errorDiv.classList.add('hidden');
    resultDiv.classList.add('hidden');

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

        if (!response.ok) {
            showError(data.error || 'Failed to shorten URL');
            return;
        }

        const shortLink = `${window.location.origin}/${data.shortCode}`;
        shortUrl.href = shortLink;
        shortUrl.textContent = shortLink;
        resultDiv.classList.remove('hidden');

        urlInput.value = '';
        customAlias.value = '';

        fetchLinks();
    } catch (error) {
        showError('Network error. Please try again.');
    }
});

copyBtn.addEventListener('click', () => {
    const url = shortUrl.textContent;
    navigator.clipboard.writeText(url).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    });
});

async function deleteLink(shortCode) {
    if (!confirm('Are you sure you want to delete this link?')) {
        return;
    }

    try {
        const response = await fetch(`/api/links/${shortCode}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchLinks();
        } else {
            showError('Failed to delete link');
        }
    } catch (error) {
        showError('Network error. Please try again.');
    }
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

fetchLinks();
