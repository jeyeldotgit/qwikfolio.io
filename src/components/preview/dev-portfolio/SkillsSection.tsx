import type { Portfolio } from "@/schemas/portfolio";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

type DevPortfolioSkillsSectionProps = {
  skills: Portfolio["skills"];
  primaryStack: Portfolio["primaryStack"];
  skillsByCategory: Record<string, Portfolio["skills"]>;
  radiusClasses: string;
};

export const DevPortfolioSkillsSection = ({
  skills,
  primaryStack,
  skillsByCategory,
  radiusClasses,
}: DevPortfolioSkillsSectionProps) => {
  return (
    <section className="border-b border-slate-200 py-14 dark:border-slate-800/50">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-8 font-mono text-sm tracking-wider text-slate-400 dark:text-slate-500">
          {"// tech_stack"}
        </h2>
        <p className="-mt-6 mb-8 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          The tools and technologies I use to build and ship.
        </p>

        {/* Primary Stack */}
        {primaryStack && primaryStack.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Primary Stack
            </h3>
            <div className="flex flex-wrap gap-3">
              {primaryStack.map((skillName) => {
                const skill = skills.find((s) => s.name === skillName);
                if (!skill) return null;
                return (
                  <span
                    key={skill.name}
                    className={cn(
                      "group relative overflow-hidden border-2 px-4 py-2 text-sm font-medium transition-all duration-300",
                      radiusClasses
                    )}
                    style={{
                      borderColor: "var(--portfolio-primary)",
                      borderWidth: "2px",
                      borderStyle: "solid",
                      backgroundColor: "rgba(var(--portfolio-primary-rgb), 0.05)",
                      color: "var(--portfolio-primary)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "1";
                      e.currentTarget.style.backgroundColor =
                        "rgba(var(--portfolio-primary-rgb), 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "0.8";
                      e.currentTarget.style.backgroundColor =
                        "rgba(var(--portfolio-primary-rgb), 0.05)";
                    }}
                  >
                    <span className="relative z-10 flex items-center gap-1.5">
                      <Star
                        className="h-3.5 w-3.5"
                        style={{
                          fill: "var(--portfolio-primary)",
                          color: "var(--portfolio-primary)",
                        }}
                      />
                      {skill.name}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Skills by Category */}
        {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
          <div key={category} className="mb-6 last:mb-0">
            <h3 className="mb-3 text-sm font-semibold capitalize text-slate-700 dark:text-slate-300">
              {category.replace("_", " ")}
            </h3>
            <div className="flex flex-wrap gap-3">
              {categorySkills.map((skill, idx) => {
                const isPrimary = primaryStack?.includes(skill.name);
                return (
                  <span
                    key={skill.name}
                    className={cn(
                      "group relative overflow-hidden rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-300",
                      isPrimary
                        ? cn(
                            radiusClasses,
                            "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/50"
                          )
                        : cn(
                            radiusClasses,
                            "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300"
                          )
                    )}
                    style={{
                      ...(isPrimary
                        ? {
                            borderColor: "var(--portfolio-primary)",
                            borderWidth: "1px",
                            borderStyle: "solid",
                            backgroundColor:
                              "rgba(var(--portfolio-primary-rgb), 0.05)",
                            color: "var(--portfolio-primary)",
                          }
                        : {}),
                      animationDelay: `${idx * 50}ms`,
                    }}
                    onMouseEnter={
                      isPrimary
                        ? (e) => {
                            e.currentTarget.style.opacity = "1";
                            e.currentTarget.style.backgroundColor =
                              "rgba(var(--portfolio-primary-rgb), 0.1)";
                          }
                        : undefined
                    }
                    onMouseLeave={
                      isPrimary
                        ? (e) => {
                            e.currentTarget.style.opacity = "0.8";
                            e.currentTarget.style.backgroundColor =
                              "rgba(var(--portfolio-primary-rgb), 0.05)";
                          }
                        : undefined
                    }
                  >
                    <span className="relative z-10">{skill.name}</span>
                    {skill.level && (
                      <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                        ({skill.level})
                      </span>
                    )}
                    <div
                      className="absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background:
                          "linear-gradient(to right, var(--portfolio-primary)/5, var(--portfolio-primary-dark)/5)",
                      }}
                    />
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};


