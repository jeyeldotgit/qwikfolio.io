import type { Project } from "@/schemas/portfolio";
import { useState } from "react";
import { FormCard } from "@/components/form/FormCard";
import { FormSection } from "@/components/form/FormSection";
import { FormActions } from "@/components/form/FormActions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type ProjectsFormProps = {
  value: Project[];
  onChange: (value: Project[]) => void;
  onSubmitSection?: () => void;
  className?: string;
};

export const ProjectsForm = ({
  value,
  onChange,
  onSubmitSection,
  className,
}: ProjectsFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    onSubmitSection?.();
    setTimeout(() => setIsSubmitting(false), 150);
  };

  return (
    <FormCard
      title="Projects"
      description="Show the work that best represents what you can do."
      className={className}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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
                    handleProjectChange(index, { ...project, name: event.target.value })
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
                  Tech Stack (comma separated)
                </Label>
                <Input
                  id={`project-tech-${index}`}
                  placeholder="TypeScript, React, Tailwind CSS"
                  value={project.techStack.join(", ")}
                  onChange={(event) =>
                    handleProjectChange(index, {
                      ...project,
                      techStack: event.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`project-repo-${index}`}>Repository URL</Label>
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
                  <Label htmlFor={`project-live-${index}`}>Live URL</Label>
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
          <Button type="button" size="sm" variant="outline" onClick={handleAddProject}>
            Add another project
          </Button>
        </div>

        <FormActions isSubmitting={isSubmitting} primaryLabel="Save projects" />
      </form>
    </FormCard>
  );
};


