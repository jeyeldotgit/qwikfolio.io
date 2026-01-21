import type { SocialLinkType } from "./types";
import {
  Briefcase,
  Github,
  Globe,
  Linkedin,
  Twitter,
  type LucideIcon,
} from "lucide-react";

export const getSocialLinkLabel = (type: SocialLinkType): string => {
  const labelMap: Record<SocialLinkType, string> = {
    github: "GitHub",
    linkedin: "LinkedIn",
    twitter: "Twitter",
    dribbble: "Dribbble",
    instagram: "Instagram",
    facebook: "Facebook",
    devto: "Dev.to",
    portfolio: "Portfolio",
  };
  return labelMap[type] || type;
};

export const getSocialLinkIcon = (type: SocialLinkType): LucideIcon => {
  const iconMap: Record<SocialLinkType, LucideIcon> = {
    github: Github,
    linkedin: Linkedin,
    twitter: Twitter,
    dribbble: Briefcase,
    instagram: Globe,
    facebook: Globe,
    devto: Globe,
    portfolio: Globe,
  };
  return iconMap[type] || Globe;
};


