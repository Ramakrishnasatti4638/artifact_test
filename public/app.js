// DOM Elements
const shortenForm = document.getElementById('shortenForm');
const urlInput = document.getElementById('urlInput');
const customAliasInput = document.getElementById('customAlias');
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
    const customAlias = customAliasInput.value.trim();

    // Hide previous results/errors
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

        // Display success result
        shortUrlLink.href = data.shortUrl;
        shortUrlLink.textContent = data.shortUrl;
        resultContainer.style.display = 'block';

        // Reset form
        shortenForm.reset();

        // Reload links
        loadLinks();

    } catch (error) {
        // Display error
        errorMessage.textContent = error.message;
        errorContainer.style.display = 'block';
    }
});

// Copy to clipboard
copyBtn.addEventListener('click', async () => {
    const shortUrl = shortUrlLink.textContent;
    
    try {
        await navigator.clipboard.writeText(shortUrl);
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    } catch (error) {
        alert('Failed to copy to clipboard');
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
                    <td colspan="5" class="empty-state">No links created yet</td>
                </tr>
            `;
        } else {
            linksTableBody.innerHTML = links.map(link => {
                const shortUrl = `${window.location.origin}/${link.shortCode}`;
                const createdDate = new Date(link.createdAt).toLocaleString();

                return `
                    <tr>
                        <td>
                            <span class="url-truncate" title="${escapeHtml(link.originalUrl)}">
                                ${escapeHtml(link.originalUrl)}
                            </span>
                        </td>
                        <td>
                            <a href="${shortUrl}" target="_blank" class="short-link">
                                /${link.shortCode}
                            </a>
                        </td>
                        <td class="click-count">${link.clickCount}</td>
                        <td class="date-text">${createdDate}</td>
                        <td>
                            <button class="btn btn-danger" onclick="deleteLink('${link.shortCode}')">
                                Delete
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
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

        if (!response.ok) {
            throw new Error('Failed to delete link');
        }

        // Reload links
        loadLinks();

    } catch (error) {
        alert(error.message);
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
