import { useMemo } from "react";
import type { Portfolio } from "@/schemas/portfolio";

export type CompletionSection = {
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
  missingFields: string[];
};

export type ProfileCompletion = {
  percentage: number;
  sections: CompletionSection[];
  requiredCompleted: number;
  requiredTotal: number;
  optionalCompleted: number;
  optionalTotal: number;
};

export const useProfileCompletion = (
  portfolio: Portfolio | null
): ProfileCompletion => {
  return useMemo(() => {
    if (!portfolio) {
      return {
        percentage: 0,
        sections: [],
        requiredCompleted: 0,
        requiredTotal: 0,
        optionalCompleted: 0,
        optionalTotal: 0,
      };
    }

    const sections: CompletionSection[] = [];

    // Personal Info (Required)
    const personalInfoFields = {
      name: !!portfolio.personalInfo.name,
      headline: !!portfolio.personalInfo.headline,
      email: !!portfolio.personalInfo.email,
    };
    const personalInfoCompleted =
      personalInfoFields.name &&
      personalInfoFields.headline &&
      personalInfoFields.email;
    const personalInfoMissing = Object.entries(personalInfoFields)
      .filter(([_, completed]) => !completed)
      .map(([field]) => field);
    sections.push({
      id: "personal",
      label: "Personal Information",
      completed: personalInfoCompleted,
      required: true,
      missingFields: personalInfoMissing,
    });

    // Skills (Required)
    const skillsCompleted = portfolio.skills.length >= 3;
    sections.push({
      id: "skills",
      label: "Skills",
      completed: skillsCompleted,
      required: true,
      missingFields: skillsCompleted ? [] : ["At least 3 skills"],
    });

    // Projects (Required)
    const projectsCompleted =
      portfolio.projects.length > 0 &&
      portfolio.projects.every(
        (p) => p.name && p.description && p.techStack.length > 0
      );
    sections.push({
      id: "projects",
      label: "Projects",
      completed: projectsCompleted,
      required: true,
      missingFields: projectsCompleted
        ? []
        : ["At least 1 project with name, description, and tech stack"],
    });

    // Experience (Optional)
    const experienceCompleted =
      portfolio.experience &&
      portfolio.experience.length > 0 &&
      portfolio.experience.every((e) => e.company && e.role);
    sections.push({
      id: "experience",
      label: "Experience",
      completed: !!experienceCompleted,
      required: false,
      missingFields: experienceCompleted ? [] : ["At least 1 experience entry"],
    });

    // Education (Optional)
    const educationCompleted =
      portfolio.education &&
      portfolio.education.length > 0 &&
      portfolio.education.every((e) => e.school && e.degree && e.field);
    sections.push({
      id: "education",
      label: "Education",
      completed: !!educationCompleted,
      required: false,
      missingFields: educationCompleted ? [] : ["At least 1 education entry"],
    });

    // Certifications (Optional)
    const certificationsCompleted =
      portfolio.certifications &&
      portfolio.certifications.length > 0 &&
      portfolio.certifications.every(
        (c) => c.name && c.issuer && c.issueDate
      );
    sections.push({
      id: "certifications",
      label: "Certifications",
      completed: !!certificationsCompleted,
      required: false,
      missingFields: certificationsCompleted
        ? []
        : ["At least 1 certification"],
    });

    // Settings (Optional)
    const settingsCompleted = !!portfolio.settings;
    sections.push({
      id: "settings",
      label: "Settings",
      completed: settingsCompleted,
      required: false,
      missingFields: settingsCompleted ? [] : ["Configure settings"],
    });

    // Theme (Optional)
    const themeCompleted = !!portfolio.theme;
    sections.push({
      id: "theme",
      label: "Theme",
      completed: themeCompleted,
      required: false,
      missingFields: themeCompleted ? [] : ["Configure theme"],
    });

    // Calculate completion
    const requiredSections = sections.filter((s) => s.required);
    const optionalSections = sections.filter((s) => !s.required);

    const requiredCompleted = requiredSections.filter((s) => s.completed).length;
    const requiredTotal = requiredSections.length;
    const optionalCompleted = optionalSections.filter((s) => s.completed).length;
    const optionalTotal = optionalSections.length;

    // Calculate percentage: 70% weight on required, 30% on optional
    const requiredPercentage = requiredTotal > 0 ? requiredCompleted / requiredTotal : 0;
    const optionalPercentage = optionalTotal > 0 ? optionalCompleted / optionalTotal : 0;
    const percentage = Math.round(requiredPercentage * 70 + optionalPercentage * 30);

    return {
      percentage,
      sections,
      requiredCompleted,
      requiredTotal,
      optionalCompleted,
      optionalTotal,
    };
  }, [portfolio]);
};

