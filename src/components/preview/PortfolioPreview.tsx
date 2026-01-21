import type { Portfolio } from "@/schemas/portfolio";

type PortfolioPreviewProps = {
  portfolio: Portfolio;
};

export const PortfolioPreview = ({ portfolio }: PortfolioPreviewProps) => {
  const { personalInfo, skills, projects, experience, education } = portfolio;

  return (
    <div className="mx-auto max-w-4xl bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 print:shadow-none print:ring-0">
      {/* Header */}
      <header className="border-b border-slate-200 px-8 py-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {personalInfo.name || "Your Name"}
            </h1>
            <p className="text-sm font-medium text-slate-700">
              {personalInfo.headline || "Your headline goes here"}
            </p>
          </div>
          <div className="text-xs text-slate-600 space-y-0.5 md:text-right">
            {personalInfo.email ? <p>{personalInfo.email}</p> : null}
            {personalInfo.phone ? <p>{personalInfo.phone}</p> : null}
            {personalInfo.github ? <p>{personalInfo.github}</p> : null}
            {personalInfo.linkedin ? <p>{personalInfo.linkedin}</p> : null}
          </div>
        </div>
        {personalInfo.bio ? (
          <p className="mt-3 text-xs leading-relaxed text-slate-700">
            {personalInfo.bio}
          </p>
        ) : null}
      </header>

      <div className="grid gap-6 px-8 py-6 md:grid-cols-[1.1fr_0.9fr]">
        {/* Main column */}
        <div className="space-y-5">
          {/* Projects */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Projects
            </h2>
            <div className="mt-2 space-y-3">
              {projects.map((project) => (
                <div key={project.id ?? project.name} className="space-y-1.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {project.name}
                    </p>
                    {project.techStack.length ? (
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">
                        {project.techStack.join(" • ")}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700">
                    {project.description}
                  </p>
                  {(project.repoUrl || project.liveUrl) && (
                    <p className="text-[11px] text-slate-500">
                      {project.repoUrl ? (
                        <>
                          Code:{" "}
                          <a
                            href={project.repoUrl}
                            className="underline underline-offset-2"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {project.repoUrl}
                          </a>
                        </>
                      ) : null}
                      {project.repoUrl && project.liveUrl ? "  •  " : null}
                      {project.liveUrl ? (
                        <>
                          Live:{" "}
                          <a
                            href={project.liveUrl}
                            className="underline underline-offset-2"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {project.liveUrl}
                          </a>
                        </>
                      ) : null}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Experience */}
          {experience && experience.length ? (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Experience
              </h2>
              <div className="mt-2 space-y-3">
                {experience.map((exp) => (
                  <div
                    key={exp.id ?? `${exp.company}-${exp.role}`}
                    className="space-y-1.5"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {exp.role}
                      </p>
                      <p className="text-xs font-medium text-slate-700">
                        {exp.company}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {exp.startDate} –{" "}
                      {exp.current ? "Present" : exp.endDate || "End date"}
                    </p>
                    <p className="text-xs leading-relaxed text-slate-700">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5 md:border-l md:border-slate-200 md:pl-6">
          {/* Skills */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Skills
            </h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span
                  key={skill.name}
                  className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-800"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </section>

          {/* Education */}
          {education && education.length ? (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Education
              </h2>
              <div className="mt-2 space-y-3">
                {education.map((edu) => (
                  <div key={edu.id ?? edu.school} className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-900">
                      {edu.school}
                    </p>
                    <p className="text-xs text-slate-700">
                      {edu.degree} • {edu.field}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {edu.startDate} –{" "}
                      {edu.current ? "Present" : edu.endDate || "End date"}
                    </p>
                    {edu.description ? (
                      <p className="text-[11px] leading-relaxed text-slate-700">
                        {edu.description}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
};
