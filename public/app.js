// DOM Elements
const urlInput = document.getElementById('urlInput');
const customAlias = document.getElementById('customAlias');
const shortenBtn = document.getElementById('shortenBtn');
const errorMessage = document.getElementById('errorMessage');
const resultContainer = document.getElementById('resultContainer');
const shortUrl = document.getElementById('shortUrl');
const copyBtn = document.getElementById('copyBtn');
const linksTableBody = document.getElementById('linksTableBody');
const emptyState = document.getElementById('emptyState');
const totalLinksEl = document.getElementById('totalLinks');
const totalClicksEl = document.getElementById('totalClicks');

// State
let allLinks = [];

// Event Listeners
shortenBtn.addEventListener('click', handleShorten);
copyBtn.addEventListener('click', handleCopy);

urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleShorten();
});

customAlias.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleShorten();
});

// Initialize
loadLinks();

// Functions
async function handleShorten() {
    const url = urlInput.value.trim();
    const alias = customAlias.value.trim();

    // Clear previous error
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';

    // Validate input
    if (!url) {
        showError('Please enter a URL');
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
            showError(data.error || 'Failed to shorten URL');
            return;
        }

        // Show result
        shortUrl.href = data.shortUrl;
        shortUrl.textContent = data.shortUrl;
        resultContainer.style.display = 'block';

        // Clear inputs
        urlInput.value = '';
        customAlias.value = '';

        // Reload links
        await loadLinks();

    } catch (error) {
        showError('Network error. Please try again.');
        console.error(error);
    }
}

async function handleCopy() {
    const url = shortUrl.textContent;
    
    try {
        await navigator.clipboard.writeText(url);
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied!';
        copyBtn.style.background = '#38a169';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    } catch (error) {
        showError('Failed to copy to clipboard');
    }
}

async function loadLinks() {
    try {
        const response = await fetch('/api/links');
        allLinks = await response.json();
        renderLinks();
        updateStats();
    } catch (error) {
        console.error('Failed to load links:', error);
    }
}

function renderLinks() {
    if (allLinks.length === 0) {
        linksTableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    
    linksTableBody.innerHTML = allLinks.map(link => {
        const shortLinkUrl = `${window.location.origin}/${link.shortCode}`;
        const createdDate = new Date(link.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        return `
            <tr>
                <td>
                    <div class="original-url" title="${escapeHtml(link.originalUrl)}">
                        ${escapeHtml(truncateUrl(link.originalUrl, 50))}
                    </div>
                </td>
                <td>
                    <a href="${shortLinkUrl}" target="_blank" class="short-code">
                        ${link.shortCode}
                    </a>
                </td>
                <td class="click-count">${link.clickCount}</td>
                <td class="created-date">${createdDate}</td>
                <td>
                    <button class="delete-btn" onclick="deleteLink('${link.shortCode}')">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateStats() {
    const totalLinks = allLinks.length;
    const totalClicks = allLinks.reduce((sum, link) => sum + link.clickCount, 0);
    
    totalLinksEl.textContent = totalLinks;
    totalClicksEl.textContent = totalClicks;
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
    } catch (error) {
        showError('Network error. Please try again.');
        console.error(error);
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function truncateUrl(url, maxLength) {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make deleteLink globally accessible
window.deleteLink = deleteLink;
