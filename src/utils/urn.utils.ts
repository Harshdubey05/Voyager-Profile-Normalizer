/**
 * URN parsing utilities for LinkedIn profile normalization.
 *
 * LinkedIn uses URN (Uniform Resource Name) strings to identify entities.
 * Examples:
 *  - "urn:li:fs_profile:AbC123XyZ"
 *  - "urn:li:member:123456789"
 *  - "urn:li:fs_miniProfile:AbC123XyZ"
 *  - "urn:li:company:12345"
 *  - "urn:li:fs_position:(AbC123XyZ,1234567890)"
 */

/**
 * Extract the unique identifier from a LinkedIn URN string.
 *
 * Handles formats:
 *  - "urn:li:fs_profile:AbC123XyZ"         → "AbC123XyZ"
 *  - "urn:li:member:123456789"              → "123456789"
 *  - "urn:li:fs_miniProfile:AbC123XyZ"      → "AbC123XyZ"
 *  - "urn:li:fs_position:(ABC,12345)"       → "12345" (secondary ID)
 *  - "urn:li:company:12345"                 → "12345"
 */
export function extractIdFromUrn(urn: string | undefined | null): string | null {
  if (!urn || typeof urn !== 'string') return null;

  const trimmed = urn.trim();

  // Handle tuple URNs like "urn:li:fs_position:(profileId,positionId)"
  const tupleMatch = trimmed.match(/^urn:li:\w+:\(([^,]+),([^)]+)\)$/);
  if (tupleMatch) {
    return tupleMatch[2]; // Return the entity-specific ID (second element)
  }

  // Handle standard URNs like "urn:li:fs_profile:AbC123XyZ"
  const standardMatch = trimmed.match(/^urn:li:\w+:(.+)$/);
  if (standardMatch) {
    return standardMatch[1];
  }

  // If it doesn't match URN format, return null
  return null;
}

/**
 * Extract the entity type from a LinkedIn URN.
 *
 * "urn:li:fs_profile:AbC123XyZ" → "fs_profile"
 * "urn:li:member:123456789"     → "member"
 */
export function extractTypeFromUrn(urn: string | undefined | null): string | null {
  if (!urn || typeof urn !== 'string') return null;

  const match = urn.trim().match(/^urn:li:(\w+):/);
  return match ? match[1] : null;
}
