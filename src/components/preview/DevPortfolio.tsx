import type { Portfolio } from "@/schemas/portfolio";
import { Github, Linkedin, Globe, Mail, ExternalLink, MapPin } from "lucide-react";

type DevPortfolioProps = {
  portfolio: Portfolio;
};

const SocialLink = ({ href, icon: Icon, label }: { href: string; icon: typeof Github; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="group flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors duration-300"
    aria-label={label}
  >
    <Icon className="h-4 w-4" />
    <span className="text-sm font-medium">{label}</span>
  </a>
);

export const DevPortfolio = ({ portfolio }: DevPortfolioProps) => {
  const { personalInfo, skills, projects, experience, education } = portfolio;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 print:hidden">
      {/* Geometric Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* Hero Section */}
      <header className="relative border-b border-slate-800/50">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-6">
              {/* Name with gradient accent */}
              <div className="space-y-2">
                <p className="font-mono text-sm tracking-wider text-emerald-400">
                  {"<hello world />"}
                </p>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    {personalInfo.name || "Your Name"}
                  </span>
                </h1>
                <p className="text-xl font-medium text-slate-300 sm:text-2xl">
                  {personalInfo.headline || "Developer"}
                </p>
              </div>

              {/* Bio */}
              {personalInfo.bio && (
                <p className="max-w-2xl text-lg leading-relaxed text-slate-400">
                  {personalInfo.bio}
                </p>
              )}

              {/* Social Links */}
              <div className="flex flex-wrap gap-6 pt-2">
                {personalInfo.email && (
                  <SocialLink href={`mailto:${personalInfo.email}`} icon={Mail} label="Email" />
                )}
                {personalInfo.github && (
                  <SocialLink href={personalInfo.github} icon={Github} label="GitHub" />
                )}
                {personalInfo.linkedin && (
                  <SocialLink href={personalInfo.linkedin} icon={Linkedin} label="LinkedIn" />
                )}
                {personalInfo.website && (
                  <SocialLink href={personalInfo.website} icon={Globe} label="Website" />
                )}
              </div>
            </div>

            {/* Avatar/Decoration */}
            <div className="hidden lg:block">
              <div className="relative h-48 w-48">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 opacity-20 blur-xl" />
                <div className="relative flex h-full w-full items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/80 backdrop-blur">
                  <span className="font-mono text-6xl font-bold text-emerald-400">
                    {(personalInfo.name || "U")[0]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Skills Section */}
      <section className="border-b border-slate-800/50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-8 font-mono text-sm tracking-wider text-slate-500">
            {"// tech_stack"}
          </h2>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill, idx) => (
              <span
                key={skill}
                className="group relative overflow-hidden rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-300 hover:border-emerald-500/50 hover:text-emerald-400"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <span className="relative z-10">{skill}</span>
                <div className="absolute inset-0 -z-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="border-b border-slate-800/50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-8 font-mono text-sm tracking-wider text-slate-500">
            {"// featured_projects"}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project, idx) => (
              <article
                key={project.id ?? project.name}
                className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-all duration-500 hover:border-slate-700 hover:bg-slate-900/80"
              >
                {/* Project number indicator */}
                <span className="absolute right-6 top-6 font-mono text-5xl font-bold text-slate-800 transition-colors duration-500 group-hover:text-slate-700">
                  {String(idx + 1).padStart(2, "0")}
                </span>

                <div className="relative space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-emerald-400">
                      {project.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {project.description}
                    </p>
                  </div>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md bg-slate-800 px-2.5 py-1 font-mono text-xs text-slate-400"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex gap-4 pt-2">
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-emerald-400"
                      >
                        <Github className="h-4 w-4" />
                        <span>Source</span>
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-emerald-400"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Hover gradient */}
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      {experience && experience.length > 0 && (
        <section className="border-b border-slate-800/50 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-8 font-mono text-sm tracking-wider text-slate-500">
              {"// work_history"}
            </h2>
            <div className="relative space-y-8">
              {/* Timeline line */}
              <div className="absolute bottom-0 left-[7px] top-2 w-px bg-gradient-to-b from-emerald-500 via-slate-700 to-transparent" />

              {experience.map((exp) => (
                <div key={exp.id ?? `${exp.company}-${exp.role}`} className="relative pl-8">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-2 h-3.5 w-3.5 rounded-full border-2 border-emerald-500 bg-slate-950" />

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="text-lg font-semibold text-white">{exp.role}</h3>
                      <span className="text-slate-500">@</span>
                      <span className="font-medium text-emerald-400">{exp.company}</span>
                    </div>
                    <p className="font-mono text-xs text-slate-500">
                      {exp.startDate} → {exp.current ? "Present" : exp.endDate || "End date"}
                    </p>
                    <p className="text-sm leading-relaxed text-slate-400">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Education Section */}
      {education && education.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-8 font-mono text-sm tracking-wider text-slate-500">
              {"// education"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {education.map((edu) => (
                <div
                  key={edu.id ?? edu.school}
                  className="rounded-xl border border-slate-800 bg-slate-900/30 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 font-mono text-sm font-bold text-emerald-400">
                      {edu.school.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-white">{edu.school}</h3>
                      <p className="text-sm text-slate-400">
                        {edu.degree} • {edu.field}
                      </p>
                      <p className="font-mono text-xs text-slate-500">
                        {edu.startDate} → {edu.current ? "Present" : edu.endDate || "End date"}
                      </p>
                      {edu.description && (
                        <p className="pt-1 text-sm text-slate-500">{edu.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="font-mono text-xs text-slate-600">
            Built with <span className="text-emerald-500">QwikFolio.io</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

