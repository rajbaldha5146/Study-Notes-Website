/**
 * Sanitization utilities for user input
 * Prevents XSS and other injection attacks
 */

/**
 * Sanitize HTML string to prevent XSS
 * @param {string} str - The string to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeHTML(str) {
  if (!str) return '';
  
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

/**
 * Sanitize markdown content
 * Removes potentially dangerous HTML while preserving markdown
 * @param {string} markdown - The markdown content
 * @returns {string} - Sanitized markdown
 */
export function sanitizeMarkdown(markdown) {
  if (!markdown) return '';
  
  // Remove script tags and event handlers
  return markdown
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Validate and sanitize folder/note names
 * @param {string} name - The name to validate
 * @returns {string} - Sanitized name
 */
export function sanitizeName(name) {
  if (!name) return '';
  
  return name
    .trim()
    .replace(/[<>:"\/\\|?*\x00-\x1F]/g, '') // Remove invalid filename characters
    .substring(0, 200); // Limit length
}
