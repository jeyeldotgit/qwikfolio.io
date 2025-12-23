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

type PortfolioBuilderErrors = {
  message: string | null;
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
      setErrors({ message: null });

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
        setErrors({ message: errorMessage });
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
  };

  const updateSkills = (value: Skill[]) => {
    if (!portfolio) return;
    setPortfolio((prev) => ({
      ...prev!,
      skills: value,
    }));
  };

  const updateProjects = (value: Project[]) => {
    if (!portfolio) return;
    setPortfolio((prev) => ({
      ...prev!,
      projects: value,
    }));
  };

  const updateExperience = (value: Experience[]) => {
    if (!portfolio) return;
    setPortfolio((prev) => ({
      ...prev!,
      experience: value,
    }));
  };

  const updateEducation = (value: Education[]) => {
    if (!portfolio) return;
    setPortfolio((prev) => ({
      ...prev!,
      education: value,
    }));
  };

  const handleSave = async () => {
    if (!user || !portfolio) {
      setErrors({
        message: "User not authenticated or portfolio not loaded",
      });
      return;
    }

    // Validate locally first
    const parsed = portfolioSchema.safeParse(portfolio);

    if (!parsed.success) {
      const errorMessage =
        "Some fields are missing or invalid. Please review your portfolio.";
      setErrors({ message: errorMessage });
      toast({
        variant: "destructive",
        title: "Validation failed",
        description: errorMessage,
      });
      return;
    }

    setState("loading");
    setErrors({ message: null });

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
      setErrors({ message: errorMessage });
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
