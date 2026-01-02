import type { PersonalInfo } from "@/schemas/portfolio";
import { FormCard } from "@/components/form/FormCard";
import { FormSection } from "@/components/form/FormSection";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TextareaWithCounter } from "@/components/ui/textarea-with-counter";

type PersonalInfoFormProps = {
  value: PersonalInfo;
  onChange: (value: PersonalInfo) => void;
  className?: string;
};

export const PersonalInfoForm = ({
  value,
  onChange,
  className,
}: PersonalInfoFormProps) => {
  const handleFieldChange = <K extends keyof PersonalInfo>(
    field: K,
    fieldValue: PersonalInfo[K]
  ) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <FormCard
      title="Personal Information"
      description="Tell us about yourself"
      className={className}
    >
      <div className="space-y-6">
        <FormSection title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" required>
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={value.name}
                onChange={(event) =>
                  handleFieldChange("name", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headline" required>
                Headline
              </Label>
              <Input
                id="headline"
                placeholder="e.g., Senior Software Engineer"
                value={value.headline}
                onChange={(event) =>
                  handleFieldChange("headline", event.target.value)
                }
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Contact Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" required>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={value.email}
                onChange={(event) =>
                  handleFieldChange("email", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={value.phone ?? ""}
                onChange={(event) =>
                  handleFieldChange("phone", event.target.value)
                }
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Bio">
          <div className="space-y-2">
            <Label htmlFor="bio">About You</Label>
            <TextareaWithCounter
              id="bio"
              placeholder="Tell us about yourself. Highlight your passion, expertise, and what makes you unique..."
              rows={4}
              maxLength={500}
              value={value.bio ?? ""}
              onChange={(event) => handleFieldChange("bio", event.target.value)}
            />
          </div>
        </FormSection>

        <FormSection title="Links">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website (optional)</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://your-site.com"
                value={value.website ?? ""}
                onChange={(event) =>
                  handleFieldChange("website", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub (optional)</Label>
              <Input
                id="github"
                type="url"
                placeholder="https://github.com/username"
                value={value.github ?? ""}
                onChange={(event) =>
                  handleFieldChange("github", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn (optional)</Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={value.linkedin ?? ""}
                onChange={(event) =>
                  handleFieldChange("linkedin", event.target.value)
                }
              />
            </div>
          </div>
        </FormSection>
      </div>
    </FormCard>
  );
};
