// In-memory store for shortened URLs
const links = new Map();

function getAll() {
  return Array.from(links.values()).sort((a, b) => b.clickCount - a.clickCount);
}

function get(shortCode) {
  return links.get(shortCode) || null;
}

function set(shortCode, data) {
  links.set(shortCode, data);
}

function remove(shortCode) {
  return links.delete(shortCode);
}

function has(shortCode) {
  return links.has(shortCode);
}

function clear() {
  links.clear();
}

module.exports = { getAll, get, set, remove, has, clear };
