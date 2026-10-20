/**
 * Speech utilities for cleaning markdown content and managing natural speech synthesis
 */

/**
 * Prepares raw markdown text for natural, fluent speech.
 * 100% strips markdown syntax (###, **, *, `, >, links, code blocks, tables)
 * so speech synthesis pronounces only natural, clean sentences without symbol names.
 * @param {string} title - Note title
 * @param {string} content - Raw markdown note content
 * @returns {string} - Clean, naturally speakable text
 */
export function prepareMarkdownForSpeech(title, content) {
  let text = "";

  if (title && title.trim()) {
    // Strip any markdown chars in title
    const cleanTitle = title.replace(/[#*`~_>^|\\{}[\]]/g, " ").trim();
    if (cleanTitle) {
      text += `${cleanTitle}.\n\n`;
    }
  }

  if (!content) return text.trim();

  let clean = content
    // Normalize Windows CRLF to LF
    .replace(/\r\n/g, "\n")
    // Remove YAML frontmatter
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    // Remove fenced code blocks completely
    .replace(/```[\s\S]*?```/g, "")
    // Remove inline code ticks: `code` -> code
    .replace(/`([^`]+)`/g, "$1")
    // Remove image syntax ![alt](url) -> alt or nothing
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    // Clean links: keep anchor text, discard URL: [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Strip standalone http/https URLs so voice doesn't spell them out
    .replace(/https?:\/\/\S+/gi, "")
    // Convert headings: "### Section Title" -> "Section Title."
    .replace(/^\s*#{1,6}\s*(.*?)\s*#*$/gm, (match, heading) => {
      const trimmed = heading ? heading.trim() : "";
      return trimmed ? `${trimmed}. ` : "";
    })
    // Strip horizontal rules (---, ***, ___)
    .replace(/^\s*[-*_]{3,}\s*$/gm, "")
    // Remove bold and italic markers: **bold** or *italic*
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    // Remove strikethrough: ~~text~~
    .replace(/~~(.*?)~~/g, "$1")
    // Remove blockquote arrows (> quote)
    .replace(/^\s*>\s*/gm, "")
    // Remove task list checkboxes: - [ ] or - [x]
    .replace(/^\s*[-*+]\s+\[[ xX]\]\s+/gm, "")
    // Remove bullet and number list markers: - item or 1. item
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    // Clean markdown tables: remove separator rows and replace pipe with pause
    .replace(/\|?[\s-:]+\|[\s-:|]+/g, "")
    .replace(/\|/g, ", ")
    // Remove HTML tags: <kbd>, <mark>, <div>, etc.
    .replace(/<[^>]*>/g, "")
    // Remove footnotes: [^1]
    .replace(/\[\^[^\]]+\]/g, "")
    // Clean KaTeX / LaTeX math blocks
    .replace(/\$\$[\s\S]*?\$\$/g, " Mathematical equation. ")
    .replace(/\$([^$]+)\$/g, " $1 ")
    // ABSOLUTE FAILSAFE: Strip ANY remaining markdown symbol (#, *, `, ~, _, >, ^, |, \, {, }, [, ])
    // This GUARANTEES that "###", "**", etc. are NEVER pronounced as "hash hash hash"
    .replace(/[#*`~_>^|\\{}[\]]/g, " ")
    // Normalize excessive punctuation and spaces
    .replace(/\s+/g, " ")
    .replace(/\s+([.,!?:;])/g, "$1")
    .trim();

  return (text + clean).trim();
}

/**
 * Splits long text into natural sentence chunks to prevent browser speech synthesis timeouts
 * @param {string} text - Clean plain text
 * @param {number} maxChunkLength - Maximum character length per chunk (~180 chars)
 * @returns {string[]} - Array of natural sentence/clause chunks
 */
export function chunkTextForSpeech(text, maxChunkLength = 180) {
  if (!text) return [];

  // Split text by sentence terminators or newlines
  const rawSentences = text.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [text];
  const chunks = [];
  let currentChunk = "";

  for (const sentence of rawSentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (currentChunk.length + trimmed.length + 1 <= maxChunkLength) {
      currentChunk += (currentChunk ? " " : "") + trimmed;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      // If single sentence itself exceeds maxChunkLength, split by commas or clauses
      if (trimmed.length > maxChunkLength) {
        const clauses = trimmed.split(/([,;:—]+)/);
        let subChunk = "";
        for (const part of clauses) {
          if (subChunk.length + part.length <= maxChunkLength) {
            subChunk += part;
          } else {
            if (subChunk.trim()) chunks.push(subChunk.trim());
            subChunk = part;
          }
        }
        if (subChunk.trim()) {
          currentChunk = subChunk.trim();
        } else {
          currentChunk = "";
        }
      } else {
        currentChunk = trimmed;
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
