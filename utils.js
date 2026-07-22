'use strict';

const CODE_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const CODE_LENGTH = 6;
const ALIAS_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * Validate that a string is a well-formed http(s) URL.
 * @param {unknown} url
 * @returns {boolean}
 */
function isValidUrl(url) {
  if (typeof url !== 'string' || url.trim() === '') {
    return false;
  }
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  return parsed.protocol === 'http:' || parsed.protocol === 'https:';
}

/**
 * Validate a custom alias: non-empty, alphanumeric plus hyphen/underscore.
 * @param {unknown} alias
 * @returns {boolean}
 */
function isValidAlias(alias) {
  return typeof alias === 'string' && ALIAS_PATTERN.test(alias);
}

/**
 * Generate a random alphanumeric short code.
 * @param {number} [length=CODE_LENGTH]
 * @returns {string}
 */
function generateShortCode(length = CODE_LENGTH) {
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

module.exports = {
  CODE_CHARS,
  CODE_LENGTH,
  isValidUrl,
  isValidAlias,
  generateShortCode,
};
