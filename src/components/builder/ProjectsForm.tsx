import type { Project } from "@/schemas/portfolio";
import { FormCard } from "@/components/form/FormCard";
import { FormSection } from "@/components/form/FormSection";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type ProjectsFormProps = {
  value: Project[];
  onChange: (value: Project[]) => void;
  className?: string;
};

const TECH_STACK_OPTIONS = [
  "TypeScript",
  "JavaScript",
  "React",
  "Next.js",
  "Node.js",
  "TailwindCSS",
  "Python",
  "Django",
  "Express",
  "Vue",
  "Svelte",
  "Go",
  "Rust",
  "PostgreSQL",
  "MongoDB",
  "Prisma",
  "Other",
];

export const ProjectsForm = ({
  value,
  onChange,
  className,
}: ProjectsFormProps) => {
  const handleProjectChange = (index: number, updated: Project) => {
    onChange(value.map((project, idx) => (idx === index ? updated : project)));
  };

  const handleRemoveProject = (index: number) => {
    onChange(value.filter((_, idx) => idx !== index));
  };

  const handleAddProject = () => {
    onChange([
      ...value,
      {
        id: undefined,
        name: "",
        description: "",
        techStack: [],
        repoUrl: "",
        liveUrl: "",
      },
    ]);
  };

  const handleAddTechStack = (index: number, tech: string) => {
    const project = value[index];
    if (!project.techStack.includes(tech)) {
      handleProjectChange(index, {
        ...project,
        techStack: [...project.techStack, tech],
      });
    }
  };

  const handleRemoveTechStack = (index: number, techToRemove: string) => {
    const project = value[index];
    handleProjectChange(index, {
      ...project,
      techStack: project.techStack.filter((tech) => tech !== techToRemove),
    });
  };

  return (
    <FormCard
      title="Projects"
      description="Show the work that best represents what you can do."
      className={className}
    >
      <div className="space-y-6">
        {value.map((project, index) => (
          <FormSection key={project.id ?? index} title={`Project ${index + 1}`}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`project-name-${index}`} required>
                  Project Name
                </Label>
                <Input
                  id={`project-name-${index}`}
                  placeholder="e.g., QwikFolio"
                  value={project.name}
                  onChange={(event) =>
                    handleProjectChange(index, {
                      ...project,
                      name: event.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`project-description-${index}`} required>
                  Description
                </Label>
                <Textarea
                  id={`project-description-${index}`}
                  rows={3}
                  placeholder="What did you build, and what impact did it have?"
                  value={project.description}
                  onChange={(event) =>
                    handleProjectChange(index, {
                      ...project,
                      description: event.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`project-tech-${index}`} required>
                  Tech Stack
                </Label>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => handleRemoveTechStack(index, tech)}
                        className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
                      >
                        <span>{tech}</span>
                        <span className="ml-1.5 text-emerald-600 dark:text-emerald-300">
                          ×
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
                    <div className="space-y-2">
                      <select
                        id={`project-tech-${index}`}
                        value=""
                        onChange={(event) => {
                          if (event.target.value) {
                            handleAddTechStack(index, event.target.value);
                            event.target.value = "";
                          }
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      >
                        <option value="">Select a technology...</option>
                        {TECH_STACK_OPTIONS.filter(
                          (tech) => !project.techStack.includes(tech)
                        ).map((tech) => (
                          <option key={tech} value={tech}>
                            {tech}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`project-repo-${index}`}>
                    Repository URL (optional)
                  </Label>
                  <Input
                    id={`project-repo-${index}`}
                    type="url"
                    placeholder="https://github.com/username/project"
                    value={project.repoUrl}
                    onChange={(event) =>
                      handleProjectChange(index, {
                        ...project,
                        repoUrl: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`project-live-${index}`}>
                    Live URL (optional)
                  </Label>
                  <Input
                    id={`project-live-${index}`}
                    type="url"
                    placeholder="https://project-url.com"
                    value={project.liveUrl}
                    onChange={(event) =>
                      handleProjectChange(index, {
                        ...project,
                        liveUrl: event.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-xs text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50/60 dark:hover:bg-red-950/40"
                  onClick={() => handleRemoveProject(index)}
                >
                  Remove project
                </Button>
              </div>
            </div>
          </FormSection>
        ))}

        <div className="flex justify-start">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddProject}
          >
            Add another project
          </Button>
        </div>
      </div>
    </FormCard>
  );
};
