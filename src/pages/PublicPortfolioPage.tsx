import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPublicPortfolioByUsername } from "@/services/portfolio/portfolioService";
import { getProfileByUsername } from "@/services/profile/profileService";
import {
  trackPortfolioView,
  trackResumeDownload,
} from "@/services/analytics/analyticsService";
import type { Portfolio } from "@/schemas/portfolio";
import { PortfolioPreview } from "@/components/preview/PortfolioPreview";
import { DevPortfolio } from "@/components/preview/DevPortfolio";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Zap, FileText, Layout } from "lucide-react";

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
        const data = await getPublicPortfolioByUsername(username);
        if (data) {
          setPortfolio(data);

          // Fetch the portfolio owner's profile (not the logged-in user's)
          const ownerProfile = await getProfileByUsername(username);
          if (ownerProfile?.id) {
            setProfileId(ownerProfile.id);
            setAvatarUrl(ownerProfile.avatar_url ?? "");
            await trackPortfolioView(ownerProfile.id);
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
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

          <div className="flex items-center gap-2">
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
              onClick={async () => {
                if (profileId) {
                  await trackResumeDownload(profileId);
                }
                window.print();
              }}
            >
              Download Resume
            </Button>
          </div>
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
