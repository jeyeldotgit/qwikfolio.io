import type { ThemeColors } from "./types";

export const getThemeColors = (primaryColor: string): ThemeColors => {
  const colorMap: Record<string, ThemeColors> = {
    emerald: {
      text: "text-emerald-600",
      textDark: "dark:text-emerald-400",
      bg: "bg-emerald-500",
      bgDark: "dark:bg-emerald-400",
      border: "border-emerald-500",
      borderDark: "dark:border-emerald-500",
      badge: "bg-emerald-500/10 text-emerald-600",
      badgeDark: "dark:bg-emerald-500/20 dark:text-emerald-400",
    },
    cyan: {
      text: "text-cyan-600",
      textDark: "dark:text-cyan-400",
      bg: "bg-cyan-500",
      bgDark: "dark:bg-cyan-400",
      border: "border-cyan-500",
      borderDark: "dark:border-cyan-500",
      badge: "bg-cyan-500/10 text-cyan-600",
      badgeDark: "dark:bg-cyan-500/20 dark:text-cyan-400",
    },
    violet: {
      text: "text-violet-600",
      textDark: "dark:text-violet-400",
      bg: "bg-violet-500",
      bgDark: "dark:bg-violet-400",
      border: "border-violet-500",
      borderDark: "dark:border-violet-500",
      badge: "bg-violet-500/10 text-violet-600",
      badgeDark: "dark:bg-violet-500/20 dark:text-violet-400",
    },
    amber: {
      text: "text-amber-600",
      textDark: "dark:text-amber-400",
      bg: "bg-amber-500",
      bgDark: "dark:bg-amber-400",
      border: "border-amber-500",
      borderDark: "dark:border-amber-500",
      badge: "bg-amber-500/10 text-amber-600",
      badgeDark: "dark:bg-amber-500/20 dark:text-amber-400",
    },
  };

  return colorMap[primaryColor] || colorMap.emerald;
};

export const getRadiusClasses = (radius: string): string => {
  const radiusMap: Record<string, string> = {
    none: "rounded-none",
    md: "rounded-md",
    xl: "rounded-xl",
  };
  return radiusMap[radius] || radiusMap.md;
};


