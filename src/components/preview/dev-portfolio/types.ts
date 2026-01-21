import type { Portfolio, SocialLink } from "@/schemas/portfolio";

export type DevPortfolioProps = {
  portfolio: Portfolio;
  avatar: string;
  onDownloadResume?: () => void | Promise<void>;
};

export type ThemeColors = {
  text: string;
  textDark: string;
  bg: string;
  bgDark: string;
  border: string;
  borderDark: string;
  badge: string;
  badgeDark: string;
};

export type SocialLinkType = SocialLink["type"];


