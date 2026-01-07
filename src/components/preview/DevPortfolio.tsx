import { useEffect, useMemo } from "react";
import type { Portfolio, SocialLink } from "@/schemas/portfolio";
import {
  Github,
  Linkedin,
  Globe,
  Mail,
  ExternalLink,
  Twitter,
  Briefcase,
  MapPin,
  Star,
  Video,
  Award,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { applyTheme } from "@/lib/theme-utils";
import {
  trackSocialLinkClick,
  trackProjectView,
} from "@/services/analytics/analyticsService";

type DevPortfolioProps = {
  portfolio: Portfolio;
  avatar: string;
};

const SocialLinkIcon = ({ type }: { type: SocialLink["type"] }) => {
  const iconMap = {
    github: Github,
    linkedin: Linkedin,
    twitter: Twitter,
    dribbble: Briefcase,
    instagram: Globe,
    facebook: Globe,
    devto: Globe,
    portfolio: Globe,
  };
  const Icon = iconMap[type] || Globe;
  return <Icon className="h-4 w-4" />;
};

const SocialLink = ({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Github;
  label: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="group flex items-center gap-2 text-slate-500 dark:text-slate-400 transition-colors duration-300 hover:[color:var(--portfolio-primary)] dark:hover:[color:var(--portfolio-primary-dark)]"
    aria-label={label}
  >
    <Icon className="h-4 w-4" />
    <span className="text-sm font-medium">{label}</span>
  </a>
);

const getSocialLinkLabel = (type: SocialLink["type"]): string => {
  const labelMap: Record<SocialLink["type"], string> = {
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

export const DevPortfolio = ({ portfolio, avatar }: DevPortfolioProps) => {
  const {
    personalInfo,
    skills,
    projects,
    experience,
    education,
    certifications,
    primaryStack,
    theme,
    settings,
  } = portfolio;
  const slug = settings?.slug || null;

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
    return () => {
      // Cleanup: remove theme when component unmounts
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.removeAttribute("data-layout");
    };
  }, [theme]);

  // Get theme color classes based on primary color
  const themeColors = useMemo(() => {
    const colorMap: Record<
      string,
      {
        text: string;
        textDark: string;
        bg: string;
        bgDark: string;
        border: string;
        borderDark: string;
        badge: string;
        badgeDark: string;
      }
    > = {
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
    return colorMap[theme.primaryColor] || colorMap.emerald;
  }, [theme.primaryColor]);

  // Get radius classes based on theme
  const radiusClasses = useMemo(() => {
    const radiusMap: Record<string, string> = {
      none: "rounded-none",
      md: "rounded-md",
      xl: "rounded-xl",
    };
    return radiusMap[theme.radius] || radiusMap.md;
  }, [theme.radius]);

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    const category = skill.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  // Sort projects by order, then by featured
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return (a.order || 0) - (b.order || 0);
  });

  // Use profilePhotoUrl if available, otherwise fall back to avatar prop
  const profilePhoto = personalInfo.profilePhotoUrl || avatar;

  // Build headline with role level if available
  const headlineWithRole = personalInfo.roleLevel
    ? `${
        personalInfo.roleLevel.charAt(0).toUpperCase() +
        personalInfo.roleLevel.slice(1)
      } ${personalInfo.headline}`
    : personalInfo.headline;

  // Get availability badge text
  const getAvailabilityBadge = () => {
    if (!personalInfo.availability) return null;
    const badges = {
      open_to_work: {
        text: "Open to Work",
        class: `${themeColors.badge} ${themeColors.badgeDark}`,
      },
      freelance: {
        text: "Available for Freelance",
        class:
          "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
      },
      not_open: {
        text: "Not Open to Opportunities",
        class: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
      },
    };
    return badges[personalInfo.availability];
  };

  const availabilityBadge = getAvailabilityBadge();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 print:hidden">
      {/* Geometric Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Light mode background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] dark:bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)]" />
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-cyan-500/5 blur-3xl dark:bg-cyan-500/10" />
      </div>

      {/* Hero Section */}
      <header className="relative border-b border-slate-200 dark:border-slate-800/50">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-6">
              {/* Mobile Avatar - shown on smaller screens */}
              <div className="flex items-center gap-4 lg:hidden">
                <div className="relative h-20 w-20 shrink-0 sm:h-24 sm:w-24">
                  <div
                    className="absolute inset-0 rounded-xl opacity-10 blur-lg dark:opacity-20"
                    style={{
                      background: `linear-gradient(to bottom right, var(--portfolio-primary), var(--portfolio-primary-dark))`,
                    }}
                  />
                  <div
                    className={cn(
                      "relative h-full w-full overflow-hidden border border-slate-200 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80",
                      radiusClasses
                    )}
                  >
                    <Avatar className="h-full w-full">
                      <AvatarImage
                        src={profilePhoto}
                        className="h-full w-full object-cover"
                      />
                      <AvatarFallback
                        className={cn(
                          "flex h-full w-full items-center justify-center text-3xl font-bold",
                          themeColors.text,
                          themeColors.textDark
                        )}
                      >
                        {(personalInfo.name || "U")[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <div>
                  <p
                    className={cn(
                      "font-mono text-xs tracking-wider",
                      themeColors.text,
                      themeColors.textDark
                    )}
                  >
                    {"<hello world />"}
                  </p>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-transparent dark:from-white dark:via-slate-200 dark:to-slate-400">
                      {personalInfo.name || "Your Name"}
                    </span>
                  </h1>
                </div>
              </div>

              {/* Desktop Name - hidden on mobile (shown in mobile avatar section) */}
              <div className="hidden space-y-2 lg:block">
                <p
                  className={cn(
                    "font-mono text-sm tracking-wider",
                    themeColors.text,
                    themeColors.textDark
                  )}
                >
                  {"<hello world />"}
                </p>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-transparent dark:from-white dark:via-slate-200 dark:to-slate-400">
                    {personalInfo.name || "Your Name"}
                  </span>
                </h1>
              </div>

              {/* Headline with role level - always visible */}
              <div className="space-y-2 lg:mt-0 -mt-4">
                <p className="text-xl font-medium text-slate-600 dark:text-slate-300 sm:text-2xl">
                  {headlineWithRole || "Developer"}
                </p>
                {personalInfo.location && (
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <MapPin className="h-4 w-4" />
                    <span>{personalInfo.location}</span>
                  </div>
                )}
                {availabilityBadge && (
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${availabilityBadge.class}`}
                  >
                    {availabilityBadge.text}
                  </span>
                )}
              </div>

              {/* Bio */}
              {personalInfo.bio && (
                <p className="max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                  {personalInfo.bio}
                </p>
              )}

              {/* Social Links */}
              <div className="flex flex-wrap gap-6 pt-2">
                {personalInfo.email && (
                  <SocialLink
                    href={`mailto:${personalInfo.email}`}
                    icon={Mail}
                    label="Email"
                  />
                )}
                {personalInfo.website && (
                  <SocialLink
                    href={personalInfo.website}
                    icon={Globe}
                    label="Website"
                  />
                )}
                {/* New socialLinks array */}
                {personalInfo.socialLinks &&
                  personalInfo.socialLinks.length > 0 &&
                  personalInfo.socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-2 text-slate-500 dark:text-slate-400 transition-colors duration-300 hover:[color:var(--portfolio-primary)] dark:hover:[color:var(--portfolio-primary-dark)]"
                      aria-label={getSocialLinkLabel(link.type)}
                      onClick={() => {
                        if (slug) {
                          trackSocialLinkClick(slug, link.type);
                        }
                      }}
                    >
                      <SocialLinkIcon type={link.type} />
                      <span className="text-sm font-medium">
                        {getSocialLinkLabel(link.type)}
                      </span>
                    </a>
                  ))}
                {/* Legacy github/linkedin for backward compatibility */}
                {(!personalInfo.socialLinks ||
                  personalInfo.socialLinks.length === 0) && (
                  <>
                    {personalInfo.github && (
                      <SocialLink
                        href={personalInfo.github}
                        icon={Github}
                        label="GitHub"
                      />
                    )}
                    {personalInfo.linkedin && (
                      <SocialLink
                        href={personalInfo.linkedin}
                        icon={Linkedin}
                        label="LinkedIn"
                      />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Avatar/Decoration - Desktop only */}
            {portfolio.theme?.showProfilePhoto !== false && (
              <div className="hidden lg:block">
                <div className="relative h-48 w-48">
                  <div
                    className="absolute inset-0 opacity-10 blur-xl dark:opacity-20"
                    style={{
                      borderRadius: "var(--portfolio-radius)",
                      background: `linear-gradient(to bottom right, var(--portfolio-primary), var(--portfolio-primary-dark))`,
                    }}
                  />
                  <div
                    className={cn(
                      "relative h-full w-full overflow-hidden border border-slate-200 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80",
                      radiusClasses
                    )}
                  >
                    <Avatar className="h-full w-full">
                      <AvatarImage
                        src={profilePhoto}
                        className="h-full w-full object-cover"
                      />
                      <AvatarFallback
                        className={cn(
                          "flex h-full w-full items-center justify-center text-6xl font-bold",
                          themeColors.text,
                          themeColors.textDark
                        )}
                      >
                        {(personalInfo.name || "U")[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Skills Section */}
      <section className="border-b border-slate-200 py-16 dark:border-slate-800/50">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-8 font-mono text-sm tracking-wider text-slate-400 dark:text-slate-500">
            {"// tech_stack"}
          </h2>

          {/* Primary Stack */}
          {primaryStack && primaryStack.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Primary Stack
              </h3>
              <div className="flex flex-wrap gap-3">
                {primaryStack.map((skillName) => {
                  const skill = skills.find((s) => s.name === skillName);
                  if (!skill) return null;
                  return (
                    <span
                      key={skill.name}
                      className={cn(
                        "group relative overflow-hidden border-2 px-4 py-2 text-sm font-medium transition-all duration-300",
                        radiusClasses
                      )}
                      style={{
                        borderColor: `var(--portfolio-primary)`,
                        borderWidth: "2px",
                        borderStyle: "solid",
                        backgroundColor: `rgba(var(--portfolio-primary-rgb), 0.05)`,
                        color: `var(--portfolio-primary)`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderOpacity = "1";
                        e.currentTarget.style.backgroundColor = `rgba(var(--portfolio-primary-rgb), 0.1)`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderOpacity = "0.5";
                        e.currentTarget.style.backgroundColor = `rgba(var(--portfolio-primary-rgb), 0.05)`;
                      }}
                    >
                      <span className="relative z-10 flex items-center gap-1.5">
                        <Star
                          className="h-3.5 w-3.5"
                          style={{
                            fill: "var(--portfolio-primary)",
                            color: "var(--portfolio-primary)",
                          }}
                        />
                        {skill.name}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Skills by Category */}
          {Object.entries(skillsByCategory).map(
            ([category, categorySkills]) => (
              <div key={category} className="mb-6 last:mb-0">
                <h3 className="mb-3 text-sm font-semibold capitalize text-slate-700 dark:text-slate-300">
                  {category.replace("_", " ")}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {categorySkills.map((skill, idx) => {
                    const isPrimary = primaryStack?.includes(skill.name);
                    return (
                      <span
                        key={skill.name}
                        className={cn(
                          "group relative overflow-hidden rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-300",
                          isPrimary
                            ? cn(
                                radiusClasses,
                                "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/50"
                              )
                            : cn(
                                radiusClasses,
                                "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300"
                              )
                        )}
                        style={{
                          ...(isPrimary
                            ? {
                                borderColor: `var(--portfolio-primary)`,
                                borderWidth: "1px",
                                borderStyle: "solid",
                                borderOpacity: 0.5,
                                backgroundColor: `rgba(var(--portfolio-primary-rgb), 0.05)`,
                                color: `var(--portfolio-primary)`,
                              }
                            : {}),
                          animationDelay: `${idx * 50}ms`,
                        }}
                        onMouseEnter={
                          isPrimary
                            ? (e) => {
                                e.currentTarget.style.borderOpacity = "1";
                                e.currentTarget.style.backgroundColor = `rgba(var(--portfolio-primary-rgb), 0.1)`;
                              }
                            : undefined
                        }
                        onMouseLeave={
                          isPrimary
                            ? (e) => {
                                e.currentTarget.style.borderOpacity = "0.5";
                                e.currentTarget.style.backgroundColor = `rgba(var(--portfolio-primary-rgb), 0.05)`;
                              }
                            : undefined
                        }
                      >
                        <span className="relative z-10">{skill.name}</span>
                        {skill.level && (
                          <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                            ({skill.level})
                          </span>
                        )}
                        <div
                          className="absolute inset-0 -z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          style={{
                            background: `linear-gradient(to right, var(--portfolio-primary)/5, var(--portfolio-primary-dark)/5)`,
                          }}
                        />
                      </span>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Projects Section */}
      <section className="border-b border-slate-200 py-16 dark:border-slate-800/50">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-8 font-mono text-sm tracking-wider text-slate-400 dark:text-slate-500">
            {"// featured_projects"}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {sortedProjects.map((project, idx) => (
              <article
                key={project.id ?? project.name}
                className={cn(
                  "group relative overflow-hidden border p-6 transition-all duration-500 hover:shadow-lg cursor-pointer",
                  radiusClasses,
                  project.featured
                    ? cn(
                        themeColors.border + "/50",
                        "bg-[var(--portfolio-primary)]/5",
                        "dark:bg-[var(--portfolio-primary)]/10"
                      )
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:bg-slate-900/80"
                )}
                onClick={() => {
                  if (slug && project.id) {
                    trackProjectView(slug, project.id);
                  }
                }}
              >
                {/* Featured Badge */}
                {project.featured && (
                  <div
                    className="absolute right-6 top-6 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: `var(--portfolio-primary)`,
                      opacity: 0.1,
                      color: `var(--portfolio-primary)`,
                    }}
                  >
                    <Star
                      className="h-3 w-3"
                      style={{
                        fill: "var(--portfolio-primary)",
                        color: "var(--portfolio-primary)",
                      }}
                    />
                    Featured
                  </div>
                )}

                {/* Project number indicator */}
                {!project.featured && (
                  <span className="absolute right-6 top-6 font-mono text-5xl font-bold text-slate-100 transition-colors duration-500 group-hover:text-slate-200 dark:text-slate-800 dark:group-hover:text-slate-700">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                )}

                <div className="relative space-y-4">
                  {/* Media Preview */}
                  {project.media && project.media.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {project.media.slice(0, 2).map((media, mIdx) => (
                        <div
                          key={mIdx}
                          className="relative aspect-video overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800"
                        >
                          {media.type === "image" ? (
                            <img
                              src={media.url}
                              alt={`${project.name} preview ${mIdx + 1}`}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Video className="h-8 w-8 text-slate-400" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className="text-xl font-bold text-slate-900 transition-colors duration-300 dark:text-white"
                        style={{
                          color: "var(--portfolio-primary)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color =
                            "var(--portfolio-primary)";
                        }}
                      >
                        {project.name}
                      </h3>
                    </div>
                    {project.role && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {project.role}
                      </p>
                    )}
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {project.description}
                    </p>
                  </div>

                  {/* Highlights */}
                  {project.highlights && project.highlights.length > 0 && (
                    <ul className="space-y-1.5">
                      {project.highlights.map((highlight, hIdx) => (
                        <li
                          key={hIdx}
                          className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                        >
                          <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor: "var(--portfolio-primary)",
                            }}
                          />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex gap-4 pt-2">
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:[color:var(--portfolio-primary)] dark:hover:[color:var(--portfolio-primary-dark)]"
                      >
                        <Github className="h-4 w-4" />
                        <span>Source</span>
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:[color:var(--portfolio-primary)] dark:hover:[color:var(--portfolio-primary-dark)]"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Hover gradient */}
                <div
                  className="absolute inset-x-0 bottom-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(to right, transparent, var(--portfolio-primary), transparent)`,
                  }}
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      {experience && experience.length > 0 && (
        <section className="border-b border-slate-200 py-16 dark:border-slate-800/50">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-8 font-mono text-sm tracking-wider text-slate-400 dark:text-slate-500">
              {"// work_history"}
            </h2>
            <div className="relative space-y-8">
              {/* Timeline line */}
              <div
                className="absolute bottom-0 left-[7px] top-2 w-px bg-gradient-to-b via-slate-300 to-transparent dark:via-slate-700"
                style={{
                  background: `linear-gradient(to bottom, var(--portfolio-primary), rgb(203 213 225), transparent)`,
                }}
              />

              {experience.map((exp) => (
                <div
                  key={exp.id ?? `${exp.company}-${exp.role}`}
                  className="relative pl-8"
                >
                  {/* Timeline dot */}
                  <div
                    className="absolute left-0 top-2 h-3.5 w-3.5 rounded-full border-2 bg-white dark:bg-slate-950"
                    style={{
                      borderColor: "var(--portfolio-primary)",
                    }}
                  />

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {exp.role}
                      </h3>
                      <span className="text-slate-400 dark:text-slate-500">
                        @
                      </span>
                      <span
                        className="font-medium"
                        style={{
                          color: "var(--portfolio-primary)",
                        }}
                      >
                        {exp.company}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <p className="font-mono text-xs text-slate-400 dark:text-slate-500">
                        {exp.startDate} →{" "}
                        {exp.current ? "Present" : exp.endDate || "End date"}
                      </p>
                      {exp.location && (
                        <>
                          <span className="text-slate-300 dark:text-slate-700">
                            •
                          </span>
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <MapPin className="h-3 w-3" />
                            {exp.location}
                          </div>
                        </>
                      )}
                      {exp.employmentType && (
                        <>
                          <span className="text-slate-300 dark:text-slate-700">
                            •
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                            {exp.employmentType.replace("_", "-")}
                          </span>
                        </>
                      )}
                    </div>
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-400">
                        {exp.achievements.map((achievement, idx) => (
                          <li key={idx}>{achievement}</li>
                        ))}
                      </ul>
                    )}
                    {exp.description && (
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Education Section */}
      {education && education.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-8 font-mono text-sm tracking-wider text-slate-400 dark:text-slate-500">
              {"// education"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {education.map((edu) => (
                <div
                  key={edu.id ?? edu.school}
                  className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/30"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-mono text-sm font-bold dark:bg-slate-800",
                        radiusClasses
                      )}
                      style={{
                        color: "var(--portfolio-primary)",
                      }}
                    >
                      {edu.school.charAt(0)}
                    </div>
                    <div className="space-y-1 flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {edu.school}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {edu.degree} • {edu.field}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="font-mono text-xs text-slate-400 dark:text-slate-500">
                          {edu.startDate} →{" "}
                          {edu.current ? "Present" : edu.endDate || "End date"}
                        </p>
                        {edu.gpa && (
                          <>
                            <span className="text-slate-300 dark:text-slate-700">
                              •
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              GPA: {edu.gpa.toFixed(2)}
                            </span>
                          </>
                        )}
                      </div>
                      {edu.honors && (
                        <p
                          className="text-xs font-medium"
                          style={{
                            color: "var(--portfolio-primary)",
                          }}
                        >
                          {edu.honors}
                        </p>
                      )}
                      {edu.coursework && edu.coursework.length > 0 && (
                        <div className="pt-1">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                            Relevant Coursework:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {edu.coursework.map((course, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              >
                                {course}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {edu.description && (
                        <p className="pt-1 text-sm text-slate-500">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Certifications Section */}
      {certifications && certifications.length > 0 && (
        <section className="border-b border-slate-200 py-16 dark:border-slate-800/50">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-8 font-mono text-sm tracking-wider text-slate-400 dark:text-slate-500">
              {"// certifications"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {certifications.map((cert) => (
                <div
                  key={cert.id ?? `${cert.name}-${cert.issuer}`}
                  className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-emerald-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/30 dark:hover:border-emerald-500"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        radiusClasses
                      )}
                      style={{
                        backgroundColor: `rgba(var(--portfolio-primary-rgb), 0.1)`,
                      }}
                    >
                      <Award
                        className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"
                        style={{
                          color: "var(--portfolio-primary, #10b981)",
                          stroke: "currentColor",
                          fill: "none",
                        }}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {cert.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {cert.issuer}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="font-mono text-xs text-slate-400 dark:text-slate-500">
                          Issued: {cert.issueDate}
                        </p>
                        {cert.expiryDate && (
                          <>
                            <span className="text-slate-300 dark:text-slate-700">
                              •
                            </span>
                            <p className="font-mono text-xs text-slate-400 dark:text-slate-500">
                              Expires: {cert.expiryDate}
                            </p>
                          </>
                        )}
                      </div>
                      {cert.credentialId && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          ID: {cert.credentialId}
                        </p>
                      )}
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
                          style={{
                            color: "var(--portfolio-primary)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "0.8";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "1";
                          }}
                        >
                          View credential
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 dark:border-slate-800/50">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="font-mono text-xs text-slate-400 dark:text-slate-600">
            Built with{" "}
            <span
              style={{
                color: "var(--portfolio-primary)",
              }}
            >
              QwikFolio.io
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
};
