import { useState, useEffect } from "react";
import { useAuthSession } from "./useAuthSession";
import {
  portfolioSchema,
  type Portfolio,
  type PersonalInfo,
  type Skill,
  type Project,
  type Experience,
  type Education,
} from "@/schemas/portfolio";
import {
  getPortfolio,
  createOrUpdatePortfolio,
} from "@/services/portfolio/portfolioService";
import { useToast } from "./useToast";

type PortfolioBuilderState = "idle" | "loading" | "success" | "error";

type FieldError = {
  field: string;
  message: string;
  path: (string | number)[];
};

type PortfolioBuilderErrors = {
  message: string | null;
  fieldErrors: FieldError[];
  personalInfo?: Record<string, string>;
  skills?: string;
  projects?: Record<number, Record<string, string>>;
  experience?: Record<number, Record<string, string>>;
  education?: Record<number, Record<string, string>>;
};

type UsePortfolioBuilderResult = {
  state: PortfolioBuilderState;
  portfolio: Portfolio | null;
  errors: PortfolioBuilderErrors;
  updatePersonalInfo: (value: PersonalInfo) => void;
  updateSkills: (value: Skill[]) => void;
  updateProjects: (value: Project[]) => void;
  updateExperience: (value: Experience[]) => void;
  updateEducation: (value: Education[]) => void;
  handleSave: () => Promise<void>;
};

const createEmptyPortfolio = (): Portfolio => ({
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
});

export const usePortfolioBuilder = (): UsePortfolioBuilderResult => {
  const { user } = useAuthSession();
  const { toast } = useToast();
  const [state, setState] = useState<PortfolioBuilderState>("idle");
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [errors, setErrors] = useState<PortfolioBuilderErrors>({
    message: null,
    fieldErrors: [],
  });

  // Load portfolio on mount
  useEffect(() => {
    if (!user) {
      setState("idle");
      setPortfolio(null);
      return;
    }

    const loadPortfolio = async () => {
      setState("loading");
      setErrors({ message: null, fieldErrors: [] });

      try {
        const fetchedPortfolio = await getPortfolio(user.id);

        if (fetchedPortfolio) {
          setPortfolio(fetchedPortfolio);
          setState("success");
        } else {
          // No portfolio exists, start with empty
          setPortfolio(createEmptyPortfolio());
          setState("success");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load portfolio";
        setErrors({ message: errorMessage, fieldErrors: [] });
        setState("error");
        // Still allow editing with empty portfolio
        setPortfolio(createEmptyPortfolio());
        toast({
          variant: "destructive",
          title: "Failed to load portfolio",
          description: errorMessage,
        });
      }
    };

    loadPortfolio();
  }, [user]);

  const updatePersonalInfo = (value: PersonalInfo) => {
    if (!portfolio) return;
    setPortfolio((prev) => ({
      ...prev!,
      personalInfo: value,
    }));
    // Clear personalInfo errors when user starts typing
    if (errors.personalInfo) {
      setErrors((prev) => ({
        ...prev,
        personalInfo: {},
      }));
    }
  };

  const updateSkills = (value: Skill[]) => {
    if (!portfolio) return;
    setPortfolio((prev) => ({
      ...prev!,
      skills: value,
    }));
    // Clear skills errors when user adds a skill
    if (errors.skills) {
      setErrors((prev) => ({
        ...prev,
        skills: undefined,
      }));
    }
  };

  const updateProjects = (value: Project[]) => {
    if (!portfolio) return;
    setPortfolio((prev) => ({
      ...prev!,
      projects: value,
    }));
    // Clear projects errors when user modifies projects
    if (errors.projects && Object.keys(errors.projects).length > 0) {
      setErrors((prev) => ({
        ...prev,
        projects: {},
      }));
    }
  };

  const updateExperience = (value: Experience[]) => {
    if (!portfolio) return;
    setPortfolio((prev) => ({
      ...prev!,
      experience: value,
    }));
    // Clear experience errors when user modifies experience
    if (errors.experience && Object.keys(errors.experience).length > 0) {
      setErrors((prev) => ({
        ...prev,
        experience: {},
      }));
    }
  };

  const updateEducation = (value: Education[]) => {
    if (!portfolio) return;
    setPortfolio((prev) => ({
      ...prev!,
      education: value,
    }));
    // Clear education errors when user modifies education
    if (errors.education && Object.keys(errors.education).length > 0) {
      setErrors((prev) => ({
        ...prev,
        education: {},
      }));
    }
  };

  const handleSave = async () => {
    if (!user || !portfolio) {
      setErrors({
        message: "User not authenticated or portfolio not loaded",
        fieldErrors: [],
      });
      return;
    }

    // Validate locally first
    const parsed = portfolioSchema.safeParse(portfolio);

    if (!parsed.success) {
      // Extract field-level errors
      const fieldErrors: FieldError[] = parsed.error.issues.map((issue) => ({
        field: issue.path[0] as string,
        message: issue.message,
        path: issue.path as (string | number)[],
      }));

      // Organize errors by section
      const organizedErrors: PortfolioBuilderErrors = {
        message:
          "Some fields are missing or invalid. Please review your portfolio.",
        fieldErrors,
        personalInfo: {},
        skills: undefined,
        projects: {},
        experience: {},
        education: {},
      };

      // Group errors by section
      fieldErrors.forEach((error) => {
        const [section, ...rest] = error.path;

        if (section === "personalInfo" && typeof rest[0] === "string") {
          organizedErrors.personalInfo![rest[0]] = error.message;
        } else if (section === "skills") {
          organizedErrors.skills = error.message;
        } else if (section === "projects" && typeof rest[0] === "number") {
          const projectIndex = rest[0];
          const field = rest[1];
          if (typeof field === "string") {
            if (!organizedErrors.projects![projectIndex]) {
              organizedErrors.projects![projectIndex] = {};
            }
            organizedErrors.projects![projectIndex][field] = error.message;
          }
        } else if (section === "experience" && typeof rest[0] === "number") {
          const expIndex = rest[0];
          const field = rest[1];
          if (typeof field === "string") {
            if (!organizedErrors.experience![expIndex]) {
              organizedErrors.experience![expIndex] = {};
            }
            organizedErrors.experience![expIndex][field] = error.message;
          }
        } else if (section === "education" && typeof rest[0] === "number") {
          const eduIndex = rest[0];
          const field = rest[1];
          if (typeof field === "string") {
            if (!organizedErrors.education![eduIndex]) {
              organizedErrors.education![eduIndex] = {};
            }
            organizedErrors.education![eduIndex][field] = error.message;
          }
        }
      });

      setErrors(organizedErrors);
      toast({
        variant: "destructive",
        title: "Validation failed",
        description: "Please check the highlighted fields below.",
      });
      return;
    }

    setState("loading");
    setErrors({ message: null, fieldErrors: [] });

    try {
      const savedPortfolio = await createOrUpdatePortfolio(user.id, portfolio);
      setPortfolio(savedPortfolio);
      setState("success");
      toast({
        variant: "success",
        title: "Portfolio saved!",
        description: "Your portfolio has been saved successfully.",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save portfolio";
      setErrors({ message: errorMessage, fieldErrors: [] });
      setState("error");
      toast({
        variant: "destructive",
        title: "Failed to save portfolio",
        description: errorMessage,
      });
    }
  };

  return {
    state,
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
