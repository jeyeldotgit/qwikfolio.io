import type {
  Portfolio,
  PersonalInfo,
  Skill,
  Project,
  Experience,
  Education,
  Certification,
} from "@/schemas/portfolio";
import { portfolioSchema } from "@/schemas/portfolio";
import { PortfolioServiceError } from "./portfolio-errors";
import { normalizePortfolio, migrateSkill } from "./portfolio-migrations";

type PortfolioData = {
  name: string;
  headline: string;
  email: string;
  phone: string | null;
  bio: string | null;
  website: string | null;
  github: string | null;
  linkedin: string | null;
  location: string | null;
  role_level: string | null;
  availability: string | null;
  hourly_rate: number | null;
  salary_range: string | null;
  profile_photo_url: string | null;
  social_links: any; // JSONB
  settings: any; // JSONB
  theme: any; // JSONB
  primary_stack: any; // JSONB
  slug: string | null;
  published: boolean | null;
};

type StructuredSkillsData = {
  id: string;
  name: string | null;
  category: string | null;
  level: string | null;
  years_experience: number | null;
  skill?: string; // Legacy field
}[];

type ProjectsData = {
  id: string;
  name: string;
  description: string;
  repo_url: string | null;
  live_url: string | null;
  role: string | null;
  highlights: any; // JSONB
  tags: any; // JSONB
  featured: boolean | null;
  order: number | null;
  media: any; // JSONB
}[];
type TechStackMap = Record<string, string[]>;
type ExperienceData = {
  id: string;
  company: string;
  role: string;
  start_date: string;
  end_date: string | null;
  current: boolean | null;
  location: string | null;
  employment_type: string | null;
  description: string | null;
  achievements: any; // JSONB
}[];
type EducationData = {
  id: string;
  school: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string | null;
  current: boolean | null;
  description: string | null;
  gpa: number | null;
  coursework: any; // JSONB
  honors: string | null;
}[];

type CertificationsData = {
  id: string;
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
}[];

export const assemblePortfolio = (
  portfolioData: PortfolioData,
  skillsData: StructuredSkillsData,
  projectsData: ProjectsData,
  techStackMap: TechStackMap,
  experienceData: ExperienceData,
  educationData: EducationData,
  certificationsData?: CertificationsData
): Portfolio => {
  // Parse JSONB fields
  const socialLinks = portfolioData.social_links
    ? (Array.isArray(portfolioData.social_links)
        ? portfolioData.social_links
        : JSON.parse(portfolioData.social_links))
    : [];
  const settings = portfolioData.settings
    ? (typeof portfolioData.settings === "object"
        ? portfolioData.settings
        : JSON.parse(portfolioData.settings))
    : {};
  const theme = portfolioData.theme
    ? (typeof portfolioData.theme === "object"
        ? portfolioData.theme
        : JSON.parse(portfolioData.theme))
    : {};
  const primaryStack = portfolioData.primary_stack
    ? (Array.isArray(portfolioData.primary_stack)
        ? portfolioData.primary_stack
        : JSON.parse(portfolioData.primary_stack))
    : [];

  // Convert null to undefined for optional enum fields (Zod doesn't accept null for optional enums)
  const roleLevel = portfolioData.role_level 
    ? (portfolioData.role_level as PersonalInfo["roleLevel"])
    : undefined;
  const availability = portfolioData.availability
    ? (portfolioData.availability as PersonalInfo["availability"])
    : undefined;

  const personalInfo: PersonalInfo = {
    name: portfolioData.name,
    headline: portfolioData.headline,
    email: portfolioData.email,
    phone: portfolioData.phone || undefined,
    bio: portfolioData.bio || undefined,
    website: portfolioData.website || "",
    location: portfolioData.location || undefined,
    roleLevel,
    availability,
    hourlyRate: portfolioData.hourly_rate || undefined,
    salaryRange: portfolioData.salary_range || undefined,
    profilePhotoUrl: portfolioData.profile_photo_url || "",
    socialLinks: socialLinks.length > 0 ? socialLinks : [],
    // Legacy fields for backward compatibility
    github: portfolioData.github || "",
    linkedin: portfolioData.linkedin || "",
  };

  // Migrate skills: handle both legacy (skill field) and new (name field) formats
  const skills: Skill[] = skillsData.map((s) => {
    if (s.name) {
      // New structured format - validate enums and convert null to defaults
      const validCategories = ["language", "framework", "tool", "soft_skill"] as const;
      const validLevels = ["beginner", "intermediate", "advanced"] as const;
      
      const category = s.category && validCategories.includes(s.category as any)
        ? (s.category as Skill["category"])
        : "tool";
      const level = s.level && validLevels.includes(s.level as any)
        ? (s.level as Skill["level"])
        : "intermediate";

      return {
        name: s.name,
        category,
        level,
        yearsExperience: s.years_experience || undefined,
      };
    } else if (s.skill) {
      // Legacy format - migrate it
      return migrateSkill(s.skill);
    } else {
      // Fallback
      return {
        name: "Unknown",
        category: "tool",
        level: "intermediate",
      };
    }
  });

  const projects: Project[] = projectsData.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    techStack: techStackMap[p.id] || [],
    repoUrl: p.repo_url || "",
    liveUrl: p.live_url || "",
    role: p.role || undefined,
    highlights: Array.isArray(p.highlights)
      ? p.highlights
      : p.highlights
      ? JSON.parse(p.highlights)
      : [],
    tags: Array.isArray(p.tags)
      ? p.tags
      : p.tags
      ? JSON.parse(p.tags)
      : [],
    featured: p.featured || false,
    order: p.order || 0,
    media: Array.isArray(p.media)
      ? p.media
      : p.media
      ? JSON.parse(p.media)
      : undefined,
  }));

  const experience: Experience[] = experienceData.map((e) => {
    // Convert null to undefined for optional enum fields
    const employmentType = e.employment_type
      ? (e.employment_type as Experience["employmentType"])
      : undefined;

    return {
      id: e.id,
      company: e.company,
      role: e.role,
      startDate: e.start_date,
      endDate: e.end_date || undefined,
      current: e.current || false,
      location: e.location || undefined,
      employmentType,
      description: e.description || undefined,
      achievements: Array.isArray(e.achievements)
        ? e.achievements
        : e.achievements
        ? JSON.parse(e.achievements)
        : undefined,
    };
  });

  const education: Education[] = educationData.map((e) => ({
    id: e.id,
    school: e.school,
    degree: e.degree,
    field: e.field,
    startDate: e.start_date,
    endDate: e.end_date || undefined,
    current: e.current || false,
    description: e.description || undefined,
    gpa: e.gpa || undefined,
    coursework: Array.isArray(e.coursework)
      ? e.coursework
      : e.coursework
      ? JSON.parse(e.coursework)
      : undefined,
    honors: e.honors || undefined,
  }));

  const certifications: Certification[] | undefined = certificationsData
    ? certificationsData.map((c) => ({
        id: c.id,
        name: c.name,
        issuer: c.issuer,
        issueDate: c.issue_date,
        expiryDate: c.expiry_date || undefined,
        credentialId: c.credential_id || undefined,
        credentialUrl: c.credential_url || "",
      }))
    : undefined;

  // Assemble portfolio with new fields
  const portfolio: Portfolio = {
    personalInfo,
    skills,
    projects,
    experience: experience.length > 0 ? experience : undefined,
    education: education.length > 0 ? education : undefined,
    certifications: certifications && certifications.length > 0 ? certifications : undefined,
    primaryStack: primaryStack.length > 0 ? primaryStack : undefined,
    settings: {
      isPublic: portfolioData.published || settings.isPublic || false,
      showContactForm: settings.showContactForm !== false,
      ...(portfolioData.slug && { slug: portfolioData.slug }),
      ...(settings.seoTitle && { seoTitle: settings.seoTitle }),
      ...(settings.seoDescription && { seoDescription: settings.seoDescription }),
      ...(settings.contactEmail && { contactEmail: settings.contactEmail }),
    },
    theme: {
      id: "emerald",
      primaryColor: "emerald",
      accentStyle: "soft",
      radius: "md",
      layout: "sidebar-left",
      showProfilePhoto: true,
      ...theme,
    },
  };

  // Normalize portfolio to ensure all migrations are applied
  const normalized = normalizePortfolio(portfolio);

  const validated = portfolioSchema.safeParse(normalized);
  if (!validated.success) {
    throw new PortfolioServiceError(
      `Portfolio data validation failed: ${validated.error.message}`
    );
  }

  return validated.data;
};
