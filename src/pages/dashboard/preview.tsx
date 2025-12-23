import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePortfolioPreview } from "@/hooks/usePortfolioPreview";
import { PortfolioPreview } from "@/components/preview/PortfolioPreview";
import { useAuthSession } from "@/hooks/useAuthSession";
import { trackResumeDownload } from "@/services/analytics/analyticsService";

const DashboardPreviewPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthSession();
  const { isLoading, portfolio } = usePortfolioPreview();
  const shouldPrint = searchParams.get("print") === "true";

  useEffect(() => {
    if (shouldPrint && portfolio && !isLoading) {
      // Small delay to ensure content is fully rendered
      const timer = setTimeout(async () => {
        // Track download before printing
        if (user?.id) {
          await trackResumeDownload(user.id);
        }

        window.print();
        // Remove print param from URL after triggering print
        navigate("/dashboard/preview", { replace: true });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [shouldPrint, portfolio, isLoading, navigate, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 ">
      <header className="mb-4 border-b border-slate-200 bg-white/80 dark:bg-slate-900/80 dark:border-slate-800 backdrop-blur-md ">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button type="button" className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              QwikFolio.io
            </span>
          </button>
          <div className="flex items-center gap-2 print:hidden">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard/builder")}
            >
              Edit portfolio
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={async () => {
                if (user?.id) {
                  await trackResumeDownload(user.id);
                }
                window.print();
              }}
            >
              Print / Save as PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {portfolio ? (
          <PortfolioPreview portfolio={portfolio} />
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            Your portfolio data is not ready yet. Go back to the builder, add
            your details, and try again.
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPreviewPage;
