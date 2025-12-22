import { z } from "zod";

export const personalInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  headline: z.string().min(1, "Headline is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  github: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
});

export const skillSchema = z
  .string()
  .min(2, "Skill must be at least 2 characters");

export const projectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Project name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  techStack: z.array(z.string()).min(1, "At least one technology is required"),
  repoUrl: z.string().url("Invalid URL").or(z.literal("")),
  liveUrl: z.string().url("Invalid URL").or(z.literal("")),
});

export const experienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(2, "Company name is required"),
  role: z.string().min(2, "Role is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export const educationSchema = z.object({
  id: z.string().optional(),
  school: z.string().min(2, "School name is required"),
  degree: z.string().min(2, "Degree is required"),
  field: z.string().min(2, "Field of study is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
});

export const portfolioSchema = z.object({
  personalInfo: personalInfoSchema,
  skills: z.array(skillSchema).min(1, "At least one skill is required"),
  projects: z.array(projectSchema).min(1, "At least one project is required"),
  experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
});

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Portfolio = z.infer<typeof portfolioSchema>;


