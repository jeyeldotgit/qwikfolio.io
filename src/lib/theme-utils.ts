import type { PortfolioTheme } from "@/schemas/portfolio";

/**
 * Maps theme primary colors to CSS color values
 */
const PRIMARY_COLOR_MAP: Record<
  PortfolioTheme["primaryColor"],
  { light: string; dark: string }
> = {
  emerald: {
    light: "#10b981", // emerald-500
    dark: "#34d399", // emerald-400
  },
  cyan: {
    light: "#06b6d4", // cyan-500
    dark: "#22d3ee", // cyan-400
  },
  violet: {
    light: "#8b5cf6", // violet-500
    dark: "#a78bfa", // violet-400
  },
  amber: {
    light: "#f59e0b", // amber-500
    dark: "#fbbf24", // amber-400
  },
};

/**
 * Maps accent styles to CSS values
 */
const ACCENT_STYLE_MAP: Record<
  PortfolioTheme["accentStyle"],
  { opacity: string; saturation: string }
> = {
  soft: { opacity: "0.1", saturation: "100%" },
  vibrant: { opacity: "1", saturation: "120%" },
  mono: { opacity: "0.05", saturation: "0%" },
};

/**
 * Maps radius values to CSS border-radius values
 */
const RADIUS_MAP: Record<PortfolioTheme["radius"], string> = {
  none: "0",
  md: "0.5rem",
  xl: "1rem",
};

/**
 * Converts hex color to RGB values
 */
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "10, 185, 129"; // fallback to emerald
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
};

/**
 * Gets CSS variables for a given theme
 */
export const getThemeCSSVariables = (
  theme: PortfolioTheme
): Record<string, string> => {
  const primaryColor = PRIMARY_COLOR_MAP[theme.primaryColor];
  const accentStyle = ACCENT_STYLE_MAP[theme.accentStyle];

  return {
    "--portfolio-primary": primaryColor.light,
    "--portfolio-primary-dark": primaryColor.dark,
    "--portfolio-primary-rgb": hexToRgb(primaryColor.light),
    "--portfolio-accent-opacity": accentStyle.opacity,
    "--portfolio-accent-saturation": accentStyle.saturation,
    "--portfolio-radius": RADIUS_MAP[theme.radius],
    "--portfolio-layout": theme.layout,
  };
};

/**
 * Applies theme CSS variables to the document root
 */
export const applyTheme = (theme: PortfolioTheme): void => {
  const variables = getThemeCSSVariables(theme);
  const root = document.documentElement;

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Set data attribute for theme-specific styling
  root.setAttribute("data-theme", theme.id);
  root.setAttribute("data-layout", theme.layout);
};

/**
 * Removes theme CSS variables from the document root
 */
export const removeTheme = (): void => {
  const root = document.documentElement;
  const themeVariables = [
    "--portfolio-primary",
    "--portfolio-primary-dark",
    "--portfolio-primary-rgb",
    "--portfolio-accent-opacity",
    "--portfolio-accent-saturation",
    "--portfolio-radius",
    "--portfolio-layout",
  ];

  themeVariables.forEach((variable) => {
    root.style.removeProperty(variable);
  });

  root.removeAttribute("data-theme");
  root.removeAttribute("data-layout");
};

