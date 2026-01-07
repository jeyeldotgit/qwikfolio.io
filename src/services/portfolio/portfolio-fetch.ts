import supabase from "@/lib/supabase";
import type { Portfolio } from "@/schemas/portfolio";
import { PortfolioServiceError } from "./portfolio-errors";
import {
  fetchSkills,
  fetchProjects,
  fetchTechStack,
  fetchExperience,
  fetchEducation,
  fetchCertifications,
} from "./portfolio-fetch-helpers";
import { assemblePortfolio } from "./portfolio-assemble";
import { normalizePortfolio } from "./portfolio-migrations";

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

    const [skillsData, projectsData, experienceData, educationData, certificationsData] =
      await Promise.all([
        fetchSkills(userId),
        fetchProjects(userId),
        fetchExperience(userId),
        fetchEducation(userId),
        fetchCertifications(userId),
      ]);

    const projectIds = projectsData.map((p) => p.id);
    const techStackMap = await fetchTechStack(projectIds);

    const portfolio = assemblePortfolio(
      portfolioData,
      skillsData,
      projectsData,
      techStackMap,
      experienceData,
      educationData,
      certificationsData
    );

    // Normalize portfolio to ensure migrations are applied
    return normalizePortfolio(portfolio);
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

/**
 * Get public portfolio by username or slug
 * @param identifier - Username or slug
 * @returns Portfolio if found and public, null otherwise
 */
export const getPublicPortfolioByUsername = async (
  identifier: string
): Promise<Portfolio | null> => {
  try {
    // First, try to find by slug
    const { data: portfolioBySlug, error: slugError } = await supabase
      .from("portfolios")
      .select("*, user_id")
      .eq("slug", identifier)
      .or("published.eq.true,settings->>isPublic.eq.true")
      .single();

    let portfolioData = portfolioBySlug;
    let userId: string | null = null;

    if (portfolioBySlug && !slugError) {
      // Found by slug
      userId = portfolioBySlug.user_id;
    } else {
      // Try to find by username
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", identifier)
        .single();

      if (profileError || !profileData) {
        throw new PortfolioServiceError("Profile not found");
      }

      userId = profileData.id;

      // Check both published and settings.isPublic for public access
      const { data: portfolioDataByUser, error: portfolioError } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", profileData.id)
        .or("published.eq.true,settings->>isPublic.eq.true")
        .single();

      if (portfolioError || !portfolioDataByUser) {
        throw new PortfolioServiceError("Portfolio not found or not published");
      }

      portfolioData = portfolioDataByUser;
    }

    if (!portfolioData || !userId) {
      throw new PortfolioServiceError("Portfolio not found or not published");
    }

    if (portfolioError || !portfolioData) {
      throw new PortfolioServiceError("Portfolio not found or not published");
    }

    const [skillsData, projectsData, experienceData, educationData, certificationsData] =
      await Promise.all([
        fetchSkills(userId),
        fetchProjects(userId),
        fetchExperience(userId),
        fetchEducation(userId),
        fetchCertifications(userId),
      ]);

    const projectIds = projectsData.map((p) => p.id);
    const techStackMap = await fetchTechStack(projectIds);

    const portfolio = assemblePortfolio(
      portfolioData,
      skillsData,
      projectsData,
      techStackMap,
      experienceData,
      educationData,
      certificationsData
    );

    // Normalize portfolio to ensure migrations are applied
    return normalizePortfolio(portfolio);
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

