/**
 * Utility functions for handling share link redirects after authentication
 */

// Storage key for pending share redirect
const PENDING_SHARE_KEY = 'pendingShareRedirect';

/**
 * Store a pending share link for redirect after authentication
 * @param {string} shareId - The share ID to redirect to after auth
 */
export const storePendingShare = (shareId) => {
  if (shareId) {
    localStorage.setItem(PENDING_SHARE_KEY, shareId);
  }
};

/**
 * Peek at the pending share redirect without clearing it
 * @returns {string|null} The pending share path or null
 */
export const peekPendingShareRedirect = () => {
  const shareId = localStorage.getItem(PENDING_SHARE_KEY);
  if (shareId) {
    return `/share/${shareId}`;
  }
  return null;
};

/**
 * Get and clear the pending share redirect
 * @returns {string|null} The pending share path or null
 */
export const consumePendingShareRedirect = () => {
  const shareId = localStorage.getItem(PENDING_SHARE_KEY);
  if (shareId) {
    localStorage.removeItem(PENDING_SHARE_KEY);
    return `/share/${shareId}`;
  }
  return null;
};

/**
 * Clear any pending share redirect without returning it
 */
export const clearPendingShare = () => {
  localStorage.removeItem(PENDING_SHARE_KEY);
};
