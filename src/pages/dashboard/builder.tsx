import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { usePortfolioBuilder } from "@/hooks/usePortfolioBuilder";
import { BuilderHeader } from "@/components/builder/BuilderHeader";
import { BuilderProgress } from "@/components/builder/BuilderProgress";
import { MobileProgress } from "@/components/builder/MobileProgress";
import { PersonalInfoForm } from "@/components/builder/PersonalInfoForm";
import { SkillsForm } from "@/components/builder/SkillsForm";
import { ProjectsForm } from "@/components/builder/ProjectsForm";
import { ExperienceForm } from "@/components/builder/ExperienceForm";
import { EducationForm } from "@/components/builder/EducationForm";

type SaveStatus = "idle" | "saving" | "saved" | "unsaved";

const DashboardBuilderPage = () => {
  const navigate = useNavigate();
  const {
    state,
    portfolio,
    errors,
    updatePersonalInfo,
    updateSkills,
    updateProjects,
    updateExperience,
    updateEducation,
    handleSave,
  } = usePortfolioBuilder();

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [activeSection, setActiveSection] = useState("personal");
  const hasUnsavedChanges = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLoading = state === "loading";
  const isSaving = state === "loading" && portfolio !== null;

  // Section refs for scroll navigation
  const sectionRefs = {
    personal: useRef<HTMLDivElement>(null),
    skills: useRef<HTMLDivElement>(null),
    projects: useRef<HTMLDivElement>(null),
    experience: useRef<HTMLDivElement>(null),
    education: useRef<HTMLDivElement>(null),
  };

  // Track unsaved changes
  useEffect(() => {
    if (portfolio && state === "success") {
      hasUnsavedChanges.current = true;
      setSaveStatus("unsaved");
    }
  }, [portfolio, state]);

  // Handle save with status updates
  const handleSaveWithStatus = useCallback(async () => {
    if (isSaving) return;

    setSaveStatus("saving");
    await handleSave();
    setSaveStatus("saved");
    hasUnsavedChanges.current = false;

    // Reset to idle after 2 seconds
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus("idle");
    }, 2000);
  }, [handleSave, isSaving]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveWithStatus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveWithStatus]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current && saveStatus === "unsaved") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    const ref = sectionRefs[sectionId as keyof typeof sectionRefs];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(sectionId);
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;

      for (const [id, ref] of Object.entries(sectionRefs)) {
        if (ref.current) {
          const { offsetTop, offsetHeight } = ref.current;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle preview
  const handlePreview = () => {
    navigate("/dashboard/preview");
  };

  if (isLoading && !portfolio) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500 dark:border-slate-700" />
      </div>
    );
  }

  if (!portfolio) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <BuilderHeader
        saveStatus={saveStatus}
        onSave={handleSaveWithStatus}
        onPreview={handlePreview}
        isSaving={isSaving}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Sidebar - Progress */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24">
              <BuilderProgress
                portfolio={portfolio}
                activeSection={activeSection}
                onSectionClick={scrollToSection}
              />

              {/* Keyboard Shortcut Hint */}
              <div className="mt-6 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Keyboard shortcut
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                  Press{" "}
                  <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:bg-slate-800">
                    Ctrl
                  </kbd>{" "}
                  +{" "}
                  <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:bg-slate-800">
                    S
                  </kbd>{" "}
                  to save
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="min-w-0 flex-1 space-y-6">
            {/* Header */}
            <section className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                Portfolio Builder
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 sm:text-base">
                Build your professional portfolio step by step. Fill in each
                section to create a complete portfolio.
              </p>
            </section>

            {/* Error Message */}
            {errors.message && (
              <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                {errors.message}
              </div>
            )}

            {/* Form Sections */}
            <div ref={sectionRefs.personal}>
              <PersonalInfoForm
                value={portfolio.personalInfo}
                onChange={updatePersonalInfo}
              />
            </div>

            <div ref={sectionRefs.skills}>
              <SkillsForm value={portfolio.skills} onChange={updateSkills} />
            </div>

            <div ref={sectionRefs.projects}>
              <ProjectsForm
                value={portfolio.projects}
                onChange={updateProjects}
              />
            </div>

            <div ref={sectionRefs.experience}>
              <ExperienceForm
                value={portfolio.experience ?? []}
                onChange={updateExperience}
              />
            </div>

            <div ref={sectionRefs.education}>
              <EducationForm
                value={portfolio.education ?? []}
                onChange={updateEducation}
              />
            </div>

            {/* Bottom spacer for mobile progress bar */}
            <div className="h-16 lg:hidden" />
          </main>
        </div>
      </div>

      {/* Mobile Progress Bar */}
      <MobileProgress
        portfolio={portfolio}
        activeSection={activeSection}
        onSectionClick={scrollToSection}
      />
    </div>
  );
};

export default DashboardBuilderPage;
