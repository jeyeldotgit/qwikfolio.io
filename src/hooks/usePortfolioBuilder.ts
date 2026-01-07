import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthSession } from "./useAuthSession";
import { useDebounce } from "./useDebounce";
import {
  portfolioSchema,
  type Portfolio,
  type PersonalInfo,
  type Skill,
  type Project,
  type Experience,
  type Education,
  type Certification,
  type PortfolioSettings,
  type PortfolioTheme,
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
  certifications?: Record<number, Record<string, string>>;
  settings?: Record<string, string>;
  theme?: Record<string, string>;
};

type AutosaveStatus = "idle" | "saving" | "saved" | "error";
type SaveStatus = "idle" | "saving" | "saved" | "unsaved";

type UsePortfolioBuilderResult = {
  state: PortfolioBuilderState;
  portfolio: Portfolio | null;
  errors: PortfolioBuilderErrors;
  autosaveStatus: AutosaveStatus;
  lastSavedAt: Date | null;
  saveStatus: SaveStatus;
  updatePersonalInfo: (value: PersonalInfo) => void;
  updateSkills: (value: Skill[]) => void;
  updatePrimaryStack: (value: string[]) => void;
  updateProjects: (value: Project[]) => void;
  updateExperience: (value: Experience[]) => void;
  updateEducation: (value: Education[]) => void;
  updateCertifications: (value: Certification[]) => void;
  updateSettings: (value: PortfolioSettings) => void;
  updateTheme: (value: PortfolioTheme) => void;
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
    location: "",
    roleLevel: undefined,
    availability: undefined,
    hourlyRate: undefined,
    salaryRange: "",
    profilePhotoUrl: "",
    socialLinks: [],
    // Legacy fields for backward compatibility
    github: "",
    linkedin: "",
  },
  skills: [],
  projects: [],
  experience: [],
  education: [],
  certifications: [],
  settings: {
    isPublic: false,
    showContactForm: true,
  },
  theme: {
    id: "emerald",
    primaryColor: "emerald",
    accentStyle: "soft",
    radius: "md",
    layout: "sidebar-left",
    showProfilePhoto: true,
  },
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
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const hasUnsavedChanges = useRef(false);
  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAutosavingRef = useRef(false);

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
          // Set the ref to prevent autosave on initial load
          previousPortfolioRef.current = JSON.stringify(fetchedPortfolio);
          setState("success");
        } else {
          // No portfolio exists, start with empty
          const emptyPortfolio = createEmptyPortfolio();
          setPortfolio(emptyPortfolio);
          previousPortfolioRef.current = JSON.stringify(emptyPortfolio);
          setState("success");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load portfolio";
        setErrors({ message: errorMessage, fieldErrors: [] });
        setState("error");
        // Still allow editing with empty portfolio
        const emptyPortfolio = createEmptyPortfolio();
        setPortfolio(emptyPortfolio);
        previousPortfolioRef.current = JSON.stringify(emptyPortfolio);
        toast({
          variant: "destructive",
          title: "Failed to load portfolio",
          description: errorMessage,
        });
      }
    };

    loadPortfolio();
  }, [user]);

  // Debounce portfolio changes for autosave (2 seconds delay)
  const debouncedPortfolio = useDebounce(portfolio, 2000);

  // Track previous portfolio to avoid unnecessary updates
  const previousPortfolioRef = useRef<string | null>(null);

  // Autosave effect - saves as draft when portfolio changes
  useEffect(() => {
    if (!user || !debouncedPortfolio || !hasUnsavedChanges.current) {
      return;
    }

    // Skip autosave if portfolio is being loaded initially
    if (state === "loading") {
      return;
    }

    // Create a stable string representation to compare
    const portfolioString = JSON.stringify(debouncedPortfolio);
    
    // Skip if portfolio hasn't actually changed
    if (previousPortfolioRef.current === portfolioString) {
      return;
    }

    // Prevent multiple autosaves from running simultaneously
    if (isAutosavingRef.current) {
      return;
    }

    const performAutosave = async () => {
      isAutosavingRef.current = true;
      setAutosaveStatus("saving");
      setSaveStatus("saving");

      try {
        // Create a draft version (isPublic = false)
        const draftPortfolio: Portfolio = {
          ...debouncedPortfolio,
          settings: {
            ...debouncedPortfolio.settings,
            isPublic: false, // Always save as draft in autosave
          },
        };

        // Validate locally first
        const parsed = portfolioSchema.safeParse(draftPortfolio);
        if (!parsed.success) {
          // Don't autosave invalid data
          setAutosaveStatus("error");
          setSaveStatus("unsaved");
          return;
        }

        const savedPortfolio = await createOrUpdatePortfolio(user.id, draftPortfolio);
        
        // Only update portfolio state if the saved data is meaningfully different
        // Compare only the data that matters (not internal IDs or timestamps)
        const normalizeForComparison = (p: Portfolio) => {
          return JSON.stringify({
            personalInfo: p.personalInfo,
            skills: p.skills,
            projects: p.projects,
            experience: p.experience,
            education: p.education,
            certifications: p.certifications,
            settings: p.settings,
            theme: p.theme,
            primaryStack: p.primaryStack,
          });
        };
        
        const currentNormalized = normalizeForComparison(debouncedPortfolio);
        const savedNormalized = normalizeForComparison(savedPortfolio);
        
        // Only update portfolio state if the saved data is meaningfully different
        // This prevents unnecessary re-renders that cause duplicate inputs
        if (savedNormalized !== currentNormalized) {
          // Use functional update to check against current state before updating
          setPortfolio((prev) => {
            if (!prev) return savedPortfolio;
            
            // Double-check that we're not setting the same data
            const prevNormalized = normalizeForComparison(prev);
            if (prevNormalized === savedNormalized) {
              return prev; // Return same reference to prevent re-render
            }
            
            return savedPortfolio;
          });
          previousPortfolioRef.current = savedNormalized;
        } else {
          // Data is the same, just update the ref to prevent re-autosave
          // Don't update portfolio state to avoid re-renders
          previousPortfolioRef.current = portfolioString;
        }
        
        setLastSavedAt(new Date());
        setAutosaveStatus("saved");
        setSaveStatus("saved");
        hasUnsavedChanges.current = false;

        // Reset to idle after 3 seconds
        if (autosaveTimeoutRef.current) {
          clearTimeout(autosaveTimeoutRef.current);
        }
        autosaveTimeoutRef.current = setTimeout(() => {
          setAutosaveStatus("idle");
          setSaveStatus("idle");
        }, 3000);
      } catch (error) {
        console.error("Autosave failed:", error);
        setAutosaveStatus("error");
        setSaveStatus("unsaved");
        toast({
          variant: "destructive",
          title: "Autosave failed",
          description: "Your changes weren't saved automatically. Please save manually.",
        });
      } finally {
        isAutosavingRef.current = false;
      }
    };

    performAutosave();
  }, [debouncedPortfolio, user, state, toast]);

  const updatePersonalInfo = (value: PersonalInfo) => {
    if (!portfolio) return;
    setPortfolio((prev) => ({
      ...prev!,
      personalInfo: value,
    }));
    hasUnsavedChanges.current = true;
    setSaveStatus("unsaved");
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
    hasUnsavedChanges.current = true;
    setSaveStatus("unsaved");
    // Clear skills errors when user adds a skill
    if (errors.skills) {
      setErrors((prev) => ({
        ...prev,
        skills: undefined,
      }));
    }
  };

  const updatePrimaryStack = (value: string[]) => {
    if (!portfolio) return;
    setPortfolio((prev) => ({
      ...prev!,
      primaryStack: value,
    }));
    hasUnsavedChanges.current = true;
    setSaveStatus("unsaved");
  };

  const updateProjects = (value: Project[]) => {
    if (!portfolio) return;
    setPortfolio((prev) => ({
      ...prev!,
      projects: value,
    }));
    hasUnsavedChanges.current = true;
    setSaveStatus("unsaved");
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
    hasUnsavedChanges.current = true;
    setSaveStatus("unsaved");
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
    hasUnsavedChanges.current = true;
    setSaveStatus("unsaved");
    // Clear education errors when user modifies education
    if (errors.education && Object.keys(errors.education).length > 0) {
      setErrors((prev) => ({
        ...prev,
        education: {},
      }));
    }
  };

  const updateCertifications = (value: Certification[]) => {
    if (!portfolio) return;
    setPortfolio((prev) => ({
      ...prev!,
      certifications: value,
    }));
    hasUnsavedChanges.current = true;
    setSaveStatus("unsaved");
    // Clear certifications errors when user modifies certifications
    if (errors.certifications && Object.keys(errors.certifications).length > 0) {
      setErrors((prev) => ({
        ...prev,
        certifications: {},
      }));
    }
  };

  const updateSettings = (value: PortfolioSettings) => {
    if (!portfolio) return;
    setPortfolio((prev) => ({
      ...prev!,
      settings: value,
    }));
    hasUnsavedChanges.current = true;
    setSaveStatus("unsaved");
    // Clear settings errors when user modifies settings
    if (errors.settings && Object.keys(errors.settings).length > 0) {
      setErrors((prev) => ({
        ...prev,
        settings: {},
      }));
    }
  };

  const updateTheme = (value: PortfolioTheme) => {
    if (!portfolio) return;
    setPortfolio((prev) => ({
      ...prev!,
      theme: value,
    }));
    hasUnsavedChanges.current = true;
    setSaveStatus("unsaved");
    // Clear theme errors when user modifies theme
    if (errors.theme && Object.keys(errors.theme).length > 0) {
      setErrors((prev) => ({
        ...prev,
        theme: {},
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
        certifications: {},
        settings: {},
        theme: {},
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
        } else if (section === "certifications" && typeof rest[0] === "number") {
          const certIndex = rest[0];
          const field = rest[1];
          if (typeof field === "string") {
            if (!organizedErrors.certifications![certIndex]) {
              organizedErrors.certifications![certIndex] = {};
            }
            organizedErrors.certifications![certIndex][field] = error.message;
          }
        } else if (section === "settings" && typeof rest[0] === "string") {
          const field = rest[0];
          organizedErrors.settings![field] = error.message;
        } else if (section === "theme" && typeof rest[0] === "string") {
          const field = rest[0];
          organizedErrors.theme![field] = error.message;
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
      setLastSavedAt(new Date());
      hasUnsavedChanges.current = false;
      setSaveStatus("saved");
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
    autosaveStatus,
    lastSavedAt,
    saveStatus,
    updatePersonalInfo,
    updateSkills,
    updatePrimaryStack,
    updateProjects,
    updateExperience,
    updateEducation,
    updateCertifications,
    updateSettings,
    updateTheme,
    handleSave,
  };
};
