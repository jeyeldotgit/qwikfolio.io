import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  User,
  Code,
  FolderKanban,
  Briefcase,
  GraduationCap,
  Check,
  ChevronUp,
} from "lucide-react";
import type { Portfolio } from "@/schemas/portfolio";
import { SECTIONS } from "./BuilderProgress";

type MobileProgressProps = {
  portfolio: Portfolio;
  activeSection?: string;
  onSectionClick: (sectionId: string) => void;
};

const SECTION_ICONS: Record<string, React.ElementType> = {
  personal: User,
  skills: Code,
  projects: FolderKanban,
  experience: Briefcase,
  education: GraduationCap,
};

export const MobileProgress = ({
  portfolio,
  activeSection,
  onSectionClick,
}: MobileProgressProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const completedCount = SECTIONS.filter((s) => s.isComplete(portfolio)).length;
  const progressPercentage = Math.round(
    (completedCount / SECTIONS.length) * 100
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      {/* Expanded Panel */}
      {isExpanded && (
        <div className="mx-3 mb-2 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Progress: {completedCount}/{SECTIONS.length}
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <ChevronUp className="h-5 w-5 rotate-180" />
            </button>
          </div>
          <div className="space-y-2">
            {SECTIONS.map((section) => {
              const Icon = SECTION_ICONS[section.id];
              const isComplete = section.isComplete(portfolio);
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => {
                    onSectionClick(section.id);
                    setIsExpanded(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-900/20"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg",
                      isComplete
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                    )}
                  >
                    {isComplete ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Icon className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "flex-1 text-sm font-medium",
                      isActive
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-slate-700 dark:text-slate-300"
                    )}
                  >
                    {section.label}
                  </span>
                  {isComplete && (
                    <Check className="h-4 w-4 text-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Compact Bar */}
      <div className="border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center gap-3"
        >
          {/* Progress Dots */}
          <div className="flex gap-1">
            {SECTIONS.map((section) => {
              const isComplete = section.isComplete(portfolio);
              const isActive = activeSection === section.id;
              return (
                <div
                  key={section.id}
                  className={cn(
                    "h-2 w-2 rounded-full transition-colors",
                    isComplete
                      ? "bg-emerald-500"
                      : isActive
                        ? "bg-emerald-300 dark:bg-emerald-700"
                        : "bg-slate-200 dark:bg-slate-700"
                  )}
                />
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="flex-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Percentage */}
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {progressPercentage}%
          </span>

          {/* Expand Icon */}
          <ChevronUp
            className={cn(
              "h-4 w-4 text-slate-400 transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        </button>
      </div>
    </div>
  );
};

