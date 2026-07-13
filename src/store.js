'use strict';

// In-memory store: Map<shortCode, { shortCode, originalUrl, createdAt, clickCount }>
const links = new Map();

function getAll() {
  return [...links.values()].sort((a, b) => b.clickCount - a.clickCount);
}

function getByCode(shortCode) {
  return links.get(shortCode) || null;
}

function create(shortCode, originalUrl) {
  const entry = { shortCode, originalUrl, createdAt: new Date().toISOString(), clickCount: 0 };
  links.set(shortCode, entry);
  return entry;
}

function increment(shortCode) {
  const entry = links.get(shortCode);
  if (entry) entry.clickCount += 1;
}

function remove(shortCode) {
  return links.delete(shortCode);
}

function clear() {
  links.clear();
}

module.exports = { getAll, getByCode, create, increment, remove, clear };
