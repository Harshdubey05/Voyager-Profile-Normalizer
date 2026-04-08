/**
 * Unit tests for the text cleaning utilities.
 */

import { describe, it, expect } from 'vitest';
import { stripEmojis, stripSeparators, normalizeWhitespace, cleanHeadline, safeString } from '../src/utils/text.utils.js';

describe('stripEmojis', () => {
  it('removes emoji characters', () => {
    expect(stripEmojis('🚀 Software Engineer 💻')).toBe(' Software Engineer ');
  });

  it('handles strings with no emojis', () => {
    expect(stripEmojis('Software Engineer')).toBe('Software Engineer');
  });

  it('handles empty strings', () => {
    expect(stripEmojis('')).toBe('');
  });
});

describe('stripSeparators', () => {
  it('removes pipe separators', () => {
    expect(stripSeparators('Engineer | Startup | AI')).toBe('Engineer   Startup   AI');
  });

  it('removes bullet separators', () => {
    expect(stripSeparators('Engineer • Startup • AI')).toBe('Engineer   Startup   AI');
  });

  it('removes star separators', () => {
    expect(stripSeparators('Engineer ★ Startup')).toBe('Engineer   Startup');
  });
});

describe('normalizeWhitespace', () => {
  it('collapses multiple spaces', () => {
    expect(normalizeWhitespace('  hello   world  ')).toBe('hello world');
  });

  it('handles tabs and newlines', () => {
    expect(normalizeWhitespace('hello\t\n  world')).toBe('hello world');
  });
});

describe('cleanHeadline', () => {
  it('cleans a typical noisy headline', () => {
    const raw = '🚀 Senior Software Engineer | AI/ML | Open to Work 💼';
    const cleaned = cleanHeadline(raw);
    expect(cleaned).not.toContain('🚀');
    expect(cleaned).not.toContain('💼');
    expect(cleaned).not.toContain('|');
    expect(cleaned).not.toMatch(/open to work/i);
    expect(cleaned.length).toBeGreaterThan(0);
  });

  it('preserves simple clean headlines', () => {
    expect(cleanHeadline('Software Engineer')).toBe('Software Engineer');
  });

  it('handles empty input', () => {
    expect(cleanHeadline('')).toBe('');
  });

  it('removes hashtags', () => {
    const cleaned = cleanHeadline('Developer #OpenToWork #Hiring');
    expect(cleaned).not.toContain('#');
  });

  it('handles dash-separated headlines', () => {
    const cleaned = cleanHeadline('Senior Engineer - Google - Mountain View');
    expect(cleaned).toBe('Senior Engineer');
  });
});

describe('safeString', () => {
  it('returns trimmed string for valid input', () => {
    expect(safeString('  hello  ')).toBe('hello');
  });

  it('returns fallback for null', () => {
    expect(safeString(null, 'fallback')).toBe('fallback');
  });

  it('returns fallback for undefined', () => {
    expect(safeString(undefined)).toBe('');
  });

  it('returns fallback for empty string', () => {
    expect(safeString('   ', 'default')).toBe('default');
  });
});
