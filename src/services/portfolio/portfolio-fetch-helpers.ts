import supabase from "@/lib/supabase";
import { PortfolioServiceError } from "./portfolio-errors";

type SkillsData = { skill: string }[];
type ProjectsData = {
  id: string;
  name: string;
  description: string;
  repo_url: string | null;
  live_url: string | null;
}[];
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

export const fetchSkills = async (userId: string): Promise<SkillsData> => {
  const { data, error } = await supabase
    .from("skills")
    .select("skill")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new PortfolioServiceError(
      `Failed to fetch skills: ${error.message}`,
      error.code
    );
  }

  return data || [];
};

export const fetchProjects = async (userId: string): Promise<ProjectsData> => {
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, description, repo_url, live_url")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new PortfolioServiceError(
      `Failed to fetch projects: ${error.message}`,
      error.code
    );
  }

  return data || [];
};

export const fetchTechStack = async (
  projectIds: string[]
): Promise<Record<string, string[]>> => {
  if (projectIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from("project_tech_stack")
    .select("project_id, tech")
    .in("project_id", projectIds)
    .order("tech", { ascending: true });

  if (error) {
    throw new PortfolioServiceError(
      `Failed to fetch tech stack: ${error.message}`,
      error.code
    );
  }

  return (data || []).reduce((acc, item) => {
    if (!acc[item.project_id]) {
      acc[item.project_id] = [];
    }
    acc[item.project_id].push(item.tech);
    return acc;
  }, {} as Record<string, string[]>);
};

export const fetchExperience = async (
  userId: string
): Promise<ExperienceData> => {
  const { data, error } = await supabase
    .from("experience")
    .select("id, company, role, start_date, end_date, current, description")
    .eq("user_id", userId)
    .order("start_date", { ascending: false });

  if (error) {
    throw new PortfolioServiceError(
      `Failed to fetch experience: ${error.message}`,
      error.code
    );
  }

  return data || [];
};

export const fetchEducation = async (
  userId: string
): Promise<EducationData> => {
  const { data, error } = await supabase
    .from("education")
    .select(
      "id, school, degree, field, start_date, end_date, current, description"
    )
    .eq("user_id", userId)
    .order("start_date", { ascending: false });

  if (error) {
    throw new PortfolioServiceError(
      `Failed to fetch education: ${error.message}`,
      error.code
    );
  }

  return data || [];
};
