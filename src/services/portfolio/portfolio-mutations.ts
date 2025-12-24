import supabase from "@/lib/supabase";
import type { Portfolio } from "@/schemas/portfolio";
import { portfolioSchema } from "@/schemas/portfolio";
import { PortfolioServiceError } from "./portfolio-errors";
import { getPortfolio } from "./portfolio-fetch";
import {
  saveSkills,
  saveProjects,
  saveExperience,
  saveEducation,
} from "./forms/portfolio-form-actions";

export const createOrUpdatePortfolio = async (
  userId: string,
  portfolio: Portfolio
): Promise<Portfolio> => {
  try {
    const validated = portfolioSchema.safeParse(portfolio);
    if (!validated.success) {
      throw new PortfolioServiceError(
        `Invalid portfolio data: ${validated.error.message}`
      );
    }

    const validPortfolio = validated.data;

    const { data: existingPortfolio } = await supabase
      .from("portfolios")
      .select("published")
      .eq("user_id", userId)
      .single();

    const { error: portfolioError } = await supabase.from("portfolios").upsert(
      {
        user_id: userId,
        name: validPortfolio.personalInfo.name,
        headline: validPortfolio.personalInfo.headline,
        email: validPortfolio.personalInfo.email,
        phone: validPortfolio.personalInfo.phone || null,
        bio: validPortfolio.personalInfo.bio || null,
        website: validPortfolio.personalInfo.website || null,
        github: validPortfolio.personalInfo.github || null,
        linkedin: validPortfolio.personalInfo.linkedin || null,
        published: existingPortfolio?.published ?? false,
      },
      {
        onConflict: "user_id",
      }
    );

    if (portfolioError) {
      throw new PortfolioServiceError(
        `Failed to save portfolio: ${portfolioError.message}`,
        portfolioError.code
      );
    }

    await saveSkills(userId, validPortfolio.skills);
    await saveProjects(userId, validPortfolio.projects);
    await saveExperience(userId, validPortfolio.experience);
    await saveEducation(userId, validPortfolio.education);

    const savedPortfolio = await getPortfolio(userId);

    if (!savedPortfolio) {
      throw new PortfolioServiceError(
        "Portfolio was saved but could not be retrieved"
      );
    }

    return savedPortfolio;
  } catch (error) {
    if (error instanceof PortfolioServiceError) {
      throw error;
    }
    throw new PortfolioServiceError(
      `Unexpected error saving portfolio: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const updatePortfolioPublishedStatus = async (
  userId: string,
  published: boolean
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("portfolios")
      .update({ published })
      .eq("user_id", userId);

    if (error) {
      throw new PortfolioServiceError(
        `Failed to update published status: ${error.message}`,
        error.code
      );
    }
  } catch (error) {
    if (error instanceof PortfolioServiceError) {
      throw error;
    }
    throw new PortfolioServiceError(
      `Unexpected error updating published status: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const deletePortfolioSection = async (
  userId: string,
  section: "skills" | "projects" | "experience" | "education"
): Promise<void> => {
  try {
    switch (section) {
      case "skills": {
        const { error } = await supabase
          .from("skills")
          .delete()
          .eq("user_id", userId);

        if (error) {
          throw new PortfolioServiceError(
            `Failed to delete skills: ${error.message}`,
            error.code
          );
        }
        break;
      }

      case "projects": {
        const { data: projects } = await supabase
          .from("projects")
          .select("id")
          .eq("user_id", userId);

        if (projects && projects.length > 0) {
          const projectIds = projects.map((p) => p.id);
          const { error: techError } = await supabase
            .from("project_tech_stack")
            .delete()
            .in("project_id", projectIds);

          if (techError) {
            throw new PortfolioServiceError(
              `Failed to delete tech stack: ${techError.message}`,
              techError.code
            );
          }
        }

        const { error } = await supabase
          .from("projects")
          .delete()
          .eq("user_id", userId);

        if (error) {
          throw new PortfolioServiceError(
            `Failed to delete projects: ${error.message}`,
            error.code
          );
        }
        break;
      }

      case "experience": {
        const { error } = await supabase
          .from("experience")
          .delete()
          .eq("user_id", userId);

        if (error) {
          throw new PortfolioServiceError(
            `Failed to delete experience: ${error.message}`,
            error.code
          );
        }
        break;
      }

      case "education": {
        const { error } = await supabase
          .from("education")
          .delete()
          .eq("user_id", userId);

        if (error) {
          throw new PortfolioServiceError(
            `Failed to delete education: ${error.message}`,
            error.code
          );
        }
        break;
      }
    }
  } catch (error) {
    if (error instanceof PortfolioServiceError) {
      throw error;
    }
    throw new PortfolioServiceError(
      `Unexpected error deleting section: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
