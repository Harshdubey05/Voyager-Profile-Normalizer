// ─── Raw LinkedIn Profile Types (Input) ─────────────────────────────────────

export interface RawLinkedInProfile {
  urn?: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  summary?: string;
  industryName?: string;
  locationName?: string;
  geoLocationName?: string;
  geoCountryName?: string;
  profilePicture?: {
    displayImageReference?: {
      vectorImage?: {
        rootUrl?: string;
        artifacts?: Array<{
          width: number;
          height: number;
          fileIdentifyingUrlPathSegment: string;
        }>;
      };
    };
  };
  experience?: RawExperience[];
  education?: RawEducation[];
  skills?: RawSkill[];
  languages?: RawLanguage[];
  certifications?: RawCertification[];
  publications?: RawPublication[];
  projects?: RawProject[];
  volunteer?: RawVolunteer[];
}

export interface RawMiniProfile {
  entityUrn?: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  occupation?: string;
  publicIdentifier?: string;
  trackingId?: string;
  backgroundImage?: RawImageReference;
  picture?: RawImageReference;
}

export interface RawImageReference {
  'com.linkedin.common.VectorImage'?: {
    rootUrl?: string;
    artifacts?: Array<{
      width: number;
      height: number;
      fileIdentifyingUrlPathSegment: string;
    }>;
  };
}

export interface RawExperience {
  entityUrn?: string;
  companyName?: string;
  companyUrn?: string;
  title?: string;
  description?: string;
  locationName?: string;
  geoLocationName?: string;
  timePeriod?: RawTimePeriod;
  company?: {
    miniCompany?: {
      name?: string;
      universalName?: string;
      logo?: RawImageReference;
    };
  };
}

export interface RawTimePeriod {
  startDate?: { month?: number; year?: number };
  endDate?: { month?: number; year?: number };
}

export interface RawEducation {
  entityUrn?: string;
  schoolName?: string;
  schoolUrn?: string;
  degreeName?: string;
  fieldOfStudy?: string;
  grade?: string;
  activities?: string;
  description?: string;
  timePeriod?: RawTimePeriod;
}

export interface RawSkill {
  entityUrn?: string;
  name?: string;
}

export interface RawLanguage {
  name?: string;
  proficiency?: string;
}

export interface RawCertification {
  name?: string;
  authority?: string;
  url?: string;
  timePeriod?: RawTimePeriod;
}

export interface RawPublication {
  name?: string;
  publisher?: string;
  url?: string;
  date?: { month?: number; year?: number };
  description?: string;
  authors?: Array<{ name?: string }>;
}

export interface RawProject {
  title?: string;
  description?: string;
  url?: string;
  timePeriod?: RawTimePeriod;
  members?: Array<{ name?: string }>;
}

export interface RawVolunteer {
  companyName?: string;
  role?: string;
  cause?: string;
  description?: string;
  timePeriod?: RawTimePeriod;
}


// ─── Cleaned Profile Types (Output) ──────────────────────────────────────────

export interface CleanedProfile {
  id: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  headline: string;
  cleanHeadline: string;
  summary: string;
  industry: string;
  location: ParsedLocation;
  profilePictureUrl: string | null;
  currentRole: CurrentRole | null;
  experience: CleanedExperience[];
  education: CleanedEducation[];
  skills: string[];
  languages: CleanedLanguage[];
  certifications: CleanedCertification[];
  profileType: 'full' | 'mini';
  meta: ProfileMeta;
}

export interface CleanedMiniProfile {
  id: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  headline: string;
  cleanHeadline: string;
  occupation: string;
  publicIdentifier: string;
  trackingId: string | null;
  profilePictureUrl: string | null;
  backgroundImageUrl: string | null;
  profileType: 'mini';
  meta: ProfileMeta;
}

export interface ParsedLocation {
  raw: string;
  city: string | null;
  state: string | null;
  country: string | null;
}

export interface CurrentRole {
  title: string;
  company: string;
  startDate: { month: number | null; year: number | null };
  tenureMonths: number | null;
}

export interface CleanedExperience {
  id: string | null;
  title: string;
  company: string;
  companyId: string | null;
  description: string;
  location: ParsedLocation;
  isCurrent: boolean;
  startDate: { month: number | null; year: number | null };
  endDate: { month: number | null; year: number | null } | null;
  durationMonths: number | null;
}

export interface CleanedEducation {
  id: string | null;
  school: string;
  degree: string;
  fieldOfStudy: string;
  grade: string;
  activities: string;
  description: string;
  startYear: number | null;
  endYear: number | null;
}

export interface CleanedLanguage {
  name: string;
  proficiency: string;
}

export interface CleanedCertification {
  name: string;
  authority: string;
  url: string;
}

export interface ProfileMeta {
  normalizedAt: string;
  version: string;
}
