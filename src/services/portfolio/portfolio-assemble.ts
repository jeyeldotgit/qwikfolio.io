import type {
  Portfolio,
  PersonalInfo,
  Skill,
  Project,
  Experience,
  Education,
} from "@/schemas/portfolio";
import { portfolioSchema } from "@/schemas/portfolio";
import { PortfolioServiceError } from "./portfolio-errors";

type PortfolioData = {
  name: string;
  headline: string;
  email: string;
  phone: string | null;
  bio: string | null;
  website: string | null;
  github: string | null;
  linkedin: string | null;
};

type SkillsData = { skill: string }[];
type ProjectsData = {
  id: string;
  name: string;
  description: string;
  repo_url: string | null;
  live_url: string | null;
}[];
type TechStackMap = Record<string, string[]>;
type ExperienceData = {
  id: string;
  company: string;
  role: string;
  start_date: string;
  end_date: string | null;
  current: boolean | null;
  description: string;
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
}[];

export const assemblePortfolio = (
  portfolioData: PortfolioData,
  skillsData: SkillsData,
  projectsData: ProjectsData,
  techStackMap: TechStackMap,
  experienceData: ExperienceData,
  educationData: EducationData
): Portfolio => {
  const personalInfo: PersonalInfo = {
    name: portfolioData.name,
    headline: portfolioData.headline,
    email: portfolioData.email,
    phone: portfolioData.phone || undefined,
    bio: portfolioData.bio || undefined,
    website: portfolioData.website || undefined,
    github: portfolioData.github || undefined,
    linkedin: portfolioData.linkedin || undefined,
  };

  const skills: Skill[] = skillsData.map((s) => s.skill);

  const projects: Project[] = projectsData.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    techStack: techStackMap[p.id] || [],
    repoUrl: p.repo_url || "",
    liveUrl: p.live_url || "",
  }));

  const experience: Experience[] = experienceData.map((e) => ({
    id: e.id,
    company: e.company,
    role: e.role,
    startDate: e.start_date,
    endDate: e.end_date || undefined,
    current: e.current || false,
    description: e.description,
  }));

  const education: Education[] = educationData.map((e) => ({
    id: e.id,
    school: e.school,
    degree: e.degree,
    field: e.field,
    startDate: e.start_date,
    endDate: e.end_date || undefined,
    current: e.current || false,
    description: e.description || undefined,
  }));

  const portfolio: Portfolio = {
    personalInfo,
    skills,
    projects,
    experience: experience.length > 0 ? experience : undefined,
    education: education.length > 0 ? education : undefined,
  };

  const validated = portfolioSchema.safeParse(portfolio);
  if (!validated.success) {
    throw new PortfolioServiceError(
      `Portfolio data validation failed: ${validated.error.message}`
    );
  }

  return validated.data;
};
