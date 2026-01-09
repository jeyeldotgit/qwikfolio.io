import { z } from "zod";

// Custom URL validator that accepts URLs with or without protocol
// Automatically prepends https:// if protocol is missing
const urlSchema = z
  .string()
  .min(1, "URL cannot be empty")
  .transform((val) => {
    const trimmed = val.trim();
    if (!trimmed) return trimmed;
    // If it already has a protocol, return as is
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    // Otherwise, prepend https://
    return `https://${trimmed}`;
  })
  .pipe(z.string().url("Invalid URL"));

// Optional URL schema (allows empty string or valid URL)
const optionalUrlSchema = z
  .string()
  .optional()
  .transform((val) => {
    if (!val || val.trim() === "") return "";
    const trimmed = val.trim();
    // If it already has a protocol, return as is
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    // Otherwise, prepend https://
    return `https://${trimmed}`;
  })
  .pipe(z.union([z.string().url("Invalid URL"), z.literal("")]));

// Social Links Schema
export const socialLinkSchema = z.object({
  type: z.enum([
    "github",
    "linkedin",
    "twitter",
    "dribbble",
    "instagram",
    "facebook",
    "devto",
    "portfolio",
  ]),
  url: urlSchema,
});

// Personal Info Schema
export const personalInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  headline: z.string().min(1, "Headline is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  website: optionalUrlSchema,
  location: z.string().optional(),
  roleLevel: z.enum(["junior", "mid", "senior", "lead"]).optional(),
  availability: z.enum(["open_to_work", "freelance", "not_open"]).optional(),
  hourlyRate: z.number().positive().optional(),
  salaryRange: z.string().optional(),
  profilePhotoUrl: optionalUrlSchema,
  socialLinks: z.array(socialLinkSchema).default([]),
  // Legacy fields for backward compatibility (deprecated)
  github: optionalUrlSchema,
  linkedin: optionalUrlSchema,
});

// Structured Skill Schema
export const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  category: z.enum(["language", "framework", "tool", "soft_skill"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  yearsExperience: z.number().positive().optional(),
});

// Media Schema
export const mediaSchema = z.object({
  type: z.enum(["image", "video"]),
  url: urlSchema,
});

// Project Schema
export const projectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Project name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  techStack: z.array(z.string()).min(1, "At least one technology is required"),
  repoUrl: optionalUrlSchema,
  liveUrl: optionalUrlSchema,
  role: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  order: z.number().default(0),
  media: z.array(mediaSchema).optional(),
});

// Experience Schema
export const experienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(2, "Company name is required"),
  role: z.string().min(2, "Role is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  location: z.string().optional(),
  employmentType: z.enum(["full_time", "contract", "internship"]).optional(),
  description: z.string().optional(),
  achievements: z.array(z.string()).optional(),
});

// Education Schema
export const educationSchema = z.object({
  id: z.string().optional(),
  school: z.string().min(2, "School name is required"),
  degree: z.string().min(2, "Degree is required"),
  field: z.string().min(2, "Field of study is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
  gpa: z.number().min(0).max(4.0).optional(),
  coursework: z.array(z.string()).optional(),
  honors: z.string().optional(),
});

// Certification Schema
export const certificationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Certification name is required"),
  issuer: z.string().min(2, "Issuer is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: optionalUrlSchema,
});

// Settings Schema
export const settingsSchema = z.object({
  slug: z
    .string()
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    )
    .optional(),
  isPublic: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  showContactForm: z.boolean().default(true),
  contactEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
});

// Theme Schema
export const themeSchema = z.object({
  id: z.enum(["default", "emerald", "ocean", "violet"]).default("emerald"),
  primaryColor: z
    .enum(["emerald", "cyan", "violet", "amber"])
    .default("emerald"),
  accentStyle: z.enum(["soft", "vibrant", "mono"]).default("soft"),
  radius: z.enum(["none", "md", "xl"]).default("md"),
  layout: z
    .enum(["sidebar-left", "sidebar-top", "one-column"])
    .default("sidebar-left"),
  showProfilePhoto: z.boolean().default(true),
});

// Portfolio Schema
export const portfolioSchema = z.object({
  personalInfo: personalInfoSchema,
  skills: z.array(skillSchema).min(1, "At least one skill is required"),
  projects: z.array(projectSchema).min(1, "At least one project is required"),
  experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  primaryStack: z.array(z.string()).optional(),
  settings: settingsSchema.default({
    isPublic: false,
    showContactForm: true,
  }),
  theme: themeSchema.default({
    id: "emerald",
    primaryColor: "emerald",
    accentStyle: "soft",
    radius: "md",
    layout: "sidebar-left",
    showProfilePhoto: true,
  }),
});

// Type Exports
export type SocialLink = z.infer<typeof socialLinkSchema>;
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type ProjectMedia = z.infer<typeof mediaSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type PortfolioSettings = z.infer<typeof settingsSchema>;
export type PortfolioTheme = z.infer<typeof themeSchema>;
export type Portfolio = z.infer<typeof portfolioSchema>;
