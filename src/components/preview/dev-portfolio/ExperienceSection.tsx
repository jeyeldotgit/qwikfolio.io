import type { Portfolio } from "@/schemas/portfolio";
import { MapPin } from "lucide-react";

type DevPortfolioExperienceSectionProps = {
  experience: Portfolio["experience"];
};

export const DevPortfolioExperienceSection = ({
  experience,
}: DevPortfolioExperienceSectionProps) => {
  if (!experience || experience.length === 0) return null;

  return (
    <section className="border-b border-slate-200 py-14 dark:border-slate-800/50">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-8 font-mono text-sm tracking-wider text-slate-400 dark:text-slate-500">
          {"// work_history"}
        </h2>
        <p className="-mt-6 mb-8 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Roles, scope, and results—what I built and why it mattered.
        </p>

        <div className="relative space-y-8">
          <div
            className="absolute bottom-0 left-[7px] top-2 w-px bg-linear-to-b via-slate-300 to-transparent dark:via-slate-700"
            style={{
              background:
                "linear-gradient(to bottom, var(--portfolio-primary), rgb(203 213 225), transparent)",
            }}
          />

          {experience.map((exp) => (
            <div
              key={exp.id ?? `${exp.company}-${exp.role}`}
              className="relative pl-8"
            >
              <div
                className="absolute left-0 top-2 h-3.5 w-3.5 rounded-full border-2 bg-white dark:bg-slate-950"
                style={{ borderColor: "var(--portfolio-primary)" }}
              />

              <div className="space-y-2">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {exp.role}
                  </h3>
                  <span className="text-slate-400 dark:text-slate-500">@</span>
                  <span
                    className="font-medium"
                    style={{ color: "var(--portfolio-primary)" }}
                  >
                    {exp.company}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <p className="font-mono text-xs text-slate-400 dark:text-slate-500">
                    {exp.startDate} → {exp.current ? "Present" : exp.endDate || "End date"}
                  </p>
                  {exp.location && (
                    <>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3 w-3" />
                        {exp.location}
                      </div>
                    </>
                  )}
                  {exp.employmentType && (
                    <>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {exp.employmentType.replace("_", "-")}
                      </span>
                    </>
                  )}
                </div>

                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-400">
                    {exp.achievements.map((achievement, idx) => (
                      <li key={idx}>{achievement}</li>
                    ))}
                  </ul>
                )}

                {exp.description && (
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {exp.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


