import type { Experience } from "@/schemas/portfolio";
import { FormCard } from "@/components/form/FormCard";
import { FormSection } from "@/components/form/FormSection";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TextareaWithCounter } from "@/components/ui/textarea-with-counter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";

type ExperienceFormProps = {
  value: Experience[];
  onChange: (value: Experience[]) => void;
  errors?: Record<number, Record<string, string>>;
  className?: string;
};

export const ExperienceForm = ({
  value,
  onChange,
  errors = {},
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
        location: "",
        employmentType: undefined,
        achievements: [],
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
        {value.map((exp, index) => {
          // Use id if available, otherwise use index for stable key
          // This prevents key changes when user types, which causes input to lose focus
          const stableKey = exp.id ?? `exp-new-${index}`;
          return (
            <FormSection key={stableKey} title={`Experience ${index + 1}`}>
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
                      className={cn(
                        errors[index]?.company &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500"
                      )}
                    />
                    {errors[index]?.company && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {errors[index].company}
                      </p>
                    )}
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
                      className={cn(
                        errors[index]?.role &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500"
                      )}
                    />
                    {errors[index]?.role && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {errors[index].role}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`exp-location-${index}`}>
                      Location (optional)
                    </Label>
                    <Input
                      id={`exp-location-${index}`}
                      placeholder="e.g., San Francisco, CA"
                      value={exp.location ?? ""}
                      onChange={(event) =>
                        handleExperienceChange(index, {
                          ...exp,
                          location: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`exp-employment-type-${index}`}>
                      Employment Type
                    </Label>
                    <select
                      id={`exp-employment-type-${index}`}
                      value={exp.employmentType ?? ""}
                      onChange={(event) =>
                        handleExperienceChange(index, {
                          ...exp,
                          employmentType: event.target.value
                            ? (event.target
                                .value as Experience["employmentType"])
                            : undefined,
                        })
                      }
                      className={cn(
                        "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      )}
                    >
                      <option value="">Select type...</option>
                      <option value="full_time">Full-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
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
                      className={cn(
                        errors[index]?.startDate &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500"
                      )}
                    />
                    {errors[index]?.startDate && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {errors[index].startDate}
                      </p>
                    )}
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

                {/* Achievements */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Achievements</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const achievements = exp.achievements || [];
                        handleExperienceChange(index, {
                          ...exp,
                          achievements: [...achievements, ""],
                        });
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Achievement
                    </Button>
                  </div>
                  {(exp.achievements || []).map((achievement, aIndex) => (
                    <div key={aIndex} className="flex gap-2">
                      <Input
                        placeholder="e.g., Increased user engagement by 40%"
                        value={achievement}
                        onChange={(event) => {
                          const achievements = [...(exp.achievements || [])];
                          achievements[aIndex] = event.target.value;
                          handleExperienceChange(index, {
                            ...exp,
                            achievements,
                          });
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => {
                          const achievements = (exp.achievements || []).filter(
                            (_, idx) => idx !== aIndex
                          );
                          handleExperienceChange(index, {
                            ...exp,
                            achievements,
                          });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {(!exp.achievements || exp.achievements.length === 0) && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Add key achievements or impact metrics for this role
                    </p>
                  )}
                </div>

                {/* Description (optional, for backward compatibility) */}
                <div className="space-y-2">
                  <Label htmlFor={`exp-description-${index}`}>
                    Description (optional)
                  </Label>
                  <TextareaWithCounter
                    id={`exp-description-${index}`}
                    rows={3}
                    maxLength={400}
                    placeholder="Additional context or details about this role..."
                    value={exp.description ?? ""}
                    onChange={(event) =>
                      handleExperienceChange(index, {
                        ...exp,
                        description: event.target.value,
                      })
                    }
                    className={cn(
                      errors[index]?.description &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                  {errors[index]?.description && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {errors[index].description}
                    </p>
                  )}
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
          );
        })}

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
