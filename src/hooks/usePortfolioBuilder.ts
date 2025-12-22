import { useState } from "react";
import mockData from "../../mockdata.json";
import {
  portfolioSchema,
  type Portfolio,
  type PersonalInfo,
  type Skill,
  type Project,
  type Experience,
  type Education,
} from "@/schemas/portfolio";

type PortfolioBuilderErrors = {
  message: string | null;
};

type UsePortfolioBuilderResult = {
  portfolio: Portfolio;
  errors: PortfolioBuilderErrors;
  updatePersonalInfo: (value: PersonalInfo) => void;
  updateSkills: (value: Skill[]) => void;
  updateProjects: (value: Project[]) => void;
  updateExperience: (value: Experience[]) => void;
  updateEducation: (value: Education[]) => void;
  handleSave: () => void;
};

const parseMockPortfolio = (): Portfolio => {
  const parsed = portfolioSchema.safeParse(mockData);

  if (parsed.success) {
    return parsed.data;
  }

  console.warn("mockdata.json does not match portfolio schema", parsed.error);

  return {
    personalInfo: {
      name: "",
      headline: "",
      email: "",
      phone: "",
      bio: "",
      website: "",
      github: "",
      linkedin: "",
    },
    skills: [],
    projects: [],
    experience: [],
    education: [],
  };
};

export const usePortfolioBuilder = (): UsePortfolioBuilderResult => {
  const [portfolio, setPortfolio] = useState<Portfolio>(parseMockPortfolio);
  const [errors, setErrors] = useState<PortfolioBuilderErrors>({
    message: null,
  });

  const updatePersonalInfo = (value: PersonalInfo) => {
    setPortfolio((prev) => ({
      ...prev,
      personalInfo: value,
    }));
  };

  const updateSkills = (value: Skill[]) => {
    setPortfolio((prev) => ({
      ...prev,
      skills: value,
    }));
  };

  const updateProjects = (value: Project[]) => {
    setPortfolio((prev) => ({
      ...prev,
      projects: value,
    }));
  };

  const updateExperience = (value: Experience[]) => {
    setPortfolio((prev) => ({
      ...prev,
      experience: value,
    }));
  };

  const updateEducation = (value: Education[]) => {
    setPortfolio((prev) => ({
      ...prev,
      education: value,
    }));
  };

  const handleSave = () => {
    const parsed = portfolioSchema.safeParse(portfolio);

    if (!parsed.success) {
      console.warn("Portfolio validation failed", parsed.error);
      setErrors({
        message:
          "Some fields are missing or invalid. Please review your portfolio.",
      });
      return;
    }

    setErrors({ message: null });

    // For now, just log the validated portfolio.
    console.log("Portfolio saved", parsed.data);
  };

  return {
    portfolio,
    errors,
    updatePersonalInfo,
    updateSkills,
    updateProjects,
    updateExperience,
    updateEducation,
    handleSave,
  };
};
