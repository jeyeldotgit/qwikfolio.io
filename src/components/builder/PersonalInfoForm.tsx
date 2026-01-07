import { useState } from "react";
import type { PersonalInfo, SocialLink } from "@/schemas/portfolio";
import { FormCard } from "@/components/form/FormCard";
import { FormSection } from "@/components/form/FormSection";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TextareaWithCounter } from "@/components/ui/textarea-with-counter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadAvatar } from "@/services/storage/avatarStorageService";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useToast } from "@/hooks/useToast";
import { X, Plus, Upload, User } from "lucide-react";

type PersonalInfoFormProps = {
  value: PersonalInfo;
  onChange: (value: PersonalInfo) => void;
  errors?: Record<string, string>;
  className?: string;
};

const SOCIAL_LINK_TYPES: Array<{ value: SocialLink["type"]; label: string }> = [
  { value: "github", label: "GitHub" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter" },
  { value: "dribbble", label: "Dribbble" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "devto", label: "Dev.to" },
  { value: "portfolio", label: "Portfolio" },
];

export const PersonalInfoForm = ({
  value,
  onChange,
  errors = {},
  className,
}: PersonalInfoFormProps) => {
  const { user } = useAuthSession();
  const { toast } = useToast();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleFieldChange = <K extends keyof PersonalInfo>(
    field: K,
    fieldValue: PersonalInfo[K]
  ) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file.",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
      });
      return;
    }

    setUploadingPhoto(true);
    try {
      const photoUrl = await uploadAvatar(user.id, file);
      if (photoUrl) {
        handleFieldChange("profilePhotoUrl", photoUrl);
        toast({
          variant: "success",
          title: "Photo uploaded",
          description: "Your profile photo has been uploaded successfully.",
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload profile photo. Please try again.",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddSocialLink = () => {
    const newLink: SocialLink = {
      type: "github",
      url: "",
    };
    handleFieldChange("socialLinks", [...(value.socialLinks || []), newLink]);
  };

  const handleRemoveSocialLink = (index: number) => {
    const updated = [...(value.socialLinks || [])];
    updated.splice(index, 1);
    handleFieldChange("socialLinks", updated);
  };

  const handleSocialLinkChange = (
    index: number,
    field: "type" | "url",
    fieldValue: string
  ) => {
    const updated = [...(value.socialLinks || [])];
    updated[index] = {
      ...updated[index],
      [field]: fieldValue,
    };
    handleFieldChange("socialLinks", updated);
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
                className={cn(errors.name && "border-red-500 focus:border-red-500 focus:ring-red-500")}
              />
              {errors.name && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors.name}
                </p>
              )}
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
                className={cn(errors.headline && "border-red-500 focus:border-red-500 focus:ring-red-500")}
              />
              {errors.headline && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors.headline}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, CA"
                value={value.location ?? ""}
                onChange={(event) =>
                  handleFieldChange("location", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleLevel">Role Level</Label>
              <select
                id="roleLevel"
                value={value.roleLevel ?? ""}
                onChange={(event) =>
                  handleFieldChange(
                    "roleLevel",
                    (event.target.value || undefined) as "junior" | "mid" | "senior" | "lead" | undefined
                  )
                }
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                <option value="">Select role level...</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid-level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </div>
          </div>
        </FormSection>

        <FormSection title="Availability">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Current Status</Label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    value="open_to_work"
                    checked={value.availability === "open_to_work"}
                    onChange={(event) =>
                      handleFieldChange(
                        "availability",
                        event.target.value as PersonalInfo["availability"]
                      )
                    }
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm">Open to Work</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    value="freelance"
                    checked={value.availability === "freelance"}
                    onChange={(event) =>
                      handleFieldChange(
                        "availability",
                        event.target.value as PersonalInfo["availability"]
                      )
                    }
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm">Available for Freelance</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    value="not_open"
                    checked={value.availability === "not_open"}
                    onChange={(event) =>
                      handleFieldChange(
                        "availability",
                        event.target.value as PersonalInfo["availability"]
                      )
                    }
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm">Not Open to Opportunities</span>
                </label>
              </div>
            </div>

            {value.availability === "open_to_work" && (
              <div className="space-y-2">
                <Label htmlFor="salaryRange">Salary Range (optional)</Label>
                <Input
                  id="salaryRange"
                  placeholder="e.g., $100k - $150k"
                  value={value.salaryRange ?? ""}
                  onChange={(event) =>
                    handleFieldChange("salaryRange", event.target.value)
                  }
                />
              </div>
            )}

            {value.availability === "freelance" && (
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate (optional)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  placeholder="e.g., 75"
                  value={value.hourlyRate ?? ""}
                  onChange={(event) =>
                    handleFieldChange(
                      "hourlyRate",
                      event.target.value
                        ? parseFloat(event.target.value)
                        : undefined
                    )
                  }
                />
              </div>
            )}
          </div>
        </FormSection>

        <FormSection title="Profile Photo">
          <div className="space-y-4">
            {value.profilePhotoUrl ? (
              <div className="flex items-center gap-4">
                <img
                  src={value.profilePhotoUrl}
                  alt="Profile"
                  className="h-20 w-20 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                />
                <div className="flex-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Current photo
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleFieldChange("profilePhotoUrl", "")}
                    className="mt-2"
                  >
                    Remove Photo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700">
                  <User className="h-10 w-10 text-slate-400" />
                </div>
                <div className="flex-1">
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      asChild
                      disabled={uploadingPhoto}
                    >
                      <span>
                        {uploadingPhoto ? (
                          <>Uploading...</>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Upload Photo
                          </>
                        )}
                      </span>
                    </Button>
                  </Label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    JPG, PNG or GIF. Max 5MB.
                  </p>
                </div>
              </div>
            )}
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
                className={cn(errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500")}
              />
              {errors.email && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              )}
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
          <div className="space-y-4">
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
                className={cn(errors.website && "border-red-500 focus:border-red-500 focus:ring-red-500")}
              />
              {errors.website && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors.website}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Social Links</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSocialLink}
                >
                  <Plus className="h-4 w-4" />
                  Add Link
                </Button>
              </div>

              {value.socialLinks && value.socialLinks.length > 0 ? (
                <div className="space-y-3">
                  {value.socialLinks.map((link, index) => (
                    <div
                      key={index}
                      className="flex gap-2 items-start"
                    >
                      <select
                        value={link.type}
                        onChange={(event) =>
                          handleSocialLinkChange(
                            index,
                            "type",
                            event.target.value
                          )
                        }
                        className={cn(
                          "flex h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                        )}
                      >
                        {SOCIAL_LINK_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <Input
                        type="url"
                        placeholder="https://..."
                        value={link.url}
                        onChange={(event) =>
                          handleSocialLinkChange(index, "url", event.target.value)
                        }
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRemoveSocialLink(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No social links added yet. Click "Add Link" to add one.
                </p>
              )}
            </div>

            {/* Legacy fields - kept for backward compatibility but hidden */}
            <div className="hidden">
              <Input
                id="github"
                type="url"
                value={value.github ?? ""}
                onChange={(event) =>
                  handleFieldChange("github", event.target.value)
                }
              />
              <Input
                id="linkedin"
                type="url"
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
