import type { Education } from "@/schemas/portfolio";
import { FormCard } from "@/components/form/FormCard";
import { FormSection } from "@/components/form/FormSection";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TextareaWithCounter } from "@/components/ui/textarea-with-counter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EducationFormProps = {
  value: Education[];
  onChange: (value: Education[]) => void;
  errors?: Record<number, Record<string, string>>;
  className?: string;
};

export const EducationForm = ({
  value,
  onChange,
  errors = {},
  className,
}: EducationFormProps) => {
  const handleEducationChange = (index: number, updated: Education) => {
    onChange(value.map((edu, idx) => (idx === index ? updated : edu)));
  };

  const handleRemoveEducation = (index: number) => {
    onChange(value.filter((_, idx) => idx !== index));
  };

  const handleAddEducation = () => {
    onChange([
      ...value,
      {
        id: undefined,
        school: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
    ]);
  };

  return (
    <FormCard
      title="Education"
      description="Add the education that supports your story."
      className={className}
    >
      <div className="space-y-6">
        {value.map((edu, index) => (
          <FormSection key={edu.id ?? index} title={`Education ${index + 1}`}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`edu-school-${index}`} required>
                    School
                  </Label>
                  <Input
                    id={`edu-school-${index}`}
                    placeholder="e.g., State University"
                    value={edu.school}
                    onChange={(event) =>
                      handleEducationChange(index, {
                        ...edu,
                        school: event.target.value,
                      })
                    }
                    className={cn(errors[index]?.school && "border-red-500 focus:border-red-500 focus:ring-red-500")}
                  />
                  {errors[index]?.school && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {errors[index].school}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edu-degree-${index}`} required>
                    Degree
                  </Label>
                  <Input
                    id={`edu-degree-${index}`}
                    placeholder="e.g., BSc Computer Science"
                    value={edu.degree}
                    onChange={(event) =>
                      handleEducationChange(index, {
                        ...edu,
                        degree: event.target.value,
                      })
                    }
                    className={cn(errors[index]?.degree && "border-red-500 focus:border-red-500 focus:ring-red-500")}
                  />
                  {errors[index]?.degree && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {errors[index].degree}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`edu-field-${index}`} required>
                  Field of Study
                </Label>
                <Input
                  id={`edu-field-${index}`}
                  placeholder="e.g., Software Engineering"
                  value={edu.field}
                  onChange={(event) =>
                    handleEducationChange(index, {
                      ...edu,
                      field: event.target.value,
                    })
                  }
                  className={cn(errors[index]?.field && "border-red-500 focus:border-red-500 focus:ring-red-500")}
                />
                {errors[index]?.field && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors[index].field}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`edu-start-${index}`} required>
                    Start Date
                  </Label>
                  <Input
                    id={`edu-start-${index}`}
                    placeholder="2016-09"
                    value={edu.startDate}
                    onChange={(event) =>
                      handleEducationChange(index, {
                        ...edu,
                        startDate: event.target.value,
                      })
                    }
                    className={cn(errors[index]?.startDate && "border-red-500 focus:border-red-500 focus:ring-red-500")}
                  />
                  {errors[index]?.startDate && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {errors[index].startDate}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edu-end-${index}`}>End Date</Label>
                  <Input
                    id={`edu-end-${index}`}
                    placeholder="2020-06"
                    value={edu.endDate ?? ""}
                    disabled={edu.current}
                    onChange={(event) =>
                      handleEducationChange(index, {
                        ...edu,
                        endDate: event.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id={`edu-current-${index}`}
                  type="checkbox"
                  className="h-4 w-4 rounded border border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700"
                  checked={edu.current}
                  onChange={(event) =>
                    handleEducationChange(index, {
                      ...edu,
                      current: event.target.checked,
                      endDate: event.target.checked ? "" : edu.endDate,
                    })
                  }
                />
                <Label
                  htmlFor={`edu-current-${index}`}
                  className="text-sm font-normal text-slate-600 dark:text-slate-400"
                >
                  I&apos;m currently studying here
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`edu-description-${index}`}>
                  Description (optional)
                </Label>
                <TextareaWithCounter
                  id={`edu-description-${index}`}
                  rows={3}
                  maxLength={300}
                  placeholder="Any achievements, focus areas, or relevant details."
                  value={edu.description ?? ""}
                  onChange={(event) =>
                    handleEducationChange(index, {
                      ...edu,
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
                  onClick={() => handleRemoveEducation(index)}
                >
                  Remove education
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
            onClick={handleAddEducation}
          >
            Add another school
          </Button>
        </div>
      </div>
    </FormCard>
  );
};
