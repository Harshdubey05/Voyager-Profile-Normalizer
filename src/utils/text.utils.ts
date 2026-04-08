/**
 * Text cleaning utilities for LinkedIn profile normalization.
 *
 * Handles emoji removal, separator stripping, whitespace normalization,
 * and other text hygiene operations.
 */

// Comprehensive emoji regex covering:
// - Emoji presentation sequences & modifiers
// - Dingbats, symbols, pictographs, transport, flags
// - Variation selectors, ZWJ sequences
const EMOJI_REGEX =
  /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu;

// Separators commonly found in LinkedIn headlines
const SEPARATOR_REGEX = /[|•·●■▪►▸★☆✦✧⬥⬦◆◇❖⎪⸱᛫‣⁃※†‡§¶]+/g;

/**
 * Remove all emoji characters from a string.
 */
export function stripEmojis(text: string): string {
  return text.replace(EMOJI_REGEX, '');
}

/**
 * Remove common visual separators used in LinkedIn headlines.
 */
export function stripSeparators(text: string): string {
  return text.replace(SEPARATOR_REGEX, ' ');
}

/**
 * Collapse multiple spaces/tabs into a single space and trim.
 */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Clean a LinkedIn headline by removing emojis, separators, and noise,
 * then extracting the core job title.
 *
 * Strategy:
 *  1. Strip emojis
 *  2. Replace separators with spaces
 *  3. Remove common filler phrases ("looking for", "open to work", etc.)
 *  4. Collapse whitespace
 *  5. Take the first meaningful segment (typically the job title)
 */
export function cleanHeadline(raw: string): string {
  if (!raw) return '';

  let cleaned = stripEmojis(raw);
  cleaned = stripSeparators(cleaned);

  // Remove hashtags first (before filler patterns which might partially match hashtag content)
  cleaned = cleaned.replace(/(?:^|\s)#\w+/g, ' ');

  // Remove common LinkedIn filler phrases (case-insensitive)
  const fillerPatterns = [
    /\b(?:looking\s+for\s+(?:new\s+)?opportunities?)\b/gi,
    /\b(?:open\s+to\s+(?:new\s+)?(?:opportunities?|work|roles?))\b/gi,
    /\b(?:actively\s+(?:looking|seeking))\b/gi,
    /\b(?:hiring|we(?:'re|'re| are)\s+hiring)\b/gi,
    /\b(?:DM\s+me|connect\s+with\s+me)\b/gi,
  ];

  for (const pattern of fillerPatterns) {
    cleaned = cleaned.replace(pattern, ' ');
  }

  cleaned = normalizeWhitespace(cleaned);

  // If there are dashes acting as separators, take the first segment
  // but only if it looks like "Title - Company - Extra"
  const dashSegments = cleaned.split(/\s+-\s+/);
  if (dashSegments.length > 1 && dashSegments[0].length > 3) {
    cleaned = dashSegments[0];
  }

  return normalizeWhitespace(cleaned);
}

/**
 * Safely coerce a value to a trimmed string, returning fallback for nullish/empty.
 */
export function safeString(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback;
  const str = String(value).trim();
  return str.length > 0 ? str : fallback;
}
