// DOM Elements
const shortenForm = document.getElementById('shortenForm');
const urlInput = document.getElementById('urlInput');
const customAliasInput = document.getElementById('customAlias');
const resultSection = document.getElementById('resultSection');
const shortUrlLink = document.getElementById('shortUrl');
const copyBtn = document.getElementById('copyBtn');
const linksTableBody = document.getElementById('linksTableBody');
const totalLinksEl = document.getElementById('totalLinks');
const totalClicksEl = document.getElementById('totalClicks');

// Load all links on page load
loadLinks();

// Form submission
shortenForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = urlInput.value.trim();
    const customAlias = customAliasInput.value.trim();

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

        // Show result
        shortUrlLink.href = data.shortUrl;
        shortUrlLink.textContent = data.shortUrl;
        resultSection.classList.remove('hidden');

        // Reset form
        urlInput.value = '';
        customAliasInput.value = '';

        // Reload links
        loadLinks();

    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Copy to clipboard
copyBtn.addEventListener('click', async () => {
    const url = shortUrlLink.textContent;

    try {
        await navigator.clipboard.writeText(url);
        copyBtn.textContent = '✓ Copied!';
        copyBtn.classList.add('copied');

        setTimeout(() => {
            copyBtn.textContent = '📋 Copy';
            copyBtn.classList.remove('copied');
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
                <tr class="empty-state">
                    <td colspan="5">No links created yet. Start by shortening a URL above!</td>
                </tr>
            `;
            return;
        }

        linksTableBody.innerHTML = links.map(link => {
            const shortUrl = `${window.location.origin}/${link.shortCode}`;
            const createdDate = new Date(link.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            return `
                <tr>
                    <td>
                        <div class="original-url" title="${escapeHtml(link.originalUrl)}">
                            ${escapeHtml(link.originalUrl)}
                        </div>
                    </td>
                    <td>
                        <a href="${shortUrl}" target="_blank" class="short-link">
                            ${link.shortCode}
                        </a>
                    </td>
                    <td>
                        <span class="click-count">${link.clickCount}</span>
                    </td>
                    <td>
                        <span class="date-cell">${createdDate}</span>
                    </td>
                    <td>
                        <button class="btn-delete" onclick="deleteLink('${link.shortCode}')">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading links:', error);
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
            const data = await response.json();
            alert(data.error || 'Failed to delete link');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
