import supabase from "@/lib/supabase";
import { PortfolioServiceError } from "../portfolio-errors";
import type { Portfolio } from "@/schemas/portfolio";

export const saveSkills = async (
  userId: string,
  skills: string[]
): Promise<void> => {
  const { error: deleteError } = await supabase
    .from("skills")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    throw new PortfolioServiceError(
      `Failed to delete existing skills: ${deleteError.message}`,
      deleteError.code
    );
  }

  if (skills.length > 0) {
    const skillsToInsert = skills.map((skill) => ({
      user_id: userId,
      skill,
    }));

    const { error: insertError } = await supabase
      .from("skills")
      .insert(skillsToInsert);

    if (insertError) {
      throw new PortfolioServiceError(
        `Failed to insert skills: ${insertError.message}`,
        insertError.code
      );
    }
  }
};

export const saveProjects = async (
  userId: string,
  projects: Portfolio["projects"]
): Promise<void> => {
  const { data: existingProjects } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", userId);

  const existingProjectIds = new Set(existingProjects?.map((p) => p.id) || []);
  const incomingProjectIds = new Set(
    projects.map((p) => p.id).filter((id): id is string => !!id)
  );

  const projectsToDelete = Array.from(existingProjectIds).filter(
    (id) => !incomingProjectIds.has(id)
  );

  if (projectsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .in("id", projectsToDelete);

    if (deleteError) {
      throw new PortfolioServiceError(
        `Failed to delete projects: ${deleteError.message}`,
        deleteError.code
      );
    }
  }

  for (const project of projects) {
    const projectData = {
      user_id: userId,
      name: project.name,
      description: project.description,
      repo_url: project.repoUrl || null,
      live_url: project.liveUrl || null,
    };

    if (project.id && existingProjectIds.has(project.id)) {
      const { error: updateError } = await supabase
        .from("projects")
        .update(projectData)
        .eq("id", project.id);

      if (updateError) {
        throw new PortfolioServiceError(
          `Failed to update project: ${updateError.message}`,
          updateError.code
        );
      }

      await saveProjectTechStack(project.id, project.techStack);
    } else {
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

      await saveProjectTechStack(newProject.id, project.techStack);
    }
  }
};

export const saveProjectTechStack = async (
  projectId: string,
  techStack: string[]
): Promise<void> => {
  const { error: deleteError } = await supabase
    .from("project_tech_stack")
    .delete()
    .eq("project_id", projectId);

  if (deleteError) {
    throw new PortfolioServiceError(
      `Failed to delete tech stack: ${deleteError.message}`,
      deleteError.code
    );
  }

  if (techStack.length > 0) {
    const techStackToInsert = techStack.map((tech) => ({
      project_id: projectId,
      tech,
    }));

    const { error: insertError } = await supabase
      .from("project_tech_stack")
      .insert(techStackToInsert);

    if (insertError) {
      throw new PortfolioServiceError(
        `Failed to insert tech stack: ${insertError.message}`,
        insertError.code
      );
    }
  }
};

export const saveExperience = async (
  userId: string,
  experience: Portfolio["experience"]
): Promise<void> => {
  const { error: deleteError } = await supabase
    .from("experience")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    throw new PortfolioServiceError(
      `Failed to delete existing experience: ${deleteError.message}`,
      deleteError.code
    );
  }

  if (experience && experience.length > 0) {
    const experienceToInsert = experience.map((exp) => ({
      user_id: userId,
      company: exp.company,
      role: exp.role,
      start_date: exp.startDate,
      end_date: exp.endDate || null,
      current: exp.current || false,
      description: exp.description,
    }));

    const { error: insertError } = await supabase
      .from("experience")
      .insert(experienceToInsert);

    if (insertError) {
      throw new PortfolioServiceError(
        `Failed to insert experience: ${insertError.message}`,
        insertError.code
      );
    }
  }
};

export const saveEducation = async (
  userId: string,
  education: Portfolio["education"]
): Promise<void> => {
  const { error: deleteError } = await supabase
    .from("education")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    throw new PortfolioServiceError(
      `Failed to delete existing education: ${deleteError.message}`,
      deleteError.code
    );
  }

  if (education && education.length > 0) {
    const educationToInsert = education.map((edu) => ({
      user_id: userId,
      school: edu.school,
      degree: edu.degree,
      field: edu.field,
      start_date: edu.startDate,
      end_date: edu.endDate || null,
      current: edu.current || false,
      description: edu.description || null,
    }));

    const { error: insertError } = await supabase
      .from("education")
      .insert(educationToInsert);

    if (insertError) {
      throw new PortfolioServiceError(
        `Failed to insert education: ${insertError.message}`,
        insertError.code
      );
    }
  }
};
