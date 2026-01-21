import { useState, useEffect, useRef } from "react";
import { useAuthSession } from "./useAuthSession";
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

type PortfolioSection =
  | "personalInfo"
  | "skills"
  | "projects"
  | "experience"
  | "education"
  | "certifications"
  | "settings"
  | "theme";

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
  autosaveSection: (section: PortfolioSection) => Promise<void>;
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

  // --- Shared save concurrency control (manual + autosave) ---
  // Prevent overlapping saves which can corrupt data due to delete+insert patterns in persistence.
  const isSavingRef = useRef(false);
  type SaveKind = "autosave" | "manual";
  const pendingSaveRef = useRef<null | { kind: SaveKind; section?: PortfolioSection }>(
    null
  );
  // Keep an always-fresh snapshot to avoid saving stale closures.
  const portfolioRef = useRef<Portfolio | null>(null);

  // Per-section autosave tracking
  const sectionAutosaveTimeouts = useRef<
    Record<PortfolioSection, ReturnType<typeof setTimeout> | null>
  >({
    personalInfo: null,
    skills: null,
    projects: null,
    experience: null,
    education: null,
    certifications: null,
    settings: null,
    theme: null,
  });
  const sectionHasChanges = useRef<Record<PortfolioSection, boolean>>({
    personalInfo: false,
    skills: false,
    projects: false,
    experience: false,
    education: false,
    certifications: false,
    settings: false,
    theme: false,
  });

  // Track previous portfolio to avoid unnecessary updates
  const previousPortfolioRef = useRef<string | null>(null);

  useEffect(() => {
    portfolioRef.current = portfolio;
  }, [portfolio]);

  // Helper to normalize portfolio for comparison (excludes internal IDs/timestamps)
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

  const runExclusiveSave = async (
    kind: SaveKind,
    run: (p: Portfolio) => Promise<Portfolio>
  ) => {
    if (!user) return;

    // If a save is already running, coalesce to a single "save latest" pass.
    // Manual saves should override autosave if both happen.
    if (isSavingRef.current) {
      const existing = pendingSaveRef.current;
      if (!existing || existing.kind === "autosave" || kind === "manual") {
        pendingSaveRef.current = { kind };
      }
      return;
    }

    isSavingRef.current = true;

    try {
      // Always use the freshest portfolio at execution time.
      const current = portfolioRef.current;
      if (!current) return;
      const savedPortfolio = await run(current);
      return savedPortfolio;
    } finally {
      isSavingRef.current = false;

      // Run one queued save (latest) if any.
      const pending = pendingSaveRef.current;
      pendingSaveRef.current = null;
      if (pending) {
        // Re-run using the appropriate mode. This call is intentionally fire-and-forget.
        if (pending.kind === "manual") {
          void handleSave();
        } else {
          // Best-effort autosave: pick the first section still marked dirty.
          const dirtySection = (Object.entries(sectionHasChanges.current).find(
            ([, dirty]) => dirty
          )?.[0] as PortfolioSection | undefined);
          if (dirtySection) {
            void autosaveSection(dirtySection);
          }
        }
      }
    }
  };

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
          previousPortfolioRef.current =
            normalizeForComparison(fetchedPortfolio);
          setState("success");
        } else {
          // No portfolio exists, start with empty
          const emptyPortfolio = createEmptyPortfolio();
          setPortfolio(emptyPortfolio);
          previousPortfolioRef.current = normalizeForComparison(emptyPortfolio);
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
        previousPortfolioRef.current = normalizeForComparison(emptyPortfolio);
        toast({
          variant: "destructive",
          title: "Failed to load portfolio",
          description: errorMessage,
        });
      }
    };

    loadPortfolio();
  }, [user]);

  // Per-section autosave function
  const autosaveSection = async (section: PortfolioSection) => {
    if (!user || !portfolio || !sectionHasChanges.current[section]) {
      return;
    }

    // Skip autosave if portfolio is being loaded initially
    if (state === "loading") {
      return;
    }

    const portfolioString = normalizeForComparison(portfolio);

    // Skip if portfolio hasn't actually changed
    if (previousPortfolioRef.current === portfolioString) {
      sectionHasChanges.current[section] = false;
      return;
    }

    try {
      setAutosaveStatus("saving");
      setSaveStatus("saving");

      const savedPortfolio = await runExclusiveSave("autosave", async (latest) => {
        // Create a draft version (isPublic = false)
        const draftPortfolio: Portfolio = {
          ...latest,
          settings: {
            ...latest.settings,
            isPublic: false, // Always save as draft in autosave
          },
        };

        // Validate locally first
        const parsed = portfolioSchema.safeParse(draftPortfolio);
        if (!parsed.success) {
          throw new Error("Autosave skipped: draft portfolio is invalid");
        }

        return await createOrUpdatePortfolio(user.id, draftPortfolio);
      });

      if (!savedPortfolio) return;

      const currentNormalized = normalizeForComparison(portfolioRef.current ?? portfolio);
      const savedNormalized = normalizeForComparison(savedPortfolio);

      // Only update portfolio state if the saved data is meaningfully different
      if (savedNormalized !== currentNormalized) {
        setPortfolio((prev) => {
          if (!prev) return savedPortfolio;

          const prevNormalized = normalizeForComparison(prev);
          if (prevNormalized === savedNormalized) {
            return prev; // Return same reference to prevent re-render
          }

          return savedPortfolio;
        });
        previousPortfolioRef.current = savedNormalized;
      } else {
        previousPortfolioRef.current = portfolioString;
      }

      // Mark this section as saved
      sectionHasChanges.current[section] = false;

      // Check if any section still has unsaved changes
      const hasAnyUnsavedChanges = Object.values(sectionHasChanges.current).some(Boolean);
      hasUnsavedChanges.current = hasAnyUnsavedChanges;

      setLastSavedAt(new Date());
      setAutosaveStatus("saved");
      setSaveStatus(hasAnyUnsavedChanges ? "unsaved" : "saved");

      // Reset to idle after 3 seconds
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
      autosaveTimeoutRef.current = setTimeout(() => {
        setAutosaveStatus("idle");
        if (!hasAnyUnsavedChanges) {
          setSaveStatus("idle");
        }
      }, 3000);
    } catch (error) {
      // If validation failed, treat as "unsaved" without spamming error toasts.
      const message =
        error instanceof Error ? error.message : "Unknown autosave error";
      if (!message.toLowerCase().includes("invalid")) {
        console.error(`Autosave failed for ${section}:`, error);
        toast({
          variant: "destructive",
          title: "Autosave failed",
          description:
            "Your changes weren't saved automatically. Please save manually.",
        });
      }
      setAutosaveStatus("error");
      setSaveStatus("unsaved");
    }
  };

  // Helper to schedule autosave for a section after delay
  const scheduleSectionAutosave = (section: PortfolioSection) => {
    // Clear existing timeout for this section
    if (sectionAutosaveTimeouts.current[section]) {
      clearTimeout(sectionAutosaveTimeouts.current[section]!);
    }

    // Mark section as having changes
    sectionHasChanges.current[section] = true;
    hasUnsavedChanges.current = true;
    setSaveStatus("unsaved");

    // Schedule autosave after 3 seconds of inactivity
    sectionAutosaveTimeouts.current[section] = setTimeout(() => {
      autosaveSection(section);
    }, 3000);
  };

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
    // Schedule autosave for this section
    scheduleSectionAutosave("personalInfo");
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
    // Schedule autosave for this section
    scheduleSectionAutosave("skills");
  };

  const updatePrimaryStack = (value: string[]) => {
    if (!portfolio) return;
    setPortfolio((prev) => ({
      ...prev!,
      primaryStack: value,
    }));
    // Primary stack is part of skills section
    scheduleSectionAutosave("skills");
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
    // Schedule autosave for this section
    scheduleSectionAutosave("projects");
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
    // Schedule autosave for this section
    scheduleSectionAutosave("experience");
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
    // Schedule autosave for this section
    scheduleSectionAutosave("education");
  };

  const updateCertifications = (value: Certification[]) => {
    if (!portfolio) return;
    setPortfolio((prev) => ({
      ...prev!,
      certifications: value,
    }));
    // Clear certifications errors when user modifies certifications
    if (
      errors.certifications &&
      Object.keys(errors.certifications).length > 0
    ) {
      setErrors((prev) => ({
        ...prev,
        certifications: {},
      }));
    }
    // Schedule autosave for this section
    scheduleSectionAutosave("certifications");
  };

  const updateSettings = (value: PortfolioSettings) => {
    if (!portfolio) return;
    setPortfolio((prev) => ({
      ...prev!,
      settings: value,
    }));
    // Clear settings errors when user modifies settings
    if (errors.settings && Object.keys(errors.settings).length > 0) {
      setErrors((prev) => ({
        ...prev,
        settings: {},
      }));
    }
    // Schedule autosave for this section
    scheduleSectionAutosave("settings");
  };

  const updateTheme = (value: PortfolioTheme) => {
    if (!portfolio) return;
    setPortfolio((prev) => ({
      ...prev!,
      theme: value,
    }));
    // Clear theme errors when user modifies theme
    if (errors.theme && Object.keys(errors.theme).length > 0) {
      setErrors((prev) => ({
        ...prev,
        theme: {},
      }));
    }
    // Schedule autosave for this section
    scheduleSectionAutosave("theme");
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
        } else if (
          section === "certifications" &&
          typeof rest[0] === "number"
        ) {
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

    try {
      setState("loading");
      setErrors({ message: null, fieldErrors: [] });

      const savedPortfolio = await runExclusiveSave("manual", async (latest) => {
        return await createOrUpdatePortfolio(user.id, latest);
      });

      if (!savedPortfolio) return;

      setPortfolio(savedPortfolio);
      setState("success");
      setLastSavedAt(new Date());
      hasUnsavedChanges.current = false;
      // Clear per-section flags since manual save is authoritative
      (Object.keys(sectionHasChanges.current) as PortfolioSection[]).forEach((k) => {
        sectionHasChanges.current[k] = false;
      });
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

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(sectionAutosaveTimeouts.current).forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

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
    autosaveSection,
  };
};
