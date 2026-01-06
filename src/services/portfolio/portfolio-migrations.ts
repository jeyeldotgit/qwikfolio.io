/**
 * Portfolio Migration Helpers
 *
 * These functions handle migration of legacy portfolio data to the new v1 schema format.
 * Used when loading portfolios from the database to ensure backward compatibility.
 */

import type {
  Portfolio,
  PersonalInfo,
  Skill,
  Project,
  Experience,
  Education,
  SocialLink,
} from "@/schemas/portfolio";

/**
 * Migrates legacy social links (github, linkedin) to new socialLinks array
 */
export function migrateSocialLinks(
  github?: string | null,
  linkedin?: string | null
): SocialLink[] {
  const socialLinks: SocialLink[] = [];

  if (github && github.trim() !== "") {
    socialLinks.push({ type: "github", url: github });
  }

  if (linkedin && linkedin.trim() !== "") {
    socialLinks.push({ type: "linkedin", url: linkedin });
  }

  return socialLinks;
}

/**
 * Migrates legacy skill string to structured skill object
 */
export function migrateSkill(skillString: string): Skill {
  return {
    name: skillString,
    category: "tool", // Default category for migrated skills
    level: "intermediate", // Default level for migrated skills
  };
}

/**
 * Migrates legacy skills array (string[]) to structured skills array
 */
export function migrateSkills(skills: string[]): Skill[] {
  return skills.map(migrateSkill);
}

/**
 * Migrates legacy personal info to new format
 */
export function migratePersonalInfo(legacy: {
  name: string;
  headline: string;
  email: string;
  phone?: string | null;
  bio?: string | null;
  website?: string | null;
  github?: string | null;
  linkedin?: string | null;
  location?: string | null;
  roleLevel?: string | null;
  availability?: string | null;
  hourlyRate?: number | null;
  salaryRange?: string | null;
  profilePhotoUrl?: string | null;
  socialLinks?: SocialLink[] | null;
}): PersonalInfo {
  // Migrate social links if not already migrated
  const socialLinks =
    legacy.socialLinks && legacy.socialLinks.length > 0
      ? legacy.socialLinks
      : migrateSocialLinks(legacy.github, legacy.linkedin);

  return {
    name: legacy.name,
    headline: legacy.headline,
    email: legacy.email,
    phone: legacy.phone || undefined,
    bio: legacy.bio || undefined,
    website: legacy.website || undefined,
    location: legacy.location || undefined,
    roleLevel: legacy.roleLevel as PersonalInfo["roleLevel"] | undefined,
    availability: legacy.availability as
      | PersonalInfo["availability"]
      | undefined,
    hourlyRate: legacy.hourlyRate || undefined,
    salaryRange: legacy.salaryRange || undefined,
    profilePhotoUrl: legacy.profilePhotoUrl || undefined,
    socialLinks,
    // Keep legacy fields for backward compatibility
    github: legacy.github || "",
    linkedin: legacy.linkedin || "",
  };
}

/**
 * Migrates legacy portfolio data from database format to new schema
 */
export function migrateLegacyPortfolio(legacy: {
  // Personal info
  name: string;
  headline: string;
  email: string;
  phone?: string | null;
  bio?: string | null;
  website?: string | null;
  github?: string | null;
  linkedin?: string | null;
  location?: string | null;
  roleLevel?: string | null;
  availability?: string | null;
  hourlyRate?: number | null;
  salaryRange?: string | null;
  profilePhotoUrl?: string | null;
  socialLinks?: SocialLink[] | null;

  // Skills - can be string[] or structured Skill[]
  skills?: string[] | Skill[];

  // Projects
  projects?: any[];

  // Experience
  experience?: any[];

  // Education
  education?: any[];

  // Settings
  published?: boolean;
  slug?: string | null;
  settings?: any;

  // Theme
  theme?: any;

  // Primary stack
  primaryStack?: string[] | null;
}): Portfolio {
  // Migrate personal info
  const personalInfo = migratePersonalInfo({
    name: legacy.name,
    headline: legacy.headline,
    email: legacy.email,
    phone: legacy.phone,
    bio: legacy.bio,
    website: legacy.website,
    github: legacy.github,
    linkedin: legacy.linkedin,
    location: legacy.location,
    roleLevel: legacy.roleLevel,
    availability: legacy.availability,
    hourlyRate: legacy.hourlyRate,
    salaryRange: legacy.salaryRange,
    profilePhotoUrl: legacy.profilePhotoUrl,
    socialLinks: legacy.socialLinks,
  });

  // Migrate skills
  let skills: Skill[] = [];
  if (legacy.skills) {
    if (legacy.skills.length > 0) {
      // Check if first item is a string (legacy) or object (new format)
      if (typeof legacy.skills[0] === "string") {
        skills = migrateSkills(legacy.skills as string[]);
      } else {
        skills = legacy.skills as Skill[];
      }
    }
  }

  // Migrate projects (ensure all new fields have defaults)
  const projects: Project[] = (legacy.projects || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    techStack: p.techStack || [],
    repoUrl: p.repoUrl || "",
    liveUrl: p.liveUrl || "",
    role: p.role || undefined,
    highlights: p.highlights || [],
    tags: p.tags || [],
    featured: p.featured || false,
    order: p.order || 0,
    media: p.media || undefined,
  }));

  // Migrate experience
  const experience: Experience[] = (legacy.experience || []).map((e: any) => ({
    id: e.id,
    company: e.company,
    role: e.role,
    startDate: e.startDate,
    endDate: e.endDate || undefined,
    current: e.current || false,
    location: e.location || undefined,
    employmentType: e.employmentType || undefined,
    description: e.description || undefined,
    achievements: e.achievements || undefined,
  }));

  // Migrate education
  const education: Education[] = (legacy.education || []).map((e: any) => ({
    id: e.id,
    school: e.school,
    degree: e.degree,
    field: e.field,
    startDate: e.startDate,
    endDate: e.endDate || undefined,
    current: e.current || false,
    description: e.description || undefined,
    gpa: e.gpa || undefined,
    coursework: e.coursework || undefined,
    honors: e.honors || undefined,
  }));

  // Migrate settings
  const settings = legacy.settings || {
    isPublic: legacy.published || false,
    showContactForm: true,
    ...(legacy.slug && { slug: legacy.slug }),
  };

  // Migrate theme
  const theme = legacy.theme || {
    id: "emerald",
    primaryColor: "emerald",
    accentStyle: "soft",
    radius: "md",
    layout: "sidebar-left",
    showProfilePhoto: true,
  };

  return {
    personalInfo,
    skills,
    projects,
    experience: experience.length > 0 ? experience : undefined,
    education: education.length > 0 ? education : undefined,
    certifications: undefined, // New field, no legacy data
    primaryStack: legacy.primaryStack || undefined,
    settings,
    theme,
  };
}

/**
 * Validates and normalizes a portfolio object, applying migrations if needed
 */
export function normalizePortfolio(data: any): Portfolio {
  // Check if this looks like legacy format
  const isLegacyFormat =
    (data.skills && typeof data.skills[0] === "string") ||
    data.github ||
    data.linkedin ||
    !data.personalInfo;

  if (isLegacyFormat) {
    return migrateLegacyPortfolio(data);
  }

  // Already in new format, but ensure defaults are applied
  return {
    personalInfo: data.personalInfo,
    skills: data.skills || [],
    projects: data.projects || [],
    experience: data.experience,
    education: data.education,
    certifications: data.certifications,
    primaryStack: data.primaryStack,
    settings: {
      isPublic: false,
      showContactForm: true,
      ...data.settings,
    },
    theme: {
      id: "emerald",
      primaryColor: "emerald",
      accentStyle: "soft",
      radius: "md",
      layout: "sidebar-left",
      showProfilePhoto: true,
      ...data.theme,
    },
  };
}
