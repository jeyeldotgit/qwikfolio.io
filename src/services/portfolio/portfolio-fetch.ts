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
 * @returns Object with portfolio and userId if found and public, null otherwise
 */
export const getPublicPortfolioByUsername = async (
  identifier: string
): Promise<{ portfolio: Portfolio; userId: string } | null> => {
  try {
    let portfolioData: any = null;
    let userId: string | null = null;

    // First, try to find by slug
    // Query portfolios where slug matches
    const { data: portfolioBySlug, error: slugError } = await supabase
      .from("portfolios")
      .select("*, user_id")
      .eq("slug", identifier)
      .maybeSingle();
    
    // Log for debugging
    if (slugError && slugError.code !== "PGRST116") {
      console.error("Error fetching portfolio by slug:", slugError);
    }

    if (portfolioBySlug && !slugError) {
      // Found by slug - verify it's actually published
      const isPublished = portfolioBySlug.published === true;
      const isPublic = portfolioBySlug.settings?.isPublic === true;
      
      if (isPublished || isPublic) {
        portfolioData = portfolioBySlug;
        userId = portfolioBySlug.user_id;
      } else {
        // Portfolio found but not published
        throw new PortfolioServiceError("Portfolio not found or not published");
      }
    }

    // If not found by slug, try to find by username
    if (!portfolioData || !userId) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", identifier)
        .maybeSingle();

      if (profileError || !profileData) {
        throw new PortfolioServiceError("Profile not found");
      }

      userId = profileData.id;

      // Check portfolio for this user
      const { data: portfolioDataByUser, error: portfolioError } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", profileData.id)
        .maybeSingle();

      if (portfolioError) {
        throw new PortfolioServiceError(
          `Failed to fetch portfolio: ${portfolioError.message}`
        );
      }

      if (!portfolioDataByUser) {
        throw new PortfolioServiceError("Portfolio not found or not published");
      }

      // Verify it's actually published
      const isPublished = portfolioDataByUser.published === true;
      const isPublic = portfolioDataByUser.settings?.isPublic === true;
      
      if (!isPublished && !isPublic) {
        throw new PortfolioServiceError("Portfolio not found or not published");
      }

      portfolioData = portfolioDataByUser;
    }

    if (!portfolioData || !userId) {
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
    const normalizedPortfolio = normalizePortfolio(portfolio);
    
    return {
      portfolio: normalizedPortfolio,
      userId,
    };
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

