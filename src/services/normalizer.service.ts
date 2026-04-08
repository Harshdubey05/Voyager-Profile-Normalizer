/**
 * Profile Normalizer Service
 *
 * Orchestrates the normalization pipeline for LinkedIn profile data.
 * Supports both full profiles and mini profiles.
 */

import type {
  RawLinkedInProfile,
  RawMiniProfile,
  RawExperience,
  CleanedProfile,
  CleanedMiniProfile,
  CleanedExperience,
  CleanedEducation,
  CurrentRole,
} from '../types/profile.types.js';

import { cleanHeadline, safeString } from '../utils/text.utils.js';
import { parseLocation } from '../utils/location.utils.js';
import { extractIdFromUrn } from '../utils/urn.utils.js';
import { calculateDurationMonths, isCurrent, normalizeDate } from '../utils/date.utils.js';
import { resolveProfilePictureUrl, resolveImageFromReference } from '../utils/image.utils.js';

const VERSION = '1.0.0';

// ─── Profile Type Detection ─────────────────────────────────────────────────

/**
 * Detect whether the input JSON is a full profile or a mini profile.
 *
 * Mini profiles have `publicIdentifier` and/or `entityUrn` with "miniProfile".
 * Full profiles have `experience`, `education`, or `locationName`.
 */
export function detectProfileType(
  data: Record<string, unknown>,
): 'full' | 'mini' | 'unknown' {
  // Mini profile signals
  if (
    'publicIdentifier' in data ||
    'occupation' in data ||
    (typeof data.entityUrn === 'string' && data.entityUrn.includes('miniProfile'))
  ) {
    return 'mini';
  }

  // Full profile signals
  if (
    'experience' in data ||
    'education' in data ||
    'locationName' in data ||
    'summary' in data ||
    'industryName' in data
  ) {
    return 'full';
  }

  // Fallback: if it has firstName/lastName + headline, treat as full
  if ('firstName' in data && 'headline' in data) {
    return 'full';
  }

  return 'unknown';
}


// ─── Full Profile Normalization ──────────────────────────────────────────────

export function normalizeFullProfile(raw: RawLinkedInProfile): CleanedProfile {
  const firstName = safeString(raw.firstName);
  const lastName = safeString(raw.lastName);
  const headline = safeString(raw.headline);

  const experience = normalizeExperience(raw.experience);
  const currentRole = findCurrentRole(raw.experience);

  return {
    id: extractIdFromUrn(raw.urn),
    firstName,
    lastName,
    fullName: [firstName, lastName].filter(Boolean).join(' '),
    headline,
    cleanHeadline: cleanHeadline(headline),
    summary: safeString(raw.summary),
    industry: safeString(raw.industryName),
    location: parseLocation(
      raw.locationName,
      raw.geoLocationName,
      raw.geoCountryName,
    ),
    profilePictureUrl: resolveProfilePictureUrl(raw.profilePicture),
    currentRole,
    experience,
    education: normalizeEducation(raw.education),
    skills: normalizeSkills(raw.skills),
    languages: (raw.languages ?? []).map((l) => ({
      name: safeString(l.name),
      proficiency: safeString(l.proficiency),
    })),
    certifications: (raw.certifications ?? []).map((c) => ({
      name: safeString(c.name),
      authority: safeString(c.authority),
      url: safeString(c.url),
    })),
    profileType: 'full',
    meta: {
      normalizedAt: new Date().toISOString(),
      version: VERSION,
    },
  };
}


// ─── Mini Profile Normalization ──────────────────────────────────────────────

export function normalizeMiniProfile(raw: RawMiniProfile): CleanedMiniProfile {
  const firstName = safeString(raw.firstName);
  const lastName = safeString(raw.lastName);
  const headline = safeString(raw.headline);

  return {
    id: extractIdFromUrn(raw.entityUrn),
    firstName,
    lastName,
    fullName: [firstName, lastName].filter(Boolean).join(' '),
    headline,
    cleanHeadline: cleanHeadline(headline),
    occupation: safeString(raw.occupation),
    publicIdentifier: safeString(raw.publicIdentifier),
    trackingId: safeString(raw.trackingId) || null,
    profilePictureUrl: resolveImageFromReference(raw.picture),
    backgroundImageUrl: resolveImageFromReference(raw.backgroundImage),
    profileType: 'mini',
    meta: {
      normalizedAt: new Date().toISOString(),
      version: VERSION,
    },
  };
}


// ─── Experience Normalization ────────────────────────────────────────────────

function normalizeExperience(
  experiences?: RawExperience[],
): CleanedExperience[] {
  if (!experiences?.length) return [];

  return experiences.map((exp) => {
    const current = isCurrent(exp.timePeriod);
    return {
      id: extractIdFromUrn(exp.entityUrn),
      title: safeString(exp.title),
      company: safeString(exp.companyName) ||
        safeString(exp.company?.miniCompany?.name),
      companyId: extractIdFromUrn(exp.companyUrn),
      description: safeString(exp.description),
      location: parseLocation(exp.locationName, exp.geoLocationName),
      isCurrent: current,
      startDate: normalizeDate(exp.timePeriod?.startDate),
      endDate: current ? null : normalizeDate(exp.timePeriod?.endDate),
      durationMonths: calculateDurationMonths(exp.timePeriod),
    };
  });
}


// ─── Current Role Detection ──────────────────────────────────────────────────

function findCurrentRole(
  experiences?: RawExperience[],
): CurrentRole | null {
  if (!experiences?.length) return null;

  // Find the first experience with no end date (current role)
  const current = experiences.find((exp) => isCurrent(exp.timePeriod));
  if (!current) return null;

  return {
    title: safeString(current.title),
    company: safeString(current.companyName) ||
      safeString(current.company?.miniCompany?.name),
    startDate: normalizeDate(current.timePeriod?.startDate),
    tenureMonths: calculateDurationMonths(current.timePeriod),
  };
}


// ─── Education Normalization ─────────────────────────────────────────────────

function normalizeEducation(
  education?: Array<{
    entityUrn?: string;
    schoolName?: string;
    degreeName?: string;
    fieldOfStudy?: string;
    grade?: string;
    activities?: string;
    description?: string;
    timePeriod?: { startDate?: { year?: number }; endDate?: { year?: number } };
  }>,
): CleanedEducation[] {
  if (!education?.length) return [];

  return education.map((edu) => ({
    id: extractIdFromUrn(edu.entityUrn),
    school: safeString(edu.schoolName),
    degree: safeString(edu.degreeName),
    fieldOfStudy: safeString(edu.fieldOfStudy),
    grade: safeString(edu.grade),
    activities: safeString(edu.activities),
    description: safeString(edu.description),
    startYear: edu.timePeriod?.startDate?.year ?? null,
    endYear: edu.timePeriod?.endDate?.year ?? null,
  }));
}


// ─── Skills Normalization ────────────────────────────────────────────────────

function normalizeSkills(
  skills?: Array<{ name?: string }>,
): string[] {
  if (!skills?.length) return [];

  return skills
    .map((s) => safeString(s.name))
    .filter(Boolean)
    // Deduplicate (case-insensitive)
    .filter((name, index, arr) =>
      arr.findIndex((n) => n.toLowerCase() === name.toLowerCase()) === index,
    );
}
