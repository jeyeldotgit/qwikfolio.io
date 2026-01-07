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
  saveCertifications,
} from "./portfolio-save";

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
      .select("published, slug")
      .eq("user_id", userId)
      .single();

    // Validate slug uniqueness if provided
    if (validPortfolio.settings.slug) {
      const { data: existingSlug, error: slugError } = await supabase
        .from("portfolios")
        .select("user_id")
        .eq("slug", validPortfolio.settings.slug)
        .neq("user_id", userId)
        .single();

      if (slugError && slugError.code !== "PGRST116") {
        // PGRST116 means no rows found, which is what we want
        throw new PortfolioServiceError(
          `Failed to validate slug: ${slugError.message}`,
          slugError.code
        );
      }

      if (existingSlug) {
        throw new PortfolioServiceError(
          "This slug is already taken. Please choose a different one."
        );
      }
    }

    // Prepare portfolio data with new fields
    const portfolioUpdateData: any = {
      user_id: userId,
      name: validPortfolio.personalInfo.name,
      headline: validPortfolio.personalInfo.headline,
      email: validPortfolio.personalInfo.email,
      phone: validPortfolio.personalInfo.phone || null,
      bio: validPortfolio.personalInfo.bio || null,
      website: validPortfolio.personalInfo.website || null,
      // Legacy fields for backward compatibility
      github: validPortfolio.personalInfo.github || null,
      linkedin: validPortfolio.personalInfo.linkedin || null,
      // New personal info fields
      location: validPortfolio.personalInfo.location || null,
      role_level: validPortfolio.personalInfo.roleLevel || null,
      availability: validPortfolio.personalInfo.availability || null,
      hourly_rate: validPortfolio.personalInfo.hourlyRate || null,
      salary_range: validPortfolio.personalInfo.salaryRange || null,
      profile_photo_url: validPortfolio.personalInfo.profilePhotoUrl || null,
      social_links: validPortfolio.personalInfo.socialLinks || [],
      // Settings and theme
      settings: validPortfolio.settings || {},
      theme: validPortfolio.theme || {},
      primary_stack: validPortfolio.primaryStack || [],
      slug: validPortfolio.settings.slug || null,
      // Sync published with settings.isPublic
      published: validPortfolio.settings.isPublic || existingPortfolio?.published || false,
    };

    const { error: portfolioError } = await supabase
      .from("portfolios")
      .upsert(portfolioUpdateData, {
        onConflict: "user_id",
      });

    if (portfolioError) {
      throw new PortfolioServiceError(
        `Failed to save portfolio: ${portfolioError.message}`,
        portfolioError.code
      );
    }

    await Promise.all([
      saveSkills(userId, validPortfolio.skills),
      saveProjects(userId, validPortfolio.projects),
      saveExperience(userId, validPortfolio.experience),
      saveEducation(userId, validPortfolio.education),
      saveCertifications(userId, validPortfolio.certifications),
    ]);

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
