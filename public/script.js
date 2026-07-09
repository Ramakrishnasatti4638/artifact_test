// DOM Elements
const shortenForm = document.getElementById('shortenForm');
const urlInput = document.getElementById('urlInput');
const customAliasInput = document.getElementById('customAlias');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');
const shortUrlLink = document.getElementById('shortUrlLink');
const copyBtn = document.getElementById('copyBtn');
const linksTableBody = document.getElementById('linksTableBody');
const totalLinksEl = document.getElementById('totalLinks');
const totalClicksEl = document.getElementById('totalClicks');

// Load links on page load
document.addEventListener('DOMContentLoaded', () => {
    loadLinks();
});

// Form submission
shortenForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = urlInput.value.trim();
    const customAlias = customAliasInput.value.trim();

    // Hide previous results/errors
    resultDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');

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
            throw new Error(data.error || 'Failed to shorten URL');
        }

        // Show success result
        shortUrlLink.href = data.shortUrl;
        shortUrlLink.textContent = data.shortUrl;
        resultDiv.classList.remove('hidden');

        // Clear form
        urlInput.value = '';
        customAliasInput.value = '';

        // Reload links table
        loadLinks();

    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
    }
});

// Copy button
copyBtn.addEventListener('click', async () => {
    const url = shortUrlLink.textContent;
    
    try {
        await navigator.clipboard.writeText(url);
        
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = '#86efac';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    } catch (error) {
        alert('Failed to copy URL');
    }
});

// Load all links
async function loadLinks() {
    try {
        const response = await fetch('/api/links');
        const links = await response.json();

        if (links.length === 0) {
            linksTableBody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="5">No links created yet. Start by shortening your first URL!</td>
                </tr>
            `;
            totalLinksEl.textContent = '0';
            totalClicksEl.textContent = '0';
            return;
        }

        // Update stats
        totalLinksEl.textContent = links.length;
        const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);
        totalClicksEl.textContent = totalClicks;

        // Render links table
        linksTableBody.innerHTML = links.map(link => {
            const shortUrl = `${window.location.origin}/${link.shortCode}`;
            const createdDate = new Date(link.createdAt).toLocaleString();
            const truncatedUrl = link.originalUrl.length > 50 
                ? link.originalUrl.substring(0, 50) + '...'
                : link.originalUrl;

            return `
                <tr>
                    <td class="url-cell" title="${escapeHtml(link.originalUrl)}">
                        ${escapeHtml(truncatedUrl)}
                    </td>
                    <td>
                        <a href="${shortUrl}" target="_blank" class="short-url-link">
                            ${escapeHtml(shortUrl)}
                        </a>
                    </td>
                    <td class="click-count">${link.clickCount}</td>
                    <td class="date-cell">${escapeHtml(createdDate)}</td>
                    <td>
                        <button class="btn btn-delete" onclick="deleteLink('${escapeHtml(link.shortCode)}')">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

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

        if (!response.ok) {
            throw new Error('Failed to delete link');
        }

        // Reload links table
        loadLinks();

    } catch (error) {
        alert('Failed to delete link: ' + error.message);
    }
}

// Helper to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
