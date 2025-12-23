import supabase from "@/lib/supabase";
import type {
  Portfolio,
  PersonalInfo,
  Skill,
  Project,
  Experience,
  Education,
} from "@/schemas/portfolio";
import { portfolioSchema } from "@/schemas/portfolio";

class PortfolioServiceError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "PortfolioServiceError";
    this.code = code;
  }
}

export const getPortfolio = async (
  userId: string
): Promise<Portfolio | null> => {
  try {
    // Fetch portfolio (personal info)
    const { data: portfolioData, error: portfolioError } = await supabase
      .from("portfolios")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (portfolioError && portfolioError.code !== "PGRST116") {
      // PGRST116 is "not found" - we'll handle that below
      throw new PortfolioServiceError(
        `Failed to fetch portfolio: ${portfolioError.message}`,
        portfolioError.code
      );
    }

    // If no portfolio exists, return null
    if (!portfolioData) {
      return null;
    }

    // Fetch skills
    const { data: skillsData, error: skillsError } = await supabase
      .from("skills")
      .select("skill")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (skillsError) {
      throw new PortfolioServiceError(
        `Failed to fetch skills: ${skillsError.message}`,
        skillsError.code
      );
    }

    // Fetch projects with tech stack
    const { data: projectsData, error: projectsError } = await supabase
      .from("projects")
      .select("id, name, description, repo_url, live_url")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (projectsError) {
      throw new PortfolioServiceError(
        `Failed to fetch projects: ${projectsError.message}`,
        projectsError.code
      );
    }

    // Fetch tech stack for all projects
    const projectIds = projectsData?.map((p) => p.id) || [];
    let techStackMap: Record<string, string[]> = {};

    if (projectIds.length > 0) {
      const { data: techStackData, error: techStackError } = await supabase
        .from("project_tech_stack")
        .select("project_id, tech")
        .in("project_id", projectIds)
        .order("tech", { ascending: true });

      if (techStackError) {
        throw new PortfolioServiceError(
          `Failed to fetch tech stack: ${techStackError.message}`,
          techStackError.code
        );
      }

      // Group tech stack by project_id
      techStackMap = (techStackData || []).reduce((acc, item) => {
        if (!acc[item.project_id]) {
          acc[item.project_id] = [];
        }
        acc[item.project_id].push(item.tech);
        return acc;
      }, {} as Record<string, string[]>);
    }

    // Fetch experience
    const { data: experienceData, error: experienceError } = await supabase
      .from("experience")
      .select("id, company, role, start_date, end_date, current, description")
      .eq("user_id", userId)
      .order("start_date", { ascending: false });

    if (experienceError) {
      throw new PortfolioServiceError(
        `Failed to fetch experience: ${experienceError.message}`,
        experienceError.code
      );
    }

    // Fetch education
    const { data: educationData, error: educationError } = await supabase
      .from("education")
      .select(
        "id, school, degree, field, start_date, end_date, current, description"
      )
      .eq("user_id", userId)
      .order("start_date", { ascending: false });

    if (educationError) {
      throw new PortfolioServiceError(
        `Failed to fetch education: ${educationError.message}`,
        educationError.code
      );
    }

    // Assemble portfolio object
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

    const skills: Skill[] = (skillsData || []).map((s) => s.skill);

    const projects: Project[] = (projectsData || []).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      techStack: techStackMap[p.id] || [],
      repoUrl: p.repo_url || "",
      liveUrl: p.live_url || "",
    }));

    const experience: Experience[] = (experienceData || []).map((e) => ({
      id: e.id,
      company: e.company,
      role: e.role,
      startDate: e.start_date,
      endDate: e.end_date || undefined,
      current: e.current || false,
      description: e.description,
    }));

    const education: Education[] = (educationData || []).map((e) => ({
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

    // Validate with schema
    const validated = portfolioSchema.safeParse(portfolio);
    if (!validated.success) {
      throw new PortfolioServiceError(
        `Portfolio data validation failed: ${validated.error.message}`
      );
    }

    return validated.data;
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

export const createOrUpdatePortfolio = async (
  userId: string,
  portfolio: Portfolio
): Promise<Portfolio> => {
  try {
    // Validate input
    const validated = portfolioSchema.safeParse(portfolio);
    if (!validated.success) {
      throw new PortfolioServiceError(
        `Invalid portfolio data: ${validated.error.message}`
      );
    }

    const validPortfolio = validated.data;

    // Get existing portfolio to preserve published status
    const { data: existingPortfolio } = await supabase
      .from("portfolios")
      .select("published")
      .eq("user_id", userId)
      .single();

    // Upsert portfolio (personal info)
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

    // Replace all skills (delete existing, insert new)
    const { error: deleteSkillsError } = await supabase
      .from("skills")
      .delete()
      .eq("user_id", userId);

    if (deleteSkillsError) {
      throw new PortfolioServiceError(
        `Failed to delete existing skills: ${deleteSkillsError.message}`,
        deleteSkillsError.code
      );
    }

    if (validPortfolio.skills.length > 0) {
      const skillsToInsert = validPortfolio.skills.map((skill) => ({
        user_id: userId,
        skill,
      }));

      const { error: insertSkillsError } = await supabase
        .from("skills")
        .insert(skillsToInsert);

      if (insertSkillsError) {
        throw new PortfolioServiceError(
          `Failed to insert skills: ${insertSkillsError.message}`,
          insertSkillsError.code
        );
      }
    }

    // Get existing project IDs to determine which to update vs insert
    const { data: existingProjects } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", userId);

    const existingProjectIds = new Set(
      existingProjects?.map((p) => p.id) || []
    );
    const incomingProjectIds = new Set(
      validPortfolio.projects
        .map((p) => p.id)
        .filter((id): id is string => !!id)
    );

    // Delete projects that are no longer in the portfolio
    const projectsToDelete = Array.from(existingProjectIds).filter(
      (id) => !incomingProjectIds.has(id)
    );

    if (projectsToDelete.length > 0) {
      const { error: deleteProjectsError } = await supabase
        .from("projects")
        .delete()
        .in("id", projectsToDelete);

      if (deleteProjectsError) {
        throw new PortfolioServiceError(
          `Failed to delete projects: ${deleteProjectsError.message}`,
          deleteProjectsError.code
        );
      }
    }

    // Upsert projects
    for (const project of validPortfolio.projects) {
      const projectData: {
        user_id: string;
        name: string;
        description: string;
        repo_url: string | null;
        live_url: string | null;
        id?: string;
      } = {
        user_id: userId,
        name: project.name,
        description: project.description,
        repo_url: project.repoUrl || null,
        live_url: project.liveUrl || null,
      };

      if (project.id && existingProjectIds.has(project.id)) {
        // Update existing project
        const { error: updateError } = await supabase
          .from("projects")
          .update({
            name: projectData.name,
            description: projectData.description,
            repo_url: projectData.repo_url,
            live_url: projectData.live_url,
          })
          .eq("id", project.id);

        if (updateError) {
          throw new PortfolioServiceError(
            `Failed to update project: ${updateError.message}`,
            updateError.code
          );
        }

        // Replace tech stack for this project
        const { error: deleteTechError } = await supabase
          .from("project_tech_stack")
          .delete()
          .eq("project_id", project.id);

        if (deleteTechError) {
          throw new PortfolioServiceError(
            `Failed to delete tech stack: ${deleteTechError.message}`,
            deleteTechError.code
          );
        }

        if (project.techStack.length > 0) {
          const techStackToInsert = project.techStack.map((tech) => ({
            project_id: project.id!,
            tech,
          }));

          const { error: insertTechError } = await supabase
            .from("project_tech_stack")
            .insert(techStackToInsert);

          if (insertTechError) {
            throw new PortfolioServiceError(
              `Failed to insert tech stack: ${insertTechError.message}`,
              insertTechError.code
            );
          }
        }
      } else {
        // Insert new project
        const { data: newProject, error: insertError } = await supabase
          .from("projects")
          .insert(projectData)
          .select()
          .single();

        if (insertError) {
          throw new PortfolioServiceError(
            `Failed to insert project: ${insertError.message}`,
            insertError.code
          );
        }

        // Insert tech stack
        if (project.techStack.length > 0) {
          const techStackToInsert = project.techStack.map((tech) => ({
            project_id: newProject.id,
            tech,
          }));

          const { error: insertTechError } = await supabase
            .from("project_tech_stack")
            .insert(techStackToInsert);

          if (insertTechError) {
            throw new PortfolioServiceError(
              `Failed to insert tech stack: ${insertTechError.message}`,
              insertTechError.code
            );
          }
        }
      }
    }

    // Replace all experience (delete existing, insert new)
    const { error: deleteExperienceError } = await supabase
      .from("experience")
      .delete()
      .eq("user_id", userId);

    if (deleteExperienceError) {
      throw new PortfolioServiceError(
        `Failed to delete existing experience: ${deleteExperienceError.message}`,
        deleteExperienceError.code
      );
    }

    if (validPortfolio.experience && validPortfolio.experience.length > 0) {
      const experienceToInsert = validPortfolio.experience.map((exp) => ({
        user_id: userId,
        company: exp.company,
        role: exp.role,
        start_date: exp.startDate,
        end_date: exp.endDate || null,
        current: exp.current || false,
        description: exp.description,
      }));

      const { error: insertExperienceError } = await supabase
        .from("experience")
        .insert(experienceToInsert);

      if (insertExperienceError) {
        throw new PortfolioServiceError(
          `Failed to insert experience: ${insertExperienceError.message}`,
          insertExperienceError.code
        );
      }
    }

    // Replace all education (delete existing, insert new)
    const { error: deleteEducationError } = await supabase
      .from("education")
      .delete()
      .eq("user_id", userId);

    if (deleteEducationError) {
      throw new PortfolioServiceError(
        `Failed to delete existing education: ${deleteEducationError.message}`,
        deleteEducationError.code
      );
    }

    if (validPortfolio.education && validPortfolio.education.length > 0) {
      const educationToInsert = validPortfolio.education.map((edu) => ({
        user_id: userId,
        school: edu.school,
        degree: edu.degree,
        field: edu.field,
        start_date: edu.startDate,
        end_date: edu.endDate || null,
        current: edu.current || false,
        description: edu.description || null,
      }));

      const { error: insertEducationError } = await supabase
        .from("education")
        .insert(educationToInsert);

      if (insertEducationError) {
        throw new PortfolioServiceError(
          `Failed to insert education: ${insertEducationError.message}`,
          insertEducationError.code
        );
      }
    }

    // Fetch and return the complete portfolio
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

export const getPublicPortfolioByUsername = async (
  username: string
): Promise<Portfolio | null> => {
  try {
    // First, get the profile by username
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (profileError || !profileData) {
      throw new PortfolioServiceError("Profile not found");
    }

    // Get portfolio for this user, but only if published
    const { data: portfolioData, error: portfolioError } = await supabase
      .from("portfolios")
      .select("*")
      .eq("user_id", profileData.id)
      .eq("published", true)
      .single();

    if (portfolioError || !portfolioData) {
      throw new PortfolioServiceError("Portfolio not found or not published");
    }

    // Fetch skills
    const { data: skillsData, error: skillsError } = await supabase
      .from("skills")
      .select("skill")
      .eq("user_id", profileData.id)
      .order("created_at", { ascending: true });

    if (skillsError) {
      throw new PortfolioServiceError(
        `Failed to fetch skills: ${skillsError.message}`,
        skillsError.code
      );
    }

    // Fetch projects with tech stack
    const { data: projectsData, error: projectsError } = await supabase
      .from("projects")
      .select("id, name, description, repo_url, live_url")
      .eq("user_id", profileData.id)
      .order("created_at", { ascending: true });

    if (projectsError) {
      throw new PortfolioServiceError(
        `Failed to fetch projects: ${projectsError.message}`,
        projectsError.code
      );
    }

    // Fetch tech stack for all projects
    const projectIds = projectsData?.map((p) => p.id) || [];
    let techStackMap: Record<string, string[]> = {};

    if (projectIds.length > 0) {
      const { data: techStackData, error: techStackError } = await supabase
        .from("project_tech_stack")
        .select("project_id, tech")
        .in("project_id", projectIds)
        .order("tech", { ascending: true });

      if (techStackError) {
        throw new PortfolioServiceError(
          `Failed to fetch tech stack: ${techStackError.message}`,
          techStackError.code
        );
      }

      techStackMap = (techStackData || []).reduce((acc, item) => {
        if (!acc[item.project_id]) {
          acc[item.project_id] = [];
        }
        acc[item.project_id].push(item.tech);
        return acc;
      }, {} as Record<string, string[]>);
    }

    // Fetch experience
    const { data: experienceData, error: experienceError } = await supabase
      .from("experience")
      .select("id, company, role, start_date, end_date, current, description")
      .eq("user_id", profileData.id)
      .order("start_date", { ascending: false });

    if (experienceError) {
      throw new PortfolioServiceError(
        `Failed to fetch experience: ${experienceError.message}`,
        experienceError.code
      );
    }

    // Fetch education
    const { data: educationData, error: educationError } = await supabase
      .from("education")
      .select(
        "id, school, degree, field, start_date, end_date, current, description"
      )
      .eq("user_id", profileData.id)
      .order("start_date", { ascending: false });

    if (educationError) {
      throw new PortfolioServiceError(
        `Failed to fetch education: ${educationError.message}`,
        educationError.code
      );
    }

    // Assemble portfolio object
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

    const skills: Skill[] = (skillsData || []).map((s) => s.skill);

    const projects: Project[] = (projectsData || []).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      techStack: techStackMap[p.id] || [],
      repoUrl: p.repo_url || "",
      liveUrl: p.live_url || "",
    }));

    const experience: Experience[] = (experienceData || []).map((e) => ({
      id: e.id,
      company: e.company,
      role: e.role,
      startDate: e.start_date,
      endDate: e.end_date || undefined,
      current: e.current || false,
      description: e.description,
    }));

    const education: Education[] = (educationData || []).map((e) => ({
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

    // Validate with schema
    const validated = portfolioSchema.safeParse(portfolio);
    if (!validated.success) {
      throw new PortfolioServiceError(
        `Portfolio data validation failed: ${validated.error.message}`
      );
    }

    return validated.data;
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
        // First delete tech stack for all user's projects
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

        // Then delete projects
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
