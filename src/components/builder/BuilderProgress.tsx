import { cn } from "@/lib/utils";
import {
  User,
  Code,
  FolderKanban,
  Briefcase,
  GraduationCap,
  Check,
} from "lucide-react";
import type { Portfolio } from "@/schemas/portfolio";

type Section = {
  id: string;
  label: string;
  icon: React.ElementType;
  isComplete: (portfolio: Portfolio) => boolean;
};

const SECTIONS: Section[] = [
  {
    id: "personal",
    label: "Personal Info",
    icon: User,
    isComplete: (p) =>
      Boolean(
        p.personalInfo.name && p.personalInfo.headline && p.personalInfo.email
      ),
  },
  {
    id: "skills",
    label: "Skills",
    icon: Code,
    isComplete: (p) => p.skills.length >= 3,
  },
  {
    id: "projects",
    label: "Projects",
    icon: FolderKanban,
    isComplete: (p) =>
      p.projects.length > 0 &&
      p.projects.every((proj) => proj.name && proj.description),
  },
  {
    id: "experience",
    label: "Experience",
    icon: Briefcase,
    isComplete: (p) =>
      (p.experience?.length ?? 0) > 0 &&
      (p.experience ?? []).every((exp) => exp.company && exp.role),
  },
  {
    id: "education",
    label: "Education",
    icon: GraduationCap,
    isComplete: (p) =>
      (p.education?.length ?? 0) > 0 &&
      (p.education ?? []).every((edu) => edu.school && edu.degree && edu.field),
  },
];

type BuilderProgressProps = {
  portfolio: Portfolio;
  activeSection?: string;
  onSectionClick: (sectionId: string) => void;
  className?: string;
};

export const BuilderProgress = ({
  portfolio,
  activeSection,
  onSectionClick,
  className,
}: BuilderProgressProps) => {
  const completedCount = SECTIONS.filter((s) => s.isComplete(portfolio)).length;
  const progressPercentage = Math.round(
    (completedCount / SECTIONS.length) * 100
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Portfolio Progress
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            {completedCount}/{SECTIONS.length} sections
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Section Navigation */}
      <nav className="space-y-1">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isComplete = section.isComplete(portfolio);
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSectionClick(section.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all",
                isActive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                  isComplete
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : isActive
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                )}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    "font-medium",
                    isActive
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-slate-700 dark:text-slate-300"
                  )}
                >
                  {section.label}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  {isComplete ? "Complete" : "Incomplete"}
                </p>
              </div>
              {isComplete && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Completion Message */}
      {completedCount === SECTIONS.length && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
            🎉 All sections complete!
          </p>
          <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">
            Your portfolio is ready to publish.
          </p>
        </div>
      )}
    </div>
  );
};

export { SECTIONS };
