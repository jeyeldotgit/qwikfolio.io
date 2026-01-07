import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPublicPortfolioByUsername } from "@/services/portfolio/portfolioService";
import { getProfile } from "@/services/profile/profileService";
import {
  trackPortfolioView,
  trackResumeDownload,
} from "@/services/analytics/analyticsService";
import type { Portfolio } from "@/schemas/portfolio";
import { PortfolioPreview } from "@/components/preview/PortfolioPreview";
import { DevPortfolio } from "@/components/preview/DevPortfolio";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Zap, FileText, Layout, Menu, X, Download } from "lucide-react";

type ViewMode = "portfolio" | "resume";

const PublicPortfolioPage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("portfolio");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!username) {
      setError("Username is required");
      setIsLoading(false);
      return;
    }

    const loadPortfolio = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getPublicPortfolioByUsername(username);
        if (result) {
          const { portfolio, userId } = result;
          setPortfolio(portfolio);

          // Fetch the portfolio owner's profile by userId (works for both username and slug)
          const ownerProfile = await getProfile(userId);
          if (ownerProfile?.id) {
            setProfileId(ownerProfile.id);
            setAvatarUrl(ownerProfile.avatar_url ?? "");
            // Track view with slug if available
            const slug = portfolio.settings?.slug || null;
            await trackPortfolioView(slug, ownerProfile.id);
          }
        } else {
          setError("Portfolio not found");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load portfolio";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadPortfolio();
  }, [username]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 border-2 border-slate-300 border-t-emerald-500 dark:border-slate-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <button
              type="button"
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
              onClick={() => navigate("/")}
            >
              <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                QwikFolio.io
              </span>
            </button>
            <ThemeToggle />
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <span className="text-2xl">🔍</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Portfolio not found
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              {error ||
                "This portfolio doesn't exist or hasn't been published yet."}
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-4 text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium transition-colors"
            >
              ← Go to homepage
            </button>
          </div>
        </main>
      </div>
    );
  }

  const handleDownload = async () => {
    if (profileId) {
      await trackResumeDownload(profileId);
    }
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Dropdown Menu */}
      <div
        className={`fixed right-0 top-14 z-50 w-64 max-w-[85vw] transform border-b border-l border-slate-200 bg-white/95 backdrop-blur-lg transition-all duration-200 ease-out dark:border-slate-800 dark:bg-slate-900/95 md:hidden ${
          mobileMenuOpen
            ? "translate-x-0 opacity-100"
            : "pointer-events-none translate-x-4 opacity-0"
        }`}
      >
        <div className="p-4 space-y-4">
          {/* View Toggle */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
              View Mode
            </span>
            <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => {
                  setViewMode("portfolio");
                  setMobileMenuOpen(false);
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                  viewMode === "portfolio"
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Layout className="h-3.5 w-3.5" />
                Portfolio
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode("resume");
                  setMobileMenuOpen(false);
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                  viewMode === "resume"
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Resume
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
              Actions
            </span>
            <Button
              type="button"
              size="sm"
              className="w-full bg-emerald-600 text-white hover:bg-emerald-500"
              onClick={() => {
                setMobileMenuOpen(false);
                handleDownload();
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Resume
            </Button>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
              Theme
            </span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80 print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            type="button"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
            onClick={() => navigate("/")}
          >
            <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              QwikFolio.io
            </span>
          </button>

          {/* Desktop Controls */}
          <div className="hidden items-center gap-2 md:flex">
            {/* View Toggle */}
            <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setViewMode("portfolio")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === "portfolio"
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Layout className="h-3.5 w-3.5" />
                Portfolio
              </button>
              <button
                type="button"
                onClick={() => setViewMode("resume")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === "resume"
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Resume
              </button>
            </div>

            <ThemeToggle />

            <Button
              type="button"
              size="sm"
              className="bg-emerald-600 text-white hover:bg-emerald-500"
              onClick={handleDownload}
            >
              Download Resume
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      <main>
        {/* Web Portfolio View */}
        {viewMode === "portfolio" && (
          <DevPortfolio portfolio={portfolio} avatar={avatarUrl} />
        )}

        {/* Resume View */}
        {viewMode === "resume" && (
          <div className="py-8 print:py-0">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 print:px-0">
              <PortfolioPreview portfolio={portfolio} />
            </div>
          </div>
        )}

        {/* Hidden print version - always renders resume layout */}
        <div className="hidden print:block">
          <PortfolioPreview portfolio={portfolio} />
        </div>
      </main>
    </div>
  );
};

export default PublicPortfolioPage;
