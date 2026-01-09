import type { PortfolioTheme } from "@/schemas/portfolio";
import { FormCard } from "@/components/form/FormCard";
import { FormSection } from "@/components/form/FormSection";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Palette, Image } from "lucide-react";

type ThemeSettingsFormProps = {
  value: PortfolioTheme;
  onChange: (value: PortfolioTheme) => void;
  errors?: Record<string, string>;
  className?: string;
};

const THEME_PRESETS: Array<{
  id: PortfolioTheme["id"];
  name: string;
  primaryColor: PortfolioTheme["primaryColor"];
  description: string;
  preview: { bg: string; accent: string };
}> = [
  {
    id: "emerald",
    name: "Emerald",
    primaryColor: "emerald",
    description: "Fresh and modern",
    preview: { bg: "bg-emerald-50", accent: "bg-emerald-600" },
  },
  {
    id: "ocean",
    name: "Ocean",
    primaryColor: "cyan",
    description: "Calm and professional",
    preview: { bg: "bg-cyan-50", accent: "bg-cyan-600" },
  },
  {
    id: "violet",
    name: "Violet",
    primaryColor: "violet",
    description: "Creative and bold",
    preview: { bg: "bg-violet-50", accent: "bg-violet-600" },
  },
  {
    id: "default",
    name: "Default",
    primaryColor: "emerald",
    description: "Classic and clean",
    preview: { bg: "bg-slate-50", accent: "bg-slate-600" },
  },
];

export const ThemeSettingsForm = ({
  value,
  onChange,
  errors: _errors = {},
  className,
}: ThemeSettingsFormProps) => {
  const handleChange = (updates: Partial<PortfolioTheme>) => {
    onChange({ ...value, ...updates });
  };

  const handlePresetSelect = (preset: (typeof THEME_PRESETS)[0]) => {
    onChange({
      ...value,
      id: preset.id,
      primaryColor: preset.primaryColor,
    });
  };

  return (
    <FormCard
      title="Theme & Appearance"
      description="Customize the look and feel of your portfolio."
      className={className}
    >
      <div className="space-y-6">
        {/* Theme Presets */}
        <FormSection title="Theme Presets">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={cn(
                  "group relative overflow-hidden rounded-lg border-2 p-4 text-left transition-all",
                  value.id === preset.id
                    ? "border-emerald-500 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/20"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/30 dark:hover:border-slate-700"
                )}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className={cn("h-8 w-8 rounded-md", preset.preview.accent)}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {preset.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {preset.description}
                    </p>
                  </div>
                </div>
                {value.id === preset.id && (
                  <div className="absolute right-2 top-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </FormSection>

        {/* Customization */}
        <FormSection title="Customization">
          <div className="space-y-6">
            {/* Primary Color */}
            <div className="space-y-2">
              <Label className="flex  items-center gap-2">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <span>Primary Color</span>
                </div>
              </Label>
              <div className="grid grid-cols-4 gap-3">
                {(["emerald", "cyan", "violet", "amber"] as const).map(
                  (color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleChange({ primaryColor: color })}
                      className={cn(
                        "group relative h-12 rounded-lg border-2 transition-all",
                        value.primaryColor === color
                          ? "border-slate-900 dark:border-white"
                          : "border-slate-200 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-600"
                      )}
                    >
                      <div
                        className={cn(
                          "h-full w-full rounded-md",
                          color === "emerald" && "bg-emerald-600",
                          color === "cyan" && "bg-cyan-600",
                          color === "violet" && "bg-violet-600",
                          color === "amber" && "bg-amber-600"
                        )}
                      />
                      {value.primaryColor === color && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-white" />
                        </div>
                      )}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Accent Style */}
            <div className="space-y-2">
              <Label>Accent Style</Label>
              <div className="grid grid-cols-3 gap-3">
                {(["soft", "vibrant", "mono"] as const).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => handleChange({ accentStyle: style })}
                    className={cn(
                      "rounded-lg border-2 p-3 text-sm font-medium transition-all",
                      value.accentStyle === style
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-400"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Border Radius */}
            <div className="space-y-2">
              <Label>Border Radius</Label>
              <div className="grid grid-cols-3 gap-3">
                {(["none", "md", "xl"] as const).map((radius) => (
                  <button
                    key={radius}
                    type="button"
                    onClick={() => handleChange({ radius })}
                    className={cn(
                      "rounded-lg border-2 p-3 text-sm font-medium transition-all",
                      value.radius === radius
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-400"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    {radius === "none" && "None"}
                    {radius === "md" && "Medium"}
                    {radius === "xl" && "Rounded"}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout */}
            {/* <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Layout
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {(["sidebar-left", "sidebar-top", "one-column"] as const).map(
                  (layout) => (
                    <button
                      key={layout}
                      type="button"
                      onClick={() => handleChange({ layout })}
                      className={cn(
                        "group relative overflow-hidden rounded-lg border-2 p-4 transition-all",
                        value.layout === layout
                          ? "border-emerald-500 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/20"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/30 dark:hover:border-slate-700"
                      )}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {layout === "sidebar-left" && (
                          <>
                            <div className="h-8 w-2 rounded bg-emerald-600 dark:bg-emerald-400" />
                            <div className="h-8 w-6 rounded bg-slate-300 dark:bg-slate-700" />
                          </>
                        )}
                        {layout === "sidebar-top" && (
                          <div className="space-y-1">
                            <div className="h-2 w-8 rounded bg-emerald-600 dark:bg-emerald-400" />
                            <div className="h-6 w-8 rounded bg-slate-300 dark:bg-slate-700" />
                          </div>
                        )}
                        {layout === "one-column" && (
                          <div className="h-8 w-8 rounded bg-slate-300 dark:bg-slate-700" />
                        )}
                      </div>
                      <p className="mt-2 text-center text-xs font-medium text-slate-700 dark:text-slate-300">
                        {layout === "sidebar-left" && "Sidebar Left"}
                        {layout === "sidebar-top" && "Sidebar Top"}
                        {layout === "one-column" && "One Column"}
                      </p>
                    </button>
                  )
                )}
              </div>
            </div> */}

            {/* Show Profile Photo */}
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <Image className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Show Profile Photo
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Display your profile photo in the portfolio
                  </p>
                </div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={value.showProfilePhoto}
                  onChange={(event) =>
                    handleChange({ showProfilePhoto: event.target.checked })
                  }
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-300 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-emerald-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/20 dark:bg-slate-700 dark:after:border-slate-600 dark:peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </FormSection>
      </div>
    </FormCard>
  );
};
