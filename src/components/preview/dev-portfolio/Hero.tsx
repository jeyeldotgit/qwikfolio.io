import type { Portfolio } from "@/schemas/portfolio";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { MapPin, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSocialLinkIcon, getSocialLinkLabel } from "./social";

type AvailabilityBadge = {
  text: string;
  className: string;
};

type DevPortfolioHeroProps = {
  portfolio: Portfolio;
  avatar: string;
  radiusClasses: string;
  themeColors: { text: string; textDark: string };
  slug: string | null;
  availabilityBadge: AvailabilityBadge | null;
  onSocialClick?: (type: string) => void;
};

export const DevPortfolioHero = ({
  portfolio,
  avatar,
  radiusClasses,
  themeColors,
  slug,
  availabilityBadge,
  onSocialClick,
}: DevPortfolioHeroProps) => {
  const { personalInfo } = portfolio;

  const profilePhoto = personalInfo.profilePhotoUrl || avatar;

  const headlineWithRole = personalInfo.roleLevel
    ? `${
        personalInfo.roleLevel.charAt(0).toUpperCase() +
        personalInfo.roleLevel.slice(1)
      } ${personalInfo.headline}`
    : personalInfo.headline;

  return (
    <header className="relative border-b border-slate-200 dark:border-slate-800/50">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-6">
            {/* Mobile Avatar */}
            <div className="flex items-center gap-4 lg:hidden">
              <div className="relative h-20 w-20 shrink-0 sm:h-24 sm:w-24">
                <div
                  className="absolute inset-0 rounded-xl opacity-10 blur-lg dark:opacity-20"
                  style={{
                    background:
                      "linear-gradient(to bottom right, var(--portfolio-primary), var(--portfolio-primary-dark))",
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
                  <span className="bg-linear-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-transparent dark:from-white dark:via-slate-200 dark:to-slate-400">
                    {personalInfo.name || "Your Name"}
                  </span>
                </h1>
              </div>
            </div>

            {/* Desktop Name */}
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
                <span className="bg-linear-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-transparent dark:from-white dark:via-slate-200 dark:to-slate-400">
                  {personalInfo.name || "Your Name"}
                </span>
              </h1>
            </div>

            {/* Headline + meta */}
            <div className="space-y-2 lg:mt-0 -mt-4">
              <p className="text-xl font-medium text-slate-600 dark:text-slate-300 sm:text-2xl">
                {headlineWithRole || "Developer"}
              </p>

              {(personalInfo.location || availabilityBadge) && (
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  {personalInfo.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{personalInfo.location}</span>
                    </div>
                  )}
                  {availabilityBadge && (
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                        availabilityBadge.className
                      )}
                    >
                      {availabilityBadge.text}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Bio */}
            {personalInfo.bio && (
              <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg">
                {personalInfo.bio}
              </p>
            )}

            {/* Social Links */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-1 sm:flex sm:flex-wrap sm:gap-6">
              {personalInfo.email && (
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="group flex items-center gap-2 text-slate-500 dark:text-slate-400 transition-colors duration-300 hover:text-(--portfolio-primary) dark:hover:text-(--portfolio-primary-dark)"
                  aria-label="Email"
                >
                  <Mail className="h-4 w-4" />
                  <span className="text-sm font-medium">Email</span>
                </a>
              )}

              {personalInfo.socialLinks &&
                personalInfo.socialLinks.length > 0 &&
                personalInfo.socialLinks.map((link, index) => {
                  const Icon = getSocialLinkIcon(link.type);
                  return (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-2 text-slate-500 dark:text-slate-400 transition-colors duration-300 hover:text-(--portfolio-primary) dark:hover:text-(--portfolio-primary-dark)"
                      aria-label={getSocialLinkLabel(link.type)}
                      onClick={() => {
                        if (slug) onSocialClick?.(link.type);
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {getSocialLinkLabel(link.type)}
                      </span>
                    </a>
                  );
                })}

              {(!personalInfo.socialLinks ||
                personalInfo.socialLinks.length === 0) && (
                <>
                  {personalInfo.github && (
                    <a
                      href={personalInfo.github}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-2 text-slate-500 dark:text-slate-400 transition-colors duration-300 hover:text-(--portfolio-primary) dark:hover:text-(--portfolio-primary-dark)"
                      aria-label="GitHub"
                    >
                      {(() => {
                        const Icon = getSocialLinkIcon("github");
                        return <Icon className="h-4 w-4" />;
                      })()}
                      <span className="text-sm font-medium">GitHub</span>
                    </a>
                  )}
                  {personalInfo.linkedin && (
                    <a
                      href={personalInfo.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-2 text-slate-500 dark:text-slate-400 transition-colors duration-300 hover:text-(--portfolio-primary) dark:hover:text-(--portfolio-primary-dark)"
                      aria-label="LinkedIn"
                    >
                      {(() => {
                        const Icon = getSocialLinkIcon("linkedin");
                        return <Icon className="h-4 w-4" />;
                      })()}
                      <span className="text-sm font-medium">LinkedIn</span>
                    </a>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Desktop Avatar */}
          {portfolio.theme?.showProfilePhoto !== false && (
            <div className="hidden lg:block">
              <div className="relative h-48 w-48">
                <div
                  className="absolute inset-0 opacity-10 blur-xl dark:opacity-20"
                  style={{
                    borderRadius: "var(--portfolio-radius)",
                    background:
                      "linear-gradient(to bottom right, var(--portfolio-primary), var(--portfolio-primary-dark))",
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
  );
};


