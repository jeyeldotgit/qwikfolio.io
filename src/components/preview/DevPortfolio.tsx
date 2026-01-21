import { useEffect, useMemo } from "react";
import { applyTheme } from "@/lib/theme-utils";
import {
  trackProjectView,
  trackSocialLinkClick,
} from "@/services/analytics/analyticsService";
import type { DevPortfolioProps } from "./dev-portfolio/types";
import { getRadiusClasses, getThemeColors } from "./dev-portfolio/theme";
import { DevPortfolioBackground } from "./dev-portfolio/Background";
import { DevPortfolioTopHeader } from "./dev-portfolio/TopHeader";
import { DevPortfolioHero } from "./dev-portfolio/Hero";
import { DevPortfolioSkillsSection } from "./dev-portfolio/SkillsSection";
import { DevPortfolioProjectsSection } from "./dev-portfolio/ProjectsSection";
import { DevPortfolioExperienceSection } from "./dev-portfolio/ExperienceSection";
import { DevPortfolioEducationSection } from "./dev-portfolio/EducationSection";
import { DevPortfolioCertificationsSection } from "./dev-portfolio/CertificationsSection";
import { DevPortfolioFooter } from "./dev-portfolio/Footer";

export const DevPortfolio = ({ portfolio, avatar, onDownloadResume }: DevPortfolioProps) => {
  const { personalInfo, skills, experience, education, certifications, primaryStack, theme, settings } =
    portfolio;
  const slug = settings?.slug || null;

  useEffect(() => {
    applyTheme(theme);
    return () => {
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.removeAttribute("data-layout");
    };
  }, [theme]);

  const themeColors = useMemo(() => getThemeColors(theme.primaryColor), [theme.primaryColor]);
  const radiusClasses = useMemo(() => getRadiusClasses(theme.radius), [theme.radius]);

  const skillsByCategory = useMemo(() => {
    return skills.reduce((acc, skill) => {
      const category = skill.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    }, {} as Record<string, typeof skills>);
  }, [skills]);

  const availabilityBadge = useMemo(() => {
    if (!personalInfo.availability) return null;
    const badges = {
      open_to_work: {
        text: "Open to Work",
        className: `${themeColors.badge} ${themeColors.badgeDark}`,
      },
      freelance: {
        text: "Available for Freelance",
        className:
          "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
      },
      not_open: {
        text: "Not Open to Opportunities",
        className: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
      },
    } as const;

    return badges[personalInfo.availability] ?? null;
  }, [personalInfo.availability, themeColors.badge, themeColors.badgeDark]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 print:hidden">
      <DevPortfolioBackground />
      <DevPortfolioTopHeader onDownloadResume={onDownloadResume} />

      <DevPortfolioHero
        portfolio={portfolio}
        avatar={avatar}
        radiusClasses={radiusClasses}
        themeColors={{ text: themeColors.text, textDark: themeColors.textDark }}
        slug={slug}
        availabilityBadge={availabilityBadge}
        onSocialClick={(type) => {
          if (!slug) return;
          trackSocialLinkClick(slug, type as any);
        }}
      />

      <DevPortfolioSkillsSection
        skills={skills}
        primaryStack={primaryStack}
        skillsByCategory={skillsByCategory}
        radiusClasses={radiusClasses}
      />

      <DevPortfolioProjectsSection
        slug={slug}
        radiusClasses={radiusClasses}
        themeBorderClass={themeColors.border}
        projects={portfolio.projects}
        onProjectView={(projectId) => {
          if (!slug) return;
          trackProjectView(slug, projectId);
        }}
      />

      <DevPortfolioExperienceSection experience={experience} />
      <DevPortfolioEducationSection education={education} radiusClasses={radiusClasses} />
      <DevPortfolioCertificationsSection
        certifications={certifications}
        radiusClasses={radiusClasses}
      />
      <DevPortfolioFooter />
    </div>
  );
};


