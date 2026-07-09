// DOM Elements
const shortenForm = document.getElementById('shortenForm');
const urlInput = document.getElementById('urlInput');
const aliasInput = document.getElementById('aliasInput');
const result = document.getElementById('result');
const shortUrl = document.getElementById('shortUrl');
const copyBtn = document.getElementById('copyBtn');
const linksTableBody = document.getElementById('linksTableBody');
const totalLinksEl = document.getElementById('totalLinks');
const totalClicksEl = document.getElementById('totalClicks');

// Initialize
loadLinks();

// Form submission
shortenForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = urlInput.value.trim();
    const customAlias = aliasInput.value.trim();

    try {
        const response = await fetch('/api/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url,
                customAlias: customAlias || undefined
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Failed to shorten URL');
            return;
        }

        // Display result
        shortUrl.href = data.shortUrl;
        shortUrl.textContent = data.shortUrl;
        result.style.display = 'block';

        // Clear form
        urlInput.value = '';
        aliasInput.value = '';

        // Reload links
        loadLinks();
    } catch (error) {
        alert('Failed to shorten URL. Please try again.');
        console.error(error);
    }
});

// Copy to clipboard
copyBtn.addEventListener('click', async () => {
    const url = shortUrl.textContent;
    
    try {
        await navigator.clipboard.writeText(url);
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => {
            copyBtn.textContent = '📋 Copy';
        }, 2000);
    } catch (error) {
        // Fallback for older browsers
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => {
            copyBtn.textContent = '📋 Copy';
        }, 2000);
    }
});

// Load all links
async function loadLinks() {
    try {
        const response = await fetch('/api/links');
        const links = await response.json();

        // Update stats
        totalLinksEl.textContent = links.length;
        const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);
        totalClicksEl.textContent = totalClicks;

        // Update table
        if (links.length === 0) {
            linksTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">No links yet. Create your first one above!</td>
                </tr>
            `;
        } else {
            linksTableBody.innerHTML = links.map(link => `
                <tr>
                    <td class="url-cell" title="${escapeHtml(link.originalUrl)}">
                        ${escapeHtml(truncateUrl(link.originalUrl, 50))}
                    </td>
                    <td>
                        <a href="/${link.shortCode}" class="short-link" target="_blank">
                            ${window.location.origin}/${link.shortCode}
                        </a>
                    </td>
                    <td class="click-count">${link.clickCount}</td>
                    <td class="date-cell">${formatDate(link.createdAt)}</td>
                    <td>
                        <button class="btn btn-delete" onclick="deleteLink('${link.shortCode}')">
                            Delete
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load links:', error);
    }
}

// Delete link
async function deleteLink(shortCode) {
    if (!confirm('Are you sure you want to delete this link?')) {
        return;
    }

    try {
        const response = await fetch(`/api/links/${shortCode}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadLinks();
        } else {
            alert('Failed to delete link');
        }
    } catch (error) {
        alert('Failed to delete link. Please try again.');
        console.error(error);
    }
}

// Helper functions
function truncateUrl(url, maxLength) {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
