import { usePortfolioBuilder } from "@/hooks/usePortfolioBuilder";
import { Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PersonalInfoForm } from "@/components/builder/PersonalInfoForm";
import { SkillsForm } from "@/components/builder/SkillsForm";
import { ProjectsForm } from "@/components/builder/ProjectsForm";
import { ExperienceForm } from "@/components/builder/ExperienceForm";
import { EducationForm } from "@/components/builder/EducationForm";

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

  const isLoading = state === "loading";
  const isSaving = state === "loading" && portfolio !== null;

  if (isLoading && !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!portfolio) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            type="button"
            className="flex items-center space-x-2"
            onClick={() => navigate("/")}
          >
            <Zap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <span className="text-lg font-semibold text-slate-900 dark:text-white">
              QwikFolio.io
            </span>
          </button>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-9 text-xs sm:text-sm"
              onClick={() => navigate("/dashboard")}
            >
              Back to dashboard
            </Button>
            <Button
              type="button"
              className="h-9 text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isSaving) {
                  handleSave();
                }
              }}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Portfolio"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
            Portfolio Builder
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Start with your personal info. We&apos;ll use this structured data
            to generate your public portfolio and printable resume.
          </p>
        </section>

        {errors.message ? (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-xs sm:text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {errors.message}
          </div>
        ) : null}

        <section className="space-y-4">
          <PersonalInfoForm
            value={portfolio.personalInfo}
            onChange={updatePersonalInfo}
          />
          <SkillsForm value={portfolio.skills} onChange={updateSkills} />
          <ProjectsForm value={portfolio.projects} onChange={updateProjects} />
          <ExperienceForm
            value={portfolio.experience ?? []}
            onChange={updateExperience}
          />
          <EducationForm
            value={portfolio.education ?? []}
            onChange={updateEducation}
          />
        </section>
      </main>
    </div>
  );
};

export default DashboardBuilderPage;
