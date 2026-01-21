import type { Portfolio } from "@/schemas/portfolio";
import { cn } from "@/lib/utils";

type DevPortfolioEducationSectionProps = {
  education: Portfolio["education"];
  radiusClasses: string;
};

export const DevPortfolioEducationSection = ({
  education,
  radiusClasses,
}: DevPortfolioEducationSectionProps) => {
  if (!education || education.length === 0) return null;

  return (
    <section className="py-14">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-8 font-mono text-sm tracking-wider text-slate-400 dark:text-slate-500">
          {"// education"}
        </h2>
        <p className="-mt-6 mb-8 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Foundations and formal study highlights.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {education.map((edu) => (
            <div
              key={edu.id ?? edu.school}
              className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/30"
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-mono text-sm font-bold dark:bg-slate-800",
                    radiusClasses
                  )}
                  style={{ color: "var(--portfolio-primary)" }}
                >
                  {edu.school.charAt(0)}
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {edu.school}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {edu.degree} • {edu.field}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="font-mono text-xs text-slate-400 dark:text-slate-500">
                      {edu.startDate} →{" "}
                      {edu.current ? "Present" : edu.endDate || "End date"}
                    </p>
                    {edu.gpa && (
                      <>
                        <span className="text-slate-300 dark:text-slate-700">
                          •
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          GPA: {edu.gpa.toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                  {edu.honors && (
                    <p
                      className="text-xs font-medium"
                      style={{ color: "var(--portfolio-primary)" }}
                    >
                      {edu.honors}
                    </p>
                  )}
                  {edu.coursework && edu.coursework.length > 0 && (
                    <div className="pt-1">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Relevant Coursework:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {edu.coursework.map((course, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          >
                            {course}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {edu.description && (
                    <p className="pt-1 text-sm text-slate-500">
                      {edu.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


