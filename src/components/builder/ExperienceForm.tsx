import type { Experience } from "@/schemas/portfolio";
import { FormCard } from "@/components/form/FormCard";
import { FormSection } from "@/components/form/FormSection";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TextareaWithCounter } from "@/components/ui/textarea-with-counter";
import { Button } from "@/components/ui/button";

type ExperienceFormProps = {
  value: Experience[];
  onChange: (value: Experience[]) => void;
  className?: string;
};

export const ExperienceForm = ({
  value,
  onChange,
  className,
}: ExperienceFormProps) => {
  const handleExperienceChange = (index: number, updated: Experience) => {
    onChange(value.map((exp, idx) => (idx === index ? updated : exp)));
  };

  const handleRemoveExperience = (index: number) => {
    onChange(value.filter((_, idx) => idx !== index));
  };

  const handleAddExperience = () => {
    onChange([
      ...value,
      {
        id: undefined,
        company: "",
        role: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
    ]);
  };

  return (
    <FormCard
      title="Experience"
      description="Capture the roles and impact that matter most."
      className={className}
    >
      <div className="space-y-6">
        {value.map((exp, index) => (
          <FormSection key={exp.id ?? index} title={`Experience ${index + 1}`}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`exp-company-${index}`} required>
                    Company
                  </Label>
                  <Input
                    id={`exp-company-${index}`}
                    placeholder="e.g., ShipFast Labs"
                    value={exp.company}
                    onChange={(event) =>
                      handleExperienceChange(index, {
                        ...exp,
                        company: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`exp-role-${index}`} required>
                    Role
                  </Label>
                  <Input
                    id={`exp-role-${index}`}
                    placeholder="e.g., Senior Frontend Engineer"
                    value={exp.role}
                    onChange={(event) =>
                      handleExperienceChange(index, {
                        ...exp,
                        role: event.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`exp-start-${index}`} required>
                    Start Date
                  </Label>
                  <Input
                    id={`exp-start-${index}`}
                    placeholder="2023-01"
                    value={exp.startDate}
                    onChange={(event) =>
                      handleExperienceChange(index, {
                        ...exp,
                        startDate: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`exp-end-${index}`}>End Date</Label>
                  <Input
                    id={`exp-end-${index}`}
                    placeholder="2024-06"
                    value={exp.endDate ?? ""}
                    disabled={exp.current}
                    onChange={(event) =>
                      handleExperienceChange(index, {
                        ...exp,
                        endDate: event.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id={`exp-current-${index}`}
                  type="checkbox"
                  className="h-4 w-4 rounded border border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700"
                  checked={exp.current}
                  onChange={(event) =>
                    handleExperienceChange(index, {
                      ...exp,
                      current: event.target.checked,
                      endDate: event.target.checked ? "" : exp.endDate,
                    })
                  }
                />
                <Label
                  htmlFor={`exp-current-${index}`}
                  className="text-sm font-normal text-slate-600 dark:text-slate-400"
                >
                  I currently work here
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`exp-description-${index}`} required>
                  Description
                </Label>
                <TextareaWithCounter
                  id={`exp-description-${index}`}
                  rows={3}
                  maxLength={400}
                  placeholder="What did you own and ship in this role?"
                  value={exp.description}
                  onChange={(event) =>
                    handleExperienceChange(index, {
                      ...exp,
                      description: event.target.value,
                    })
                  }
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-xs text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50/60 dark:hover:bg-red-950/40"
                  onClick={() => handleRemoveExperience(index)}
                >
                  Remove role
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
            onClick={handleAddExperience}
          >
            Add another role
          </Button>
        </div>
      </div>
    </FormCard>
  );
};
