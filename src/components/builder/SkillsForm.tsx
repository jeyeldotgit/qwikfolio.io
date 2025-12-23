import type { Skill } from "@/schemas/portfolio";
import { useState } from "react";
import { FormCard } from "@/components/form/FormCard";
import { FormSection } from "@/components/form/FormSection";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SkillsFormProps = {
  value: Skill[];
  onChange: (value: Skill[]) => void;
  className?: string;
};

export const SkillsForm = ({ value, onChange, className }: SkillsFormProps) => {
  const [draftSkill, setDraftSkill] = useState("");

  const handleAddSkill = () => {
    const trimmed = draftSkill.trim();
    if (!trimmed) return;
    onChange([...value, trimmed]);
    setDraftSkill("");
  };

  const handleRemoveSkill = (index: number) => {
    onChange(value.filter((_, idx) => idx !== index));
  };

  return (
    <FormCard
      title="Skills"
      description="Highlight the skills that show up in your work."
      className={className}
    >
      <div className="space-y-6">
        <FormSection title="Add Skills">
          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <div className="space-y-2">
              <Label htmlFor="skill">Skill</Label>
              <Input
                id="skill"
                placeholder="e.g., TypeScript"
                value={draftSkill}
                onChange={(event) => setDraftSkill(event.target.value)}
              />
            </div>
            <Button
              type="button"
              size="sm"
              className="mt-5"
              onClick={handleAddSkill}
            >
              Add
            </Button>
          </div>
        </FormSection>

        {value.length > 0 ? (
          <FormSection title="Current Skills">
            <div className="flex flex-wrap gap-2">
              {value.map((skill, index) => (
                <button
                  key={`${skill}-${index}`}
                  type="button"
                  onClick={() => handleRemoveSkill(index)}
                  className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                  <span>{skill}</span>
                  <span className="ml-1 text-slate-500 dark:text-slate-400">
                    ×
                  </span>
                </button>
              ))}
            </div>
          </FormSection>
        ) : null}
      </div>
    </FormCard>
  );
};
