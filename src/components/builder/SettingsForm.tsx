import type { PortfolioSettings } from "@/schemas/portfolio";
import { FormCard } from "@/components/form/FormCard";
import { FormSection } from "@/components/form/FormSection";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TextareaWithCounter } from "@/components/ui/textarea-with-counter";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Mail } from "lucide-react";

type SettingsFormProps = {
  value: PortfolioSettings;
  onChange: (value: PortfolioSettings) => void;
  errors?: Record<string, string>;
  className?: string;
};

export const SettingsForm = ({
  value,
  onChange,
  errors = {},
  className,
}: SettingsFormProps) => {
  const handleChange = (updates: Partial<PortfolioSettings>) => {
    onChange({ ...value, ...updates });
  };

  return (
    <FormCard
      title="Portfolio Settings"
      description="Configure your portfolio's visibility, SEO, and contact options."
      className={className}
    >
      <div className="space-y-6">
        {/* Slug */}
        <FormSection title="Portfolio URL">
          <div className="space-y-2">
            <Label htmlFor="settings-slug">Custom URL (optional)</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                qwikfolio.io/
              </span>
              <Input
                id="settings-slug"
                placeholder="your-portfolio-slug"
                value={value.slug ?? ""}
                onChange={(event) =>
                  handleChange({ slug: event.target.value || undefined })
                }
                className={cn(
                  "flex-1",
                  errors.slug &&
                    "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
            </div>
            {errors.slug && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.slug}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Use only lowercase letters, numbers, and hyphens. Leave empty to
              use your username.
            </p>
          </div>
        </FormSection>

        {/* Visibility */}
        <FormSection title="Visibility">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                {value.isPublic ? (
                  <Eye className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <EyeOff className="h-5 w-5 text-slate-400" />
                )}
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {value.isPublic ? "Published" : "Draft"}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {value.isPublic
                      ? "Your portfolio is visible to everyone"
                      : "Your portfolio is private"}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={value.isPublic}
                  onChange={(event) =>
                    handleChange({ isPublic: event.target.checked })
                  }
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-300 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-emerald-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/20 dark:bg-slate-700 dark:after:border-slate-600 dark:peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </FormSection>

        {/* SEO */}
        <FormSection title="SEO Settings">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="settings-seo-title">SEO Title (optional)</Label>
              <Input
                id="settings-seo-title"
                placeholder="e.g., John Doe - Full Stack Developer"
                value={value.seoTitle ?? ""}
                onChange={(event) =>
                  handleChange({ seoTitle: event.target.value || undefined })
                }
                className={cn(
                  errors.seoTitle &&
                    "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.seoTitle && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors.seoTitle}
                </p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Appears in search engine results and browser tabs
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-seo-description">
                SEO Description (optional)
              </Label>
              <TextareaWithCounter
                id="settings-seo-description"
                rows={3}
                maxLength={160}
                placeholder="A brief description of your portfolio for search engines..."
                value={value.seoDescription ?? ""}
                onChange={(event) =>
                  handleChange({
                    seoDescription: event.target.value || undefined,
                  })
                }
                className={cn(
                  errors.seoDescription &&
                    "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.seoDescription && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors.seoDescription}
                </p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Recommended: 150-160 characters
              </p>
            </div>
          </div>
        </FormSection>

        {/* Contact */}
        <FormSection title="Contact Form">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Show Contact Form
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Allow visitors to contact you via form
                  </p>
                </div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={value.showContactForm}
                  onChange={(event) =>
                    handleChange({ showContactForm: event.target.checked })
                  }
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-300 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-emerald-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/20 dark:bg-slate-700 dark:after:border-slate-600 dark:peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            {value.showContactForm && (
              <div className="space-y-2">
                <Label htmlFor="settings-contact-email">
                  Contact Email (optional)
                </Label>
                <Input
                  id="settings-contact-email"
                  type="email"
                  placeholder="contact@example.com"
                  value={value.contactEmail ?? ""}
                  onChange={(event) =>
                    handleChange({
                      contactEmail: event.target.value || undefined,
                    })
                  }
                  className={cn(
                    errors.contactEmail &&
                      "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                />
                {errors.contactEmail && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.contactEmail}
                  </p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Override default email. Leave empty to use your account email.
                </p>
              </div>
            )}
          </div>
        </FormSection>
      </div>
    </FormCard>
  );
};
