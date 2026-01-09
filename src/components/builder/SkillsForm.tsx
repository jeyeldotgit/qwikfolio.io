import type { Skill } from "@/schemas/portfolio";
import { useState } from "react";
import { FormCard } from "@/components/form/FormCard";
import { FormSection } from "@/components/form/FormSection";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Edit2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type SkillsFormProps = {
  value: Skill[];
  onChange: (value: Skill[]) => void;
  primaryStack?: string[];
  onPrimaryStackChange?: (stack: string[]) => void;
  error?: string;
  className?: string;
};

export const SkillsForm = ({
  value,
  onChange,
  primaryStack = [],
  onPrimaryStackChange,
  error,
  className,
}: SkillsFormProps) => {
  const [draftSkill, setDraftSkill] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Skill>>({});

  const handleAddSkill = () => {
    const trimmed = draftSkill.trim();
    if (!trimmed) return;
    // Create a new Skill object with defaults
    const newSkill: Skill = {
      name: trimmed,
      category: "tool", // Default category
      level: "intermediate", // Default level
    };
    onChange([...value, newSkill]);
    setDraftSkill("");
  };

  const handleRemoveSkill = (index: number) => {
    const skill = value[index];
    // Remove from primary stack if it's there
    if (onPrimaryStackChange && primaryStack.includes(skill.name)) {
      onPrimaryStackChange(primaryStack.filter((name) => name !== skill.name));
    }
    onChange(value.filter((_, idx) => idx !== index));
  };

  const handleEditSkill = (index: number) => {
    setEditingIndex(index);
    setEditForm(value[index]);
  };

  const handleSaveEdit = (index: number) => {
    if (!editForm.name || !editForm.category || !editForm.level) return;
    
    const updated = [...value];
    const oldSkill = updated[index];
    updated[index] = editForm as Skill;
    
    // Update primary stack if skill name changed
    if (onPrimaryStackChange && oldSkill.name !== editForm.name) {
      const newStack = primaryStack.map((name) =>
        name === oldSkill.name ? editForm.name! : name
      );
      onPrimaryStackChange(newStack);
    }
    
    onChange(updated);
    setEditingIndex(null);
    setEditForm({});
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm({});
  };

  const togglePrimaryStack = (skillName: string) => {
    if (!onPrimaryStackChange) return;
    if (primaryStack.includes(skillName)) {
      onPrimaryStackChange(primaryStack.filter((name) => name !== skillName));
    } else {
      onPrimaryStackChange([...primaryStack, skillName]);
    }
  };

  return (
    <FormCard
      title="Skills"
      description="Highlight the skills that show up in your work."
      className={className}
      required
    >
      <div className="space-y-6">
        <FormSection title="Add Skills" required>
          {error && (
            <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          )}
          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <div className="space-y-2">
              <Label htmlFor="skill">Skill</Label>
              <Input
                id="skill"
                placeholder="e.g., TypeScript"
                value={draftSkill}
                onChange={(event) => setDraftSkill(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddSkill();
                  }
                }}
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
          <>
            <FormSection title="Current Skills">
              <div className="space-y-3">
                {value.map((skill, index) => (
                  <div
                    key={`${skill.name}-${index}`}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-3"
                  >
                    {editingIndex === index ? (
                      // Edit mode
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor={`skill-name-${index}`}>Skill Name</Label>
                            <Input
                              id={`skill-name-${index}`}
                              value={editForm.name || ""}
                              onChange={(e) =>
                                setEditForm({ ...editForm, name: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`skill-category-${index}`}>Category</Label>
                            <select
                              id={`skill-category-${index}`}
                              value={editForm.category || "tool"}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  category: e.target.value as Skill["category"],
                                })
                              }
                              className={cn(
                                "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                              )}
                            >
                              <option value="language">Language</option>
                              <option value="framework">Framework</option>
                              <option value="tool">Tool</option>
                              <option value="soft_skill">Soft Skill</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor={`skill-level-${index}`}>Level</Label>
                            <select
                              id={`skill-level-${index}`}
                              value={editForm.level || "intermediate"}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  level: e.target.value as Skill["level"],
                                })
                              }
                              className={cn(
                                "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                              )}
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`skill-years-${index}`}>
                              Years of Experience (optional)
                            </Label>
                            <Input
                              id={`skill-years-${index}`}
                              type="number"
                              min="0"
                              step="0.5"
                              placeholder="e.g., 3.5"
                              value={editForm.yearsExperience ?? ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  yearsExperience: e.target.value
                                    ? parseFloat(e.target.value)
                                    : undefined,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleSaveEdit(index)}
                            disabled={!editForm.name || !editForm.category || !editForm.level}
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 dark:text-white">
                              {skill.name}
                            </span>
                            {primaryStack.includes(skill.name) && (
                              <Star className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="capitalize">{skill.category}</span>
                            <span>•</span>
                            <span className="capitalize">{skill.level}</span>
                            {skill.yearsExperience && (
                              <>
                                <span>•</span>
                                <span>{skill.yearsExperience} years</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {onPrimaryStackChange && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => togglePrimaryStack(skill.name)}
                              className={cn(
                                primaryStack.includes(skill.name) &&
                                  "text-emerald-600 dark:text-emerald-400"
                              )}
                            >
                              <Star
                                className={cn(
                                  "h-4 w-4",
                                  primaryStack.includes(skill.name) && "fill-current"
                                )}
                              />
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditSkill(index)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveSkill(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </FormSection>

            {onPrimaryStackChange && primaryStack.length > 0 && (
              <FormSection title="Primary Stack">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  These skills will be highlighted in your portfolio
                </p>
                <div className="flex flex-wrap gap-2">
                  {primaryStack.map((skillName) => (
                    <span
                      key={skillName}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                    >
                      <Star className="h-3 w-3 fill-current" />
                      {skillName}
                    </span>
                  ))}
                </div>
              </FormSection>
            )}
          </>
        ) : null}
      </div>
    </FormCard>
  );
};
