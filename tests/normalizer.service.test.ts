/**
 * Integration test for the normalizer service.
 */

import { describe, it, expect } from 'vitest';
import {
  detectProfileType,
  normalizeFullProfile,
  normalizeMiniProfile,
} from '../src/services/normalizer.service.js';

describe('detectProfileType', () => {
  it('detects a full profile', () => {
    expect(
      detectProfileType({
        firstName: 'John',
        lastName: 'Doe',
        headline: 'Engineer',
        experience: [],
        education: [],
        locationName: 'New York',
      }),
    ).toBe('full');
  });

  it('detects a mini profile', () => {
    expect(
      detectProfileType({
        entityUrn: 'urn:li:fs_miniProfile:ABC123',
        firstName: 'Jane',
        lastName: 'Doe',
        publicIdentifier: 'janedoe',
      }),
    ).toBe('mini');
  });

  it('returns unknown for unrecognizable data', () => {
    expect(detectProfileType({ randomField: 'value' })).toBe('unknown');
  });

  it('detects full profile from headline + firstName combo', () => {
    expect(
      detectProfileType({
        firstName: 'Alice',
        headline: 'Product Manager',
      }),
    ).toBe('full');
  });
});

describe('normalizeFullProfile', () => {
  const rawProfile = {
    urn: 'urn:li:fs_profile:AbCdEf123',
    firstName: 'Harsh',
    lastName: 'Dubey',
    headline: '🚀 Senior Software Engineer | AI/ML | Open to Work 💼',
    summary: 'Experienced engineer with 10+ years in backend development.',
    industryName: 'Information Technology & Services',
    locationName: 'Bengaluru, Karnataka, India',
    geoLocationName: 'Bengaluru',
    geoCountryName: 'India',
    experience: [
      {
        entityUrn: 'urn:li:fs_position:(AbCdEf123,111222333)',
        companyName: 'Google',
        title: 'Senior Software Engineer',
        locationName: 'Bengaluru, India',
        timePeriod: {
          startDate: { month: 3, year: 2022 },
          // No endDate — current role
        },
      },
      {
        entityUrn: 'urn:li:fs_position:(AbCdEf123,444555666)',
        companyName: 'Microsoft',
        title: 'Software Engineer',
        timePeriod: {
          startDate: { month: 6, year: 2018 },
          endDate: { month: 2, year: 2022 },
        },
      },
    ],
    education: [
      {
        entityUrn: 'urn:li:fs_education:(AbCdEf123,777888999)',
        schoolName: 'IIT Bombay',
        degreeName: 'B.Tech',
        fieldOfStudy: 'Computer Science',
        timePeriod: {
          startDate: { year: 2014 },
          endDate: { year: 2018 },
        },
      },
    ],
    skills: [{ name: 'Python' }, { name: 'TypeScript' }, { name: 'python' }],
    languages: [{ name: 'English', proficiency: 'NATIVE_OR_BILINGUAL' }],
    certifications: [
      { name: 'AWS Solutions Architect', authority: 'Amazon' },
    ],
  };

  it('normalizes a full profile correctly', () => {
    const result = normalizeFullProfile(rawProfile);

    // Identity
    expect(result.id).toBe('AbCdEf123');
    expect(result.firstName).toBe('Harsh');
    expect(result.lastName).toBe('Dubey');
    expect(result.fullName).toBe('Harsh Dubey');
    expect(result.profileType).toBe('full');

    // Headline cleaning
    expect(result.cleanHeadline).not.toContain('🚀');
    expect(result.cleanHeadline).not.toContain('💼');
    expect(result.cleanHeadline).not.toContain('|');
    expect(result.cleanHeadline).not.toMatch(/open to work/i);

    // Location parsing
    expect(result.location.city).toBe('Bengaluru');
    expect(result.location.state).toBe('Karnataka');
    expect(result.location.country).toBe('India');

    // Current role
    expect(result.currentRole).not.toBeNull();
    expect(result.currentRole!.title).toBe('Senior Software Engineer');
    expect(result.currentRole!.company).toBe('Google');
    expect(result.currentRole!.tenureMonths).toBeGreaterThan(0);

    // Experience
    expect(result.experience).toHaveLength(2);
    expect(result.experience[0].isCurrent).toBe(true);
    expect(result.experience[0].id).toBe('111222333');
    expect(result.experience[1].isCurrent).toBe(false);
    expect(result.experience[1].durationMonths).toBe(44); // Jun 2018 to Feb 2022

    // Education
    expect(result.education).toHaveLength(1);
    expect(result.education[0].school).toBe('IIT Bombay');

    // Skills (deduplicated)
    expect(result.skills).toEqual(['Python', 'TypeScript']);

    // Meta
    expect(result.meta.version).toBe('1.0.0');
    expect(result.meta.normalizedAt).toBeTruthy();
  });
});

describe('normalizeMiniProfile', () => {
  const rawMini = {
    entityUrn: 'urn:li:fs_miniProfile:XyZ789',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    headline: '✨ Product Manager | Fintech Enthusiast',
    occupation: 'Product Manager at Razorpay',
    publicIdentifier: 'rajeshkumar',
    trackingId: 'abc123tracking',
  };

  it('normalizes a mini profile correctly', () => {
    const result = normalizeMiniProfile(rawMini);

    expect(result.id).toBe('XyZ789');
    expect(result.fullName).toBe('Rajesh Kumar');
    expect(result.cleanHeadline).not.toContain('✨');
    expect(result.cleanHeadline).not.toContain('|');
    expect(result.occupation).toBe('Product Manager at Razorpay');
    expect(result.publicIdentifier).toBe('rajeshkumar');
    expect(result.profileType).toBe('mini');
  });
});
