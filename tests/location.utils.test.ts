/**
 * Unit tests for location parsing utilities.
 */

import { describe, it, expect } from 'vitest';
import { parseLocation } from '../src/utils/location.utils.js';

describe('parseLocation', () => {
  it('parses "City, State, Country" format', () => {
    const result = parseLocation('Bengaluru, Karnataka, India');
    expect(result.city).toBe('Bengaluru');
    expect(result.state).toBe('Karnataka');
    expect(result.country).toBe('India');
    expect(result.raw).toBe('Bengaluru, Karnataka, India');
  });

  it('parses "City, Country" format', () => {
    const result = parseLocation('London, United Kingdom');
    expect(result.city).toBe('London');
    expect(result.state).toBeNull();
    expect(result.country).toBe('United Kingdom');
  });

  it('parses US "City, State" format and infers country', () => {
    const result = parseLocation('San Francisco, California');
    expect(result.city).toBe('San Francisco');
    expect(result.state).toBe('California');
    expect(result.country).toBe('United States');
  });

  it('handles single country name', () => {
    const result = parseLocation('India');
    expect(result.city).toBeNull();
    expect(result.country).toBe('India');
  });

  it('handles single city name', () => {
    const result = parseLocation('Mumbai');
    expect(result.city).toBe('Mumbai');
    expect(result.country).toBeNull();
  });

  it('uses geoCountryName as authoritative country', () => {
    const result = parseLocation('Bengaluru Area', undefined, 'India');
    expect(result.city).toBe('Bengaluru Area');
    expect(result.country).toBe('India');
  });

  it('handles empty/undefined input', () => {
    const result = parseLocation(undefined);
    expect(result.city).toBeNull();
    expect(result.country).toBeNull();
    expect(result.raw).toBe('');
  });

  it('resolves country aliases', () => {
    const result = parseLocation('New York, US');
    expect(result.city).toBe('New York');
    expect(result.country).toBe('United States');
  });

  it('resolves UK alias', () => {
    const result = parseLocation('London, UK');
    expect(result.city).toBe('London');
    expect(result.country).toBe('United Kingdom');
  });
});
