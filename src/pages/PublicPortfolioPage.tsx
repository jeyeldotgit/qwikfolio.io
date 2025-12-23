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
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

const PublicPortfolioPage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

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

          // Get profile and track the view
          const profile = await getProfileByUsername(username);
          if (profile?.id) {
            setProfileId(profile.id);
            await trackPortfolioView(profile.id);
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <button
              type="button"
              className="flex items-center space-x-2"
              onClick={() => navigate("/")}
            >
              <Zap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                QwikFolio.io
              </span>
            </button>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
            Portfolio not found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error ||
              "This portfolio doesn't exist or hasn't been published yet."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Go to homepage
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            type="button"
            className="flex items-center space-x-2"
            onClick={() => navigate("/")}
          >
            <Zap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <span className="text-lg font-semibold text-slate-900 dark:text-white">
              QwikFolio.io
            </span>
          </button>
          <div className="flex items-center gap-2 print:hidden">
            <Button
              type="button"
              size="sm"
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PortfolioPreview portfolio={portfolio} />
      </main>
    </div>
  );
};

export default PublicPortfolioPage;
