import type { Portfolio } from "@/schemas/portfolio";
import { cn } from "@/lib/utils";
import { ExternalLink, Github, Star, Video } from "lucide-react";

type DevPortfolioProjectsSectionProps = {
  slug: string | null;
  radiusClasses: string;
  themeBorderClass: string;
  projects: Portfolio["projects"];
  onProjectView?: (projectId: string) => void;
};

export const DevPortfolioProjectsSection = ({
  slug,
  radiusClasses,
  themeBorderClass,
  projects,
  onProjectView,
}: DevPortfolioProjectsSectionProps) => {
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return (a.order || 0) - (b.order || 0);
  });

  return (
    <section
      id="projects"
      className="border-b border-slate-200 py-14 dark:border-slate-800/50"
    >
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-8 font-mono text-sm tracking-wider text-slate-400 dark:text-slate-500">
          {"// featured_projects"}
        </h2>
        <p className="-mt-6 mb-8 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          A curated set of work with impact, context, and the tools used.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {sortedProjects.map((project, idx) => (
            <article
              key={project.id ?? project.name}
              className={cn(
                "group relative overflow-hidden border p-6 transition-all duration-500 hover:shadow-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--portfolio-primary) focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950",
                radiusClasses,
                project.featured
                  ? cn(
                      themeBorderClass + "/50",
                      "bg-(--portfolio-primary)/5",
                      "dark:bg-(--portfolio-primary)/10"
                    )
                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:bg-slate-900/80"
              )}
              role="link"
              tabIndex={0}
              aria-label={`Open project: ${project.name}`}
              onClick={() => {
                if (slug && project.id) onProjectView?.(project.id);
                const primaryUrl = project.liveUrl || project.repoUrl;
                if (primaryUrl) window.open(primaryUrl, "_blank", "noopener");
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return;
                e.preventDefault();
                if (slug && project.id) onProjectView?.(project.id);
                const primaryUrl = project.liveUrl || project.repoUrl;
                if (primaryUrl) window.open(primaryUrl, "_blank", "noopener");
              }}
            >
              {project.featured && (
                <div
                  className="absolute right-6 top-6 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: "var(--portfolio-primary)",
                    opacity: 0.1,
                    color: "var(--portfolio-primary)",
                  }}
                >
                  <Star
                    className="h-3 w-3"
                    style={{
                      fill: "var(--portfolio-primary)",
                      color: "var(--portfolio-primary)",
                    }}
                  />
                  Featured
                </div>
              )}

              {!project.featured && (
                <span className="absolute right-6 top-6 font-mono text-5xl font-bold text-slate-100 transition-colors duration-500 group-hover:text-slate-200 dark:text-slate-800 dark:group-hover:text-slate-700">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              )}

              <div className="relative flex h-full flex-col gap-4">
                {project.media && project.media.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {project.media.slice(0, 2).map((media, mIdx) => (
                      <div
                        key={mIdx}
                        className="relative aspect-video overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800"
                      >
                        {media.type === "image" ? (
                          <img
                            src={media.url}
                            alt={`${project.name} preview ${mIdx + 1}`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Video className="h-8 w-8 text-slate-400" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className="text-xl font-bold text-slate-900 transition-colors duration-300 dark:text-white"
                      style={{ color: "var(--portfolio-primary)" }}
                    >
                      {project.name}
                    </h3>
                  </div>
                  {project.role && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {project.role}
                    </p>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3">
                    {project.description}
                  </p>
                </div>

                {project.highlights && project.highlights.length > 0 && (
                  <ul className="space-y-1.5">
                    {project.highlights.map((highlight, hIdx) => (
                      <li
                        key={hIdx}
                        className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                      >
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: "var(--portfolio-primary)" }}
                        />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto space-y-3 pt-2">
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {project.techStack && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4">
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-(--portfolio-primary) dark:hover:text-(--portfolio-primary-dark) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--portfolio-primary) focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950 rounded"
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
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-(--portfolio-primary) dark:hover:text-(--portfolio-primary-dark) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--portfolio-primary) focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950 rounded"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div
                className="absolute inset-x-0 bottom-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(to right, transparent, var(--portfolio-primary), transparent)",
                }}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};


