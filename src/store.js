// In-memory store for shortened URLs
const store = new Map();

/**
 * Validates if a string is a valid URL
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Generates a random 6-character alphanumeric short code
 */
function generateShortCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a shortened URL entry
 */
function createLink(originalUrl, customAlias) {
  const shortCode = customAlias || generateShortCode();

  // Check if alias already exists
  if (store.has(shortCode)) {
    return { error: 'Alias already taken', code: 409 };
  }

  const link = {
    shortCode,
    originalUrl,
    createdAt: new Date().toISOString(),
    clickCount: 0,
  };

  store.set(shortCode, link);
  return link;
}

/**
 * Get a link by short code and increment click count
 */
function getLink(shortCode) {
  const link = store.get(shortCode);
  if (link) {
    link.clickCount++;
  }
  return link;
}

/**
 * Get all links sorted by clickCount (descending)
 */
function getAllLinks() {
  return Array.from(store.values()).sort((a, b) => b.clickCount - a.clickCount);
}

/**
 * Delete a link by short code
 */
function deleteLink(shortCode) {
  return store.delete(shortCode);
}

/**
 * Clear all links (useful for testing)
 */
function clearAll() {
  store.clear();
}

module.exports = {
  isValidUrl,
  generateShortCode,
  createLink,
  getLink,
  getAllLinks,
  deleteLink,
  clearAll,
};
