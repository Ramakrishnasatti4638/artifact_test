// DOM Elements
const shortenForm = document.getElementById('shortenForm');
const urlInput = document.getElementById('urlInput');
const aliasInput = document.getElementById('aliasInput');
const resultContainer = document.getElementById('resultContainer');
const errorContainer = document.getElementById('errorContainer');
const errorMessage = document.getElementById('errorMessage');
const shortUrlLink = document.getElementById('shortUrlLink');
const copyBtn = document.getElementById('copyBtn');
const linksTableBody = document.getElementById('linksTableBody');
const totalLinksEl = document.getElementById('totalLinks');
const totalClicksEl = document.getElementById('totalClicks');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadLinks();
});

// Handle form submission
shortenForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = urlInput.value.trim();
    const customAlias = aliasInput.value.trim();

    // Hide previous messages
    resultContainer.style.display = 'none';
    errorContainer.style.display = 'none';

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

        // Show success
        shortUrlLink.href = data.shortUrl;
        shortUrlLink.textContent = data.shortUrl;
        resultContainer.style.display = 'block';

        // Reset form
        urlInput.value = '';
        aliasInput.value = '';

        // Reload links table
        loadLinks();

    } catch (error) {
        errorMessage.textContent = error.message;
        errorContainer.style.display = 'block';
    }
});

// Copy to clipboard
copyBtn.addEventListener('click', () => {
    const shortUrl = shortUrlLink.textContent;
    navigator.clipboard.writeText(shortUrl).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    });
});

// Load and display all links
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
                    <td colspan="5" class="no-data">No links yet. Create your first short link above!</td>
                </tr>
            `;
            return;
        }

        linksTableBody.innerHTML = links.map(link => {
            const shortUrl = `${window.location.origin}/${link.shortCode}`;
            const createdDate = new Date(link.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                <tr>
                    <td class="url-cell" title="${escapeHtml(link.originalUrl)}">
                        ${escapeHtml(truncateUrl(link.originalUrl, 50))}
                    </td>
                    <td class="short-url-cell">
                        <a href="${shortUrl}" target="_blank">${shortUrl}</a>
                    </td>
                    <td>
                        <span class="clicks-badge">${link.clickCount}</span>
                    </td>
                    <td class="date-cell">${createdDate}</td>
                    <td>
                        <button class="btn btn-delete" onclick="deleteLink('${link.shortCode}')">
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

// Delete a link
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
        console.error('Failed to delete link:', error);
        alert('Failed to delete link');
    }
}

// Helper functions
function truncateUrl(url, maxLength) {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
