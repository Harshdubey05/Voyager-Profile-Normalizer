/**
 * Location parsing utilities for LinkedIn profile normalization.
 *
 * Parses free-text location strings like "Bengaluru, Karnataka, India"
 * into structured { city, state, country } objects.
 */

import type { ParsedLocation } from '../types/profile.types.js';

// ─── Known country names for disambiguation ──────────────────────────────────

const KNOWN_COUNTRIES = new Set([
  'india', 'united states', 'united kingdom', 'canada', 'australia',
  'germany', 'france', 'netherlands', 'singapore', 'japan', 'china',
  'brazil', 'south korea', 'ireland', 'israel', 'switzerland', 'sweden',
  'norway', 'denmark', 'finland', 'spain', 'italy', 'portugal',
  'belgium', 'austria', 'poland', 'czech republic', 'new zealand',
  'south africa', 'mexico', 'argentina', 'chile', 'colombia', 'peru',
  'thailand', 'vietnam', 'indonesia', 'malaysia', 'philippines',
  'uae', 'united arab emirates', 'saudi arabia', 'qatar', 'bahrain',
  'kuwait', 'oman', 'egypt', 'nigeria', 'kenya', 'ghana', 'pakistan',
  'bangladesh', 'sri lanka', 'nepal', 'russia', 'ukraine', 'romania',
  'hungary', 'turkey', 'greece', 'croatia', 'serbia',
]);

// Common abbreviations → full country names
const COUNTRY_ALIASES: Record<string, string> = {
  'us': 'United States',
  'usa': 'United States',
  'u.s.': 'United States',
  'u.s.a.': 'United States',
  'uk': 'United Kingdom',
  'u.k.': 'United Kingdom',
  'uae': 'United Arab Emirates',
  'u.a.e.': 'United Arab Emirates',
  'ksa': 'Saudi Arabia',
};

// Known US states / territories for 2-part "City, State" patterns
const US_STATES = new Set([
  'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado',
  'connecticut', 'delaware', 'florida', 'georgia', 'hawaii', 'idaho',
  'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana',
  'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota',
  'mississippi', 'missouri', 'montana', 'nebraska', 'nevada',
  'new hampshire', 'new jersey', 'new mexico', 'new york',
  'north carolina', 'north dakota', 'ohio', 'oklahoma', 'oregon',
  'pennsylvania', 'rhode island', 'south carolina', 'south dakota',
  'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington',
  'west virginia', 'wisconsin', 'wyoming', 'district of columbia',
]);

/**
 * Parse a raw location string into structured components.
 *
 * Handles patterns:
 *  - "City, State, Country"   → { city, state, country }
 *  - "City, Country"          → { city, null, country }
 *  - "City, State" (US)       → { city, state, "United States" }
 *  - "Country"                → { null, null, country }
 *  - "City Area"              → { city, null, null }
 */
export function parseLocation(
  locationName?: string,
  geoLocationName?: string,
  geoCountryName?: string,
): ParsedLocation {
  const raw = locationName || geoLocationName || '';

  if (!raw.trim()) {
    return {
      raw: '',
      city: geoLocationName?.trim() || null,
      state: null,
      country: geoCountryName?.trim() || null,
    };
  }

  const parts = raw.split(',').map((p) => p.trim()).filter(Boolean);

  // If we have an explicit geoCountryName, use it as the authoritative country
  const explicitCountry = geoCountryName?.trim() || null;

  if (parts.length >= 3) {
    // "City, State/Province, Country"
    return {
      raw,
      city: parts[0],
      state: parts[1],
      country: explicitCountry || resolveCountry(parts[2]),
    };
  }

  if (parts.length === 2) {
    const second = parts[1].toLowerCase();

    // Check if second part is a country
    if (isCountry(second)) {
      return {
        raw,
        city: parts[0],
        state: null,
        country: explicitCountry || resolveCountry(parts[1]),
      };
    }

    // Check if second part is a US state
    if (US_STATES.has(second)) {
      return {
        raw,
        city: parts[0],
        state: parts[1],
        country: explicitCountry || 'United States',
      };
    }

    // Default: treat as "City, State/Region"
    return {
      raw,
      city: parts[0],
      state: parts[1],
      country: explicitCountry,
    };
  }

  if (parts.length === 1) {
    const single = parts[0].toLowerCase();

    // If the single value is a country name
    if (isCountry(single)) {
      return {
        raw,
        city: null,
        state: null,
        country: resolveCountry(parts[0]),
      };
    }

    // Otherwise treat as city
    return {
      raw,
      city: parts[0],
      state: null,
      country: explicitCountry,
    };
  }

  return { raw, city: null, state: null, country: explicitCountry };
}

/**
 * Check if a string is a recognized country name or alias.
 */
function isCountry(value: string): boolean {
  const lower = value.toLowerCase();
  return KNOWN_COUNTRIES.has(lower) || lower in COUNTRY_ALIASES;
}

/**
 * Resolve a country string to its canonical form.
 */
function resolveCountry(value: string): string {
  const lower = value.toLowerCase().trim();
  if (lower in COUNTRY_ALIASES) {
    return COUNTRY_ALIASES[lower];
  }
  // Title-case the input
  return value.trim();
}
