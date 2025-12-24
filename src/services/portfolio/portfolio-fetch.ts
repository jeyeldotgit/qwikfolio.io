import supabase from "@/lib/supabase";
import type { Portfolio } from "@/schemas/portfolio";
import { PortfolioServiceError } from "./portfolio-errors";
import {
  fetchSkills,
  fetchProjects,
  fetchTechStack,
  fetchExperience,
  fetchEducation,
} from "./portfolio-fetch-helpers";
import { assemblePortfolio } from "./portfolio-assemble";

export const getPortfolio = async (
  userId: string
): Promise<Portfolio | null> => {
  try {
    const { data: portfolioData, error: portfolioError } = await supabase
      .from("portfolios")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (portfolioError && portfolioError.code !== "PGRST116") {
      throw new PortfolioServiceError(
        `Failed to fetch portfolio: ${portfolioError.message}`,
        portfolioError.code
      );
    }

    if (!portfolioData) {
      return null;
    }

    const [skillsData, projectsData, experienceData, educationData] =
      await Promise.all([
        fetchSkills(userId),
        fetchProjects(userId),
        fetchExperience(userId),
        fetchEducation(userId),
      ]);

    const projectIds = projectsData.map((p) => p.id);
    const techStackMap = await fetchTechStack(projectIds);

    return assemblePortfolio(
      portfolioData,
      skillsData,
      projectsData,
      techStackMap,
      experienceData,
      educationData
    );
  } catch (error) {
    if (error instanceof PortfolioServiceError) {
      throw error;
    }
    throw new PortfolioServiceError(
      `Unexpected error fetching portfolio: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const getPublicPortfolioByUsername = async (
  username: string
): Promise<Portfolio | null> => {
  try {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (profileError || !profileData) {
      throw new PortfolioServiceError("Profile not found");
    }

    const { data: portfolioData, error: portfolioError } = await supabase
      .from("portfolios")
      .select("*")
      .eq("user_id", profileData.id)
      .eq("published", true)
      .single();

    if (portfolioError || !portfolioData) {
      throw new PortfolioServiceError("Portfolio not found or not published");
    }

    const [skillsData, projectsData, experienceData, educationData] =
      await Promise.all([
        fetchSkills(profileData.id),
        fetchProjects(profileData.id),
        fetchExperience(profileData.id),
        fetchEducation(profileData.id),
      ]);

    const projectIds = projectsData.map((p) => p.id);
    const techStackMap = await fetchTechStack(projectIds);

    return assemblePortfolio(
      portfolioData,
      skillsData,
      projectsData,
      techStackMap,
      experienceData,
      educationData
    );
  } catch (error) {
    if (error instanceof PortfolioServiceError) {
      throw error;
    }
    throw new PortfolioServiceError(
      `Unexpected error fetching public portfolio: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

