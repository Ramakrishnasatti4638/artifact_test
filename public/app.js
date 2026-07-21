let allLinks = [];

document.addEventListener('DOMContentLoaded', () => {
    loadLinks();

    document.getElementById('shortenBtn').addEventListener('click', shortenUrl);
    document.getElementById('copyBtn').addEventListener('click', copyToClipboard);

    document.getElementById('urlInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            shortenUrl();
        }
    });
});

async function shortenUrl() {
    const urlInput = document.getElementById('urlInput');
    const customAlias = document.getElementById('customAlias');
    const url = urlInput.value.trim();
    const alias = customAlias.value.trim();

    if (!url) {
        alert('Please enter a URL');
        return;
    }

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
            alert(data.error || 'Failed to shorten URL');
            return;
        }

        displayResult(data.shortUrl);
        urlInput.value = '';
        customAlias.value = '';
        
        await loadLinks();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function displayResult(shortUrl) {
    const resultContainer = document.getElementById('resultContainer');
    const shortUrlElement = document.getElementById('shortUrl');
    const copyFeedback = document.getElementById('copyFeedback');

    shortUrlElement.href = shortUrl;
    shortUrlElement.textContent = shortUrl;
    resultContainer.style.display = 'block';
    copyFeedback.textContent = '';
}

async function copyToClipboard() {
    const shortUrl = document.getElementById('shortUrl').textContent;
    const copyFeedback = document.getElementById('copyFeedback');

    try {
        await navigator.clipboard.writeText(shortUrl);
        copyFeedback.textContent = '✓ Copied to clipboard!';
        setTimeout(() => {
            copyFeedback.textContent = '';
        }, 3000);
    } catch (error) {
        copyFeedback.textContent = '✗ Failed to copy';
    }
}

async function loadLinks() {
    try {
        const response = await fetch('/api/links');
        allLinks = await response.json();
        
        updateStats();
        renderLinksTable();
    } catch (error) {
        console.error('Error loading links:', error);
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
        tbody.innerHTML = `
            <tr class="empty-state">
                <td colspan="5">No links yet. Create your first short link above!</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = allLinks.map(link => {
        const shortUrl = `${window.location.origin}/${link.shortCode}`;
        const createdDate = new Date(link.createdAt).toLocaleDateString();
        const truncatedUrl = link.originalUrl.length > 50 
            ? link.originalUrl.substring(0, 50) + '...'
            : link.originalUrl;

        return `
            <tr>
                <td>
                    <a href="${link.originalUrl}" target="_blank" class="original-url" title="${link.originalUrl}">
                        ${truncatedUrl}
                    </a>
                </td>
                <td>
                    <a href="${shortUrl}" target="_blank" class="short-link">
                        ${shortUrl}
                    </a>
                </td>
                <td>
                    <span class="click-count">${link.clickCount}</span>
                </td>
                <td>${createdDate}</td>
                <td>
                    <button class="delete-btn" onclick="deleteLink('${link.shortCode}')">Delete</button>
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
        const response = await fetch(`/api/links/${shortCode}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await loadLinks();
        } else {
            alert('Failed to delete link');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}
