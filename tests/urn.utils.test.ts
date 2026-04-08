/**
 * Unit tests for URN parsing utilities.
 */

import { describe, it, expect } from 'vitest';
import { extractIdFromUrn, extractTypeFromUrn } from '../src/utils/urn.utils.js';

describe('extractIdFromUrn', () => {
  it('extracts ID from a standard profile URN', () => {
    expect(extractIdFromUrn('urn:li:fs_profile:AbC123XyZ')).toBe('AbC123XyZ');
  });

  it('extracts ID from a member URN', () => {
    expect(extractIdFromUrn('urn:li:member:123456789')).toBe('123456789');
  });

  it('extracts ID from a mini profile URN', () => {
    expect(extractIdFromUrn('urn:li:fs_miniProfile:AbC123XyZ')).toBe('AbC123XyZ');
  });

  it('extracts secondary ID from a tuple URN', () => {
    expect(extractIdFromUrn('urn:li:fs_position:(AbC123,987654321)')).toBe('987654321');
  });

  it('extracts ID from a company URN', () => {
    expect(extractIdFromUrn('urn:li:company:12345')).toBe('12345');
  });

  it('returns null for null input', () => {
    expect(extractIdFromUrn(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(extractIdFromUrn(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(extractIdFromUrn('')).toBeNull();
  });

  it('returns null for non-URN strings', () => {
    expect(extractIdFromUrn('just-a-random-string')).toBeNull();
  });
});

describe('extractTypeFromUrn', () => {
  it('extracts type from a profile URN', () => {
    expect(extractTypeFromUrn('urn:li:fs_profile:AbC123XyZ')).toBe('fs_profile');
  });

  it('extracts type from a member URN', () => {
    expect(extractTypeFromUrn('urn:li:member:123')).toBe('member');
  });

  it('returns null for invalid input', () => {
    expect(extractTypeFromUrn(null)).toBeNull();
    expect(extractTypeFromUrn('')).toBeNull();
  });
});
