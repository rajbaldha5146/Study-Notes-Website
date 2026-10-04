/**
 * Markdown helper functions for UI/UX enhancements
 */

/**
 * Strip Markdown tags to produce clean plain text preview
 * @param {string} md - Raw markdown text
 * @returns {string} - Clean plain text
 */
export function stripMarkdown(md) {
  if (!md) return "";
  return md
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, "")
    // Remove inline code
    .replace(/`([^`]+)`/g, "$1")
    // Remove headings (# Heading)
    .replace(/^#{1,6}\s+/gm, "")
    // Remove bold and italic (*text* or **text** or _text_ or __text__)
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    // Remove links [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove blockquotes (> text)
    .replace(/^\s*>\s+/gm, "")
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, "")
    // Remove list markers (* -, 1.)
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    // Normalize newlines to spaces
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Calculate estimated reading time and word count
 * @param {string} content - Markdown or plain text
 * @returns {{ words: number, minutes: number, text: string }}
 */
export function calculateReadingTime(content) {
  if (!content) return { words: 0, minutes: 1, text: "1 min read" };
  const plainText = stripMarkdown(content);
  const words = plainText.split(/\s+/).filter(Boolean).length;
  const WPM = 200; // Average reading speed
  const minutes = Math.max(1, Math.ceil(words / WPM));
  return {
    words,
    minutes,
    text: `${minutes} min read`,
  };
}

/**
 * Extract Table of Contents headings from markdown content
 * @param {string} content - Markdown text
 * @returns {Array<{ id: string, text: string, level: number }>}
 */
export function extractHeadings(content) {
  if (!content) return [];
  const headingRegex = /^(#{1,4})\s+(.+)$/gm;
  const headings = [];
  let match;

  const slugify = (text) =>
    String(text)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const rawText = match[2].replace(/[*_~`]/g, "").trim();
    const id = slugify(rawText);
    if (rawText) {
      headings.push({ id, text: rawText, level });
    }
  }

  return headings;
}

/**
 * Recently Viewed Notes tracker using localStorage
 */
const RECENT_NOTES_KEY = "notemaster_recent_notes";

export function getRecentNotes() {
  try {
    const data = localStorage.getItem(RECENT_NOTES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addRecentNote(note) {
  if (!note || !note._id) return;
  try {
    const existing = getRecentNotes().filter((n) => n._id !== note._id);
    const updated = [
      {
        _id: note._id,
        title: note.title,
        folderName: note.folder?.name || note.folderName || "General",
        folderId: note.folder?._id || note.folderId,
        viewedAt: new Date().toISOString(),
        excerpt: stripMarkdown(note.content || "").substring(0, 100),
      },
      ...existing,
    ].slice(0, 8); // Keep last 8 notes
    localStorage.setItem(RECENT_NOTES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to update recent notes:", err);
  }
}

/**
 * Favorites / Pinned Notes tracker using localStorage
 */
const FAVORITES_KEY = "notemaster_favorite_notes";

export function getFavoriteNoteIds() {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function toggleFavoriteNoteId(noteId) {
  try {
    const favorites = getFavoriteNoteIds();
    const isFav = favorites.includes(noteId);
    const updated = isFav
      ? favorites.filter((id) => id !== noteId)
      : [...favorites, noteId];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return !isFav;
  } catch {
    return false;
  }
}
