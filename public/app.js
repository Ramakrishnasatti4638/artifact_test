// DOM Elements
const shortenForm = document.getElementById('shortenForm');
const urlInput = document.getElementById('urlInput');
const customAlias = document.getElementById('customAlias');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');
const shortUrlLink = document.getElementById('shortUrl');
const copyBtn = document.getElementById('copyBtn');
const linksTableBody = document.getElementById('linksTableBody');
const totalLinksEl = document.getElementById('totalLinks');
const totalClicksEl = document.getElementById('totalClicks');

// Initialize
loadLinks();

// Event Listeners
shortenForm.addEventListener('submit', handleSubmit);
copyBtn.addEventListener('click', copyToClipboard);

async function handleSubmit(e) {
    e.preventDefault();
    
    const url = urlInput.value.trim();
    const alias = customAlias.value.trim();

    // Hide previous results/errors
    hideResult();
    hideError();

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
            throw new Error(data.error || 'Failed to shorten URL');
        }

        // Display result
        showResult(data.shortUrl);
        
        // Clear form
        urlInput.value = '';
        customAlias.value = '';

        // Reload links table
        loadLinks();

    } catch (error) {
        showError(error.message);
    }
}

async function loadLinks() {
    try {
        const response = await fetch('/api/links');
        const links = await response.json();

        // Update stats
        updateStats(links);

        // Render table
        renderLinksTable(links);

    } catch (error) {
        console.error('Failed to load links:', error);
    }
}

function updateStats(links) {
    totalLinksEl.textContent = links.length;
    const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);
    totalClicksEl.textContent = totalClicks;
}

function renderLinksTable(links) {
    if (links.length === 0) {
        linksTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">No links yet. Create your first one above!</td>
            </tr>
        `;
        return;
    }

    linksTableBody.innerHTML = links.map(link => {
        const shortUrl = `${window.location.origin}/${link.shortCode}`;
        const truncatedUrl = truncateUrl(link.originalUrl, 50);
        const formattedDate = formatDate(link.createdAt);

        return `
            <tr>
                <td class="url-cell" title="${escapeHtml(link.originalUrl)}">
                    ${escapeHtml(truncatedUrl)}
                </td>
                <td>
                    <a href="${shortUrl}" target="_blank" class="short-code-link">
                        ${escapeHtml(link.shortCode)}
                    </a>
                </td>
                <td class="click-count">${link.clickCount}</td>
                <td class="date-cell">${formattedDate}</td>
                <td>
                    <button class="btn btn-delete" onclick="deleteLink('${escapeHtml(link.shortCode)}')">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

async function deleteLink(shortCode) {
    if (!confirm(`Are you sure you want to delete the link "${shortCode}"?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/links/${shortCode}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete link');
        }

        // Reload links table
        loadLinks();

    } catch (error) {
        showError(error.message);
    }
}

function copyToClipboard() {
    const url = shortUrlLink.href;
    
    navigator.clipboard.writeText(url).then(() => {
        // Visual feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied!';
        copyBtn.style.background = '#059669';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        showError('Failed to copy to clipboard');
    });
}

function showResult(shortUrl) {
    shortUrlLink.href = shortUrl;
    shortUrlLink.textContent = shortUrl;
    resultDiv.classList.remove('hidden');
}

function hideResult() {
    resultDiv.classList.add('hidden');
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    errorDiv.classList.add('hidden');
}

function truncateUrl(url, maxLength) {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
}

function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
